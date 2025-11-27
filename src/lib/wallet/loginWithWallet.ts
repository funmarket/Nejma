'use client';
import { signInWithCustomToken } from "firebase/auth";
import { signWalletMessage } from "@/lib/wallet/signMessage";
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
  const auth = getAuth(); // Get auth from the provider
  
  const { publicKey } = await connectWallet(provider);

  const message = `Login to Spotly\nWallet: ${publicKey}\nNonce: ${crypto.randomUUID()}`;
  const signature = await signWalletMessage(provider, message);
  
  const publicKeyHex = Buffer.from(publicKey, 'utf-8').toString('hex');
  
  // Use a standard fetch to call the onRequest function
  const functionUrl = `https://us-central1-${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/solanaLogin`;

  try {
    const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicKey: publicKeyHex, signature, message }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get custom token.');
    }
    
    const { token } = await response.json();

    await signInWithCustomToken(auth, token);

    return { publicKey };

  } catch(error: any) {
    console.error("Firebase function error response:", error);
    if (error.message.includes('Failed to fetch')) {
        throw new Error('An internal error occurred. This could be a CORS issue or a problem with the authentication function. Please try again later.');
    }
    throw error;
  }
};
