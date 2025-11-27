'use client';
import { signInAnonymously } from "firebase/auth";
import { connectWallet } from "@/lib/wallet/connectWallet";
import { getAuth } from 'firebase/auth';
import type { WalletProvider } from "./solanaWallet";

const PROVIDER_KEY = 'spotly_wallet_provider';

export function setProvider(provider: WalletProvider) {
    localStorage.setItem(PROVIDER_KEY, provider);
}
export function getProvider(): WalletProvider | null {
    return localStorage.getItem(PROVIDER_KEY) as WalletProvider | null;
}
export function clearProvider() {
    localStorage.removeItem(PROVIDER_KEY);
}

export const loginWithWallet = async (provider: WalletProvider) => {
  const auth = getAuth();
  
  // 1. Connect to the Solana wallet
  const { publicKey } = await connectWallet(provider);

  // 2. Sign in to Firebase Anonymously
  // This creates a temporary, secure user session on the client-side
  // without needing any backend calls during the login phase.
  try {
    await signInAnonymously(auth);
    
    // The onAuthStateChanged listener in AuthContext will now pick up this user,
    // and we can proceed with profile creation/fetching linked to their UID.
    // The user's Solana wallet public key is the primary identifier.

    return { publicKey };

  } catch(error: any) {
    console.error("Firebase anonymous sign-in error:", error);
    throw new Error('Failed to create a secure session. Please try again.');
  }
};
