'use client';
import { signInAnonymously } from "firebase/auth";
import { getAuth } from 'firebase/auth';

// This function is now simplified to only handle Firebase anonymous sign-in.
// The wallet connection part is handled by the wallet adapter's UI and hooks.
export const loginWithWallet = async () => {
  const auth = getAuth();
  
  // Sign in to Firebase Anonymously.
  // This creates a temporary, secure user session on the client-side
  // without needing any backend calls during the login phase.
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    // The onAuthStateChanged listener in FirebaseProvider will now pick up this user.
    // The publicKey is no longer returned from here. It is managed by the wallet adapter context.
    return { success: true };

  } catch(error: any) {
    console.error("Firebase anonymous sign-in error:", error);
    throw new Error('Failed to create a secure session. Please try again.');
  }
};
