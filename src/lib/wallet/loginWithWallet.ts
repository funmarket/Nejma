'use client';
import { getFunctions } from "firebase/functions";
import { signInWithCustomToken } from "firebase/auth";
import { signWalletMessage } from "@/lib/wallet/signMessage";
import { connectWallet } from "@/lib/wallet/connectWallet";
import { initializeFirebase } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { WalletProvider } from "./solanaWallet";

// Use a global variable to store the function URL to avoid re-fetching on every call
let solanaLoginUrl: string | null = null;

// This function dynamically constructs the function URL.
// In a real production app, this would likely be a static environment variable.
function getFunctionUrl(region: string, projectId: string, functionName: string): string {
    if (!solanaLoginUrl) {
      solanaLoginUrl = `https://${region}-${projectId}.cloudfunctions.net/${functionName}`;
    }
    return solanaLoginUrl;
}

export const loginWithWallet = async (provider: WalletProvider) => {
  const { firestore, auth, firebaseApp } = initializeFirebase();
  const functions = getFunctions(firebaseApp); // Pass app instance
  
  const { publicKey } = await connectWallet(provider);

  const message = `Login to Spotly\nWallet: ${publicKey}\nNonce: ${crypto.randomUUID()}`;
  const signature = await signWalletMessage(provider, message);
  
  const publicKeyHex = Buffer.from(publicKey, 'utf-8').toString('hex');
  
  const functionUrl = getFunctionUrl(functions.region, firebaseApp.options.projectId!, 'solanaLogin');

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicKey: publicKeyHex, signature, message }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Request failed with status ${response.status}`);
  }

  const { token } = (await response.json()) as { token: string };

  const userCredential = await signInWithCustomToken(auth, token);
  const user = userCredential.user;

  await setDoc(doc(firestore, "users", user.uid), {
    walletAddress: publicKey,
    provider,
    updatedAt: Date.now(),
  }, { merge: true });

  return { publicKey };
};
