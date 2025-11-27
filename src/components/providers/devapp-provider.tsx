"use client";

import { useMemo, createContext, useContext } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { devbaseClient } from '@/lib/devbase';

type DevappContextValue = {
  devbaseClient: typeof devbaseClient;
  userWallet: string | null;
  // Deprecating Firebase user object
  user: { uid: string } | null;
  loadingUser: boolean;
  // Deprecating Firebase signIn/signOut
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const DevappContext = createContext<DevappContextValue | undefined>(undefined);

export function DevappProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connecting } = useWallet();

  const userWallet = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const value = useMemo(
    () => ({
      devbaseClient,
      userWallet: userWallet,
      // Adapt `user` object to maintain compatibility with existing code that uses `user.uid`
      user: userWallet ? { uid: userWallet } : null,
      loadingUser: connecting,
      signIn: async () => { console.warn("signIn is deprecated. Use Solana Wallet Adapter.") },
      signOut: async () => { console.warn("signOut is deprecated. Use Solana Wallet Adapter.") },
    }),
    [userWallet, connecting]
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