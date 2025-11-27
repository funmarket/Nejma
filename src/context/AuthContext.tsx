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
import { useToast } from '@/components/providers/toast-provider';
import { useUser as useFirebaseAuthUser } from '@/firebase'; 
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
  const { addToast } = useToast();
  
  const { user: firebaseUser, isUserLoading: isAuthLoading } = useFirebaseAuthUser();

  useEffect(() => {
    const syncUser = async () => {
      // Use the wallet provider from local storage to get the public key
      // This is more reliable than deriving from firebaseUser after anonymous auth
      const provider = getProvider();
      if (provider) {
        // Here we'd ideally get the publicKey without reconnecting
        // For now, we assume the wallet adapter state is managed elsewhere or we just fetch based on what we have
        // This part becomes simpler as we just need to know *if* we are logged in.
      }
      
      if (firebaseUser) {
        // If we have a firebase user, we proceed.
        // For this app, the wallet connection is the source of truth.
        // Let's assume if we have a firebase user, we previously connected a wallet.
        // A better approach might be to store publicKey in sessionStorage upon connect.
        const storedWallet = localStorage.getItem('spotly_wallet_address'); // A temporary solution
        if (storedWallet) {
          setUserWallet(storedWallet);
          try {
            const userProfile = await getUserByWallet(storedWallet);
            setCurrentUser(userProfile);
          } catch (error) {
            console.error("Failed to fetch user profile:", error);
            setCurrentUser(null);
          }
        }
      } else {
        setCurrentUser(null);
        setUserWallet(null);
        localStorage.removeItem('spotly_wallet_address');
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
      localStorage.setItem('spotly_wallet_address', publicKey); // Store wallet address
      setUserWallet(publicKey);
      
      // Now that we are logged in, fetch the profile
      const userProfile = await getUserByWallet(publicKey);
      setCurrentUser(userProfile);

      addToast('Wallet Connected', 'success');
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
      addToast(errorMessage, 'error');
    } finally {
        setLoading(false);
    }
  }, [addToast]);


  const disconnectWallet = useCallback(async () => {
    setLoading(true);
    const auth = getAuth();
    if (auth.currentUser) {
      await auth.signOut();
    }
    setUserWallet(null);
    setCurrentUser(null);
    clearProvider();
    localStorage.removeItem('spotly_wallet_address');
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
