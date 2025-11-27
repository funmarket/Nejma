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
import { initiateAnonymousSignIn, initiateEmailSignIn, initiateEmailSignUp } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useUser as useFirebaseAuthUser } from '@/firebase';
import { getAuth } from 'firebase/auth';

interface AuthContextType {
  userWallet: string | null; // This might be deprecated if we move away from wallet as primary ID
  currentUser: User | null;
  connectWallet: (provider: any) => Promise<void>; // Make provider more generic or remove
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
      if (firebaseUser && firebaseUser.uid) {
        // Assuming walletAddress is stored on the user document in Firestore
        // and can be fetched using the UID. This is a placeholder for that logic.
        const userProfile = await getUserByWallet(firebaseUser.uid); // This needs to be adapted
        if (userProfile) {
            setCurrentUser(userProfile);
            setUserWallet(userProfile.walletAddress);
        } else {
            // Handle case where Firebase user exists but profile doesn't
            setCurrentUser(null);
            setUserWallet(null);
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

  const connectWallet = useCallback(async (provider: any) => {
    setLoading(true);
    try {
      // This logic needs to be entirely replaced with a Firebase-centric approach
      // For now, we simulate a successful connection and rely on anonymous auth
      const auth = getAuth();
      if (!auth.currentUser) {
          initiateAnonymousSignIn(auth);
      }
      addToast('Session initialized.', 'success');

      // The onAuthStateChanged listener will handle the rest.
      // We don't have a wallet to set here anymore in this flow.
      
    } catch (e) {
      console.error('Connection failed', e);
      addToast('Could not start a session.', 'error');
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
