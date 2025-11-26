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
  
  // This hook gets the auth user from the Firebase Provider, not our own state
  const { user: firebaseUser, isUserLoading: isAuthLoading } = useFirebaseAuthUser();

  // Effect to sync our app's user profile with the Firebase auth state
  useEffect(() => {
    const syncUser = async () => {
      // If Firebase has a user and we have a wallet address, fetch the profile
      if (firebaseUser && userWallet) {
        setLoading(true);
        try {
          const userProfile = await getUserByWallet(userWallet);
          setCurrentUser(userProfile);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setCurrentUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        // No firebase user, so clear our app's user state
        setCurrentUser(null);
        setUserWallet(null);
        setLoading(false);
      }
    };
    
    // isAuthLoading tells us when Firebase has finished checking the auth state
    if (!isAuthLoading) {
      syncUser();
    }
  }, [firebaseUser, userWallet, isAuthLoading]);

  // Check for a stored provider on initial load
  useEffect(() => {
    const storedProvider = getProvider();
    if(storedProvider) {
       // If there's a provider, we assume the Firebase onAuthStateChanged 
       // will handle the login and the effect above will fetch the user.
    } else {
        setLoading(false);
    }
  }, []);


  const connectWallet = useCallback(async (provider: WalletProvider) => {
    setLoading(true);
    try {
      const { publicKey } = await loginWithWallet(provider);
      setUserWallet(publicKey); // This will trigger the useEffect to fetch the profile
      setProvider(provider); // Store the provider
      toast({
        title: 'Wallet Connected',
        description: `Successfully connected to wallet: ${publicKey.slice(
          0,
          4
        )}...${publicKey.slice(-4)}`,
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
      setLoading(false); // Ensure loading is false on failure
    }
  }, [toast]);


  const disconnectWallet = useCallback(async () => {
    if (firebaseUser) {
      await firebaseUser.delete(); // This will sign out the user
    }
    setUserWallet(null);
    setCurrentUser(null);
    clearProvider();
  }, [firebaseUser]);

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
