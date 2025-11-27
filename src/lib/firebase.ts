
"use client";
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const firebaseApp = getFirebaseApp();
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// This is a workaround for a known issue with Firestore and hot-reloading
// in Next.js. It prevents the app from crashing during development.
// It also disables persistence in Firebase Studio to avoid QuotaExceededError.
if (typeof window !== 'undefined') {
  const isStudio =
    window.location.hostname.includes("cloudworkstations.dev") ||
    window.location.hostname.includes("firebase-studio");

  if (!isStudio) {
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
      }
    });
  }
}

// NOTE: The Firebase Auth logic is being deprecated in favor of Solana Wallet Adapter.
// The `auth` export is kept for now to prevent breaking other parts of the app that
// might still reference it, but it should not be used for new authentication features.

export { firebaseApp, db, auth };
