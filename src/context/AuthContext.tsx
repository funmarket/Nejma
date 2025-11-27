'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  type ReactNode,
  useCallback,
} from 'react';
import type { User } from '@/lib/types';
import { getUserByWallet } from '@/lib/actions/user.actions';
import { loginWithWallet, getProvider, setProvider, clearProvider } from '@/lib/wallet/loginWithWallet';
import type { WalletProvider } from '@/lib/wallet/solanaWallet';
import { useToast } from '@/hooks/use-toast';
import { useUser as useFirebaseAuthUser } from '@/firebase'; // Use the user from our Firebase provider
import { getAuth } from 'firebase/auth';

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
  
  const { user: firebaseUser, isUserLoading: isAuthLoading } = useFirebaseAuthUser();

  useEffect(() => {
    const syncUser = async () => {
      if (firebaseUser && firebaseUser.uid.startsWith('wallet_')) {
        const wallet = firebaseUser.uid.replace('wallet_', '');
        setUserWallet(wallet);
        try {
          const userProfile = await getUserByWallet(wallet);
          setCurrentUser(userProfile);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        setUserWallet(null);
      }
      setLoading(false);
    };
    
    if (!isAuthLoading) {
      syncUser();
    }
  }, [firebaseUser, isAuthLoading]);


  const connectWallet = useCallback(async (provider: WalletProvider) => {
    setLoading(true);
    try {
      const { publicKey } = await loginWithWallet(provider);
      setProvider(provider);
      // The useEffect above will handle setting userWallet and currentUser
      // based on the firebaseUser change.
      toast({
        title: 'Wallet Connected',
        description: `Successfully connected.`,
      });
    } catch (e) {
      console.error('Wallet connect failed', e);
      let errorMessage = 'Could not connect to the wallet. Please try again.';
      if (e instanceof Error) {
        if(e.message.includes('User rejected the request')) {
          errorMessage = 'Wallet connection request was rejected.';
        } else if (e.message.includes('internal')) {
            errorMessage = 'An internal error occurred. This could be a CORS issue or a problem with the authentication function. Please try again later.'
        }
      }
      toast({
        title: 'Wallet Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setLoading(false);
    }
  }, [toast]);


  const disconnectWallet = useCallback(async () => {
    setLoading(true);
    const auth = getAuth();
    if (auth.currentUser) {
      await auth.signOut();
    }
    setUserWallet(null);
    setCurrentUser(null);
    clearProvider();
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ userWallet, currentUser, connectWallet, disconnectWallet, loading }),
    [userWallet, currentUser, loading, connectWallet, disconnectWallet]
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
