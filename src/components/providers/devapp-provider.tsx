"use client";

import { useMemo, createContext, useContext } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

// This context remains for any components that need to easily access the user's wallet state.
// The `devbaseClient` has been removed as all data access now goes through Firestore directly.

type AppContextValue = {
  userWallet: string | null;
  user: { uid: string } | null;
  loadingUser: boolean;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function DevappProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connecting } = useWallet();

  const userWallet = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const value = useMemo(
    () => ({
      userWallet: userWallet,
      user: userWallet ? { uid: userWallet } : null,
      loadingUser: connecting,
    }),
    [userWallet, connecting]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Renamed to useApp for clarity, as Dev-app is deprecated.
export function useDevapp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useDevapp must be used within DevappProvider");
  }
  return ctx;
}
