"use client";
import { useEffect, useState, useCallback } from 'react';
import { SplashScreen } from '../nejma/splash-screen';
import { useWallet } from '@solana/wallet-adapter-react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function AuthHandler({ children }: { children: React.ReactNode }) {
  const { publicKey, connecting, connected } = useWallet();
  const [isEnsuringProfile, setIsEnsuringProfile] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); 

    return () => clearTimeout(splashTimer);
  }, []);

  const ensureUserProfile = useCallback(async () => {
    if (!publicKey || !connected) {
      setIsEnsuringProfile(false);
      return;
    }

    setIsEnsuringProfile(true);
    try {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('walletAddress', '==', publicKey.toBase58()));
      const usersSnapshot = await getDocs(q);
      
      if (usersSnapshot.empty) {
        console.log(`Creating new user profile for wallet: ${publicKey.toBase58()}`);
        const username = `user${publicKey.toBase58().slice(0, 6)}`;
        
        const newUserRef = await addDoc(usersCollection, {
          walletAddress: publicKey.toBase58(),
          username: username,
          bio: '',
          role: 'fan',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await updateDoc(doc(db, 'users', newUserRef.id), { userId: newUserRef.id });
        console.log('User profile created successfully.');
      } else {
        const userDoc = usersSnapshot.docs[0];
        const existingUser = userDoc.data();
        if (!existingUser.userId || existingUser.userId !== userDoc.id) {
          await updateDoc(userDoc.ref, { userId: userDoc.id });
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    } finally {
      setIsEnsuringProfile(false);
    }
  }, [publicKey, connected]);

  useEffect(() => {
    if (!connecting && connected) {
      ensureUserProfile();
    } else if (!connecting && !connected) {
      setIsEnsuringProfile(false);
    }
  }, [connecting, connected, ensureUserProfile]);
  
  if (showSplash) {
    return <SplashScreen />;
  }

  const showLoading = connecting || (connected && isEnsuringProfile);

  if (showLoading) {
    return (
        <div className="flex items-center justify-center bg-background" style={{ height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-foreground">{connecting ? "Connecting to wallet..." : "Verifying profile..."}</p>
            </div>
        </div>
    );
  }

  return <>{children}</>;
}
