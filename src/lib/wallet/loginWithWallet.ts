'use client';
import { httpsCallable } from "firebase/functions";
import { signInWithCustomToken } from "firebase/auth";
import { signWalletMessage } from "@/lib/wallet/signMessage";
import { connectWallet } from "@/lib/wallet/connectWallet";
import { initializeFirebase } from "@/firebase";
import { doc, setDoc, getFunctions } from "firebase/firestore";

export const loginWithWallet = async (provider: 'phantom' | 'solflare' | 'backpack') => {
  const { firestore, auth } = initializeFirebase();
  const functions = getFunctions();

  const { publicKey } = await connectWallet(provider);

  const message = `Login to Nejma\nWallet: ${publicKey}\nNonce: ${crypto.randomUUID()}`;
  const signature = await signWalletMessage(provider, message);

  const callable = httpsCallable(functions, "solanaLogin");
  
  // The type casting here is necessary because the callable function's response data is `unknown`.
  const { token } = (await callable({ publicKey, signature, message })).data as { token: string };

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
