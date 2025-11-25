"use client";

import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import type { User } from '@/lib/types';
import { getUserByWallet } from '@/lib/actions/user.actions';
import { loginWithWallet } from '@/lib/wallet/loginWithWallet';
import type { WalletProvider } from '@/lib/wallet/solanaWallet';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  userWallet: string | null;
  currentUser: User | null;
  connectWallet: (provider: WalletProvider) => Promise<void>;
  disconnectWallet: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  const connectWallet = async (provider: WalletProvider) => {
    try {
      setLoading(true);
      const { publicKey } = await loginWithWallet(provider);
      setUserWallet(publicKey);
    } catch (e) {
      console.error("Wallet connect failed", e);
      toast({
        title: 'Wallet Connection Failed',
        description: 'Could not connect to the wallet. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false);
    }
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
