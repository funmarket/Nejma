"use client";

import { useState, useEffect, useMemo, createContext, useContext } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from '@/lib/firebase';
import { devbaseClient } from '@/lib/devbase';

type DevappContextValue = {
  devbaseClient: typeof devbaseClient;
  userWallet: string | null;
  user: FirebaseUser | null;
  loadingUser: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const DevappContext = createContext<DevappContextValue | undefined>(undefined);

export function DevappProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingUser(false);
    });
    return () => unsub();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const value = useMemo(
    () => ({
      devbaseClient,
      userWallet: user?.uid ?? null, // Replaces walletAddress
      user,
      loadingUser,
      signIn,
      signOut,
    }),
    [user, loadingUser]
  );

  return <DevappContext.Provider value={value}>{children}</DevappContext.Provider>;
}

export function useDevapp() {
  const ctx = useContext(DevappContext);
  if (!ctx) {
    throw new Error("useDevapp must be used within DevappProvider");
  }
  return ctx;
}
