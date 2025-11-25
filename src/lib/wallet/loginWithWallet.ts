'use client';
import { getFunctions, httpsCallable } from "firebase/functions";
import { signInWithCustomToken } from "firebase/auth";
import { signWalletMessage } from "@/lib/wallet/signMessage";
import { connectWallet } from "@/lib/wallet/connectWallet";
import { initializeFirebase } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { WalletProvider } from "./solanaWallet";

export const loginWithWallet = async (provider: WalletProvider) => {
  const { firestore, auth } = initializeFirebase();
  const functions = getFunctions(auth.app);
  
  const { publicKey } = await connectWallet(provider);

  const message = `Login to Spotly\nWallet: ${publicKey}\nNonce: ${crypto.randomUUID()}`;
  const signature = await signWalletMessage(provider, message);
  
  const publicKeyHex = Buffer.from(publicKey, 'utf-8').toString('hex');
  
  const solanaLogin = httpsCallable(functions, 'solanaLogin');
  
  try {
    const result = await solanaLogin({ publicKey: publicKeyHex, signature, message });
    const { token } = result.data as { token: string };

    const userCredential = await signInWithCustomToken(auth, token);
    const user = userCredential.user;

    await setDoc(doc(firestore, "users", user.uid), {
      walletAddress: publicKey,
      provider,
      updatedAt: Date.now(),
    }, { merge: true });

    return { publicKey };

  } catch(error: any) {
    console.error("Firebase function error response:", error);
    // Re-throw a more specific error or the original one
    if (error.code === 'functions/internal' || error.code === 'functions/unavailable') {
        throw new Error('An internal error occurred. This could be a CORS issue or a problem with the authentication function. Please try again later.');
    }
    throw error;
  }
};
