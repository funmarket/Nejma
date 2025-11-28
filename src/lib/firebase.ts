"use client";

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence,
} from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  if (!getApps().length) return initializeApp(firebaseConfig);
  return getApp();
}

const firebaseApp = getFirebaseApp();
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// 🔥 FIREBASE STUDIO FIX — stops QuotaExceededError and unexpected Firestore crashes
if (typeof window !== "undefined") {
  const isStudio =
    window.location.hostname.includes("cloudworkstations.dev") ||
    window.location.hostname.includes("firebase-studio");

  if (!isStudio) {
    // Normal browsers → enable persistence
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
      if (err.code === "failed-precondition") {
        // Multiple tabs open → fallback to single tab persistence
        enableIndexedDbPersistence(db).catch(() => {});
      }
      // 'unimplemented' = older browser, nothing to do
    });
  } else {
    console.warn("%cFirestore persistence disabled inside Firebase Studio (sandbox).", "color: orange;");
  }
}

// 🔒 NOTE: Firebase Auth remains only for compatibility.
// New login should use Solana wallet adapter.

export { firebaseApp, db, auth };

    