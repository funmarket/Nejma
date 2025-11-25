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
  const functions = getFunctions();

  const { publicKey } = await connectWallet(provider);

  const message = `Login to Spotly\nWallet: ${publicKey}\nNonce: ${crypto.randomUUID()}`;
  const signature = await signWalletMessage(provider, message);

  const callable = httpsCallable(functions, "solanaLogin");
  
  // The public key needs to be hex for the backend to decode it
  const publicKeyHex = Buffer.from(publicKey, 'utf-8').toString('hex');

  const { token } = (await callable({ publicKey: publicKeyHex, signature, message })).data as { token: string };

  // Firebase Login
  const userCredential = await signInWithCustomToken(auth, token);
  const user = userCredential.user;

  // Save user info
  await setDoc(doc(firestore, "users", user.uid), {
    walletAddress: publicKey,
    provider,
    updatedAt: Date.now(),
  }, { merge: true });

  return { publicKey };
};
