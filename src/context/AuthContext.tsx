"use client";

import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import type { User } from '@/lib/types';
import { getUserByWallet } from '@/lib/actions/user.actions';

interface AuthContextType {
  userWallet: string | null;
  currentUser: User | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_WALLET_ADDRESS = "artist_wallet_1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchUser = async () => {
      if (userWallet) {
        try {
          const user = await getUserByWallet(userWallet);
          setCurrentUser(user);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [userWallet]);

  const connectWallet = () => {
    // In a real app, this would involve a wallet adapter like Phantom or Solflare.
    // Here, we just set a mock wallet address.
    setUserWallet(MOCK_WALLET_ADDRESS);
  };

  const disconnectWallet = () => {
    setUserWallet(null);
  };

  const value = useMemo(
    () => ({ userWallet, currentUser, connectWallet, disconnectWallet, loading }),
    [userWallet, currentUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
