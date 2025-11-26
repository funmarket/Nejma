"use client";
import { useEffect, useState } from 'react';
import { useDevapp } from '@/components/providers/devapp-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { SplashScreen } from '../nejma/splash-screen';

export function AuthHandler({ children }: { children: React.ReactNode }) {
  const { devbaseClient, user, loadingUser } = useDevapp();
  const [isEnsuringProfile, setIsEnsuringProfile] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); 

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    const ensureUserProfile = async () => {
      if (loadingUser || showSplash) {
        return;
      }
      
      if (user && devbaseClient) {
        setIsEnsuringProfile(true);
        try {
          const usersList = await devbaseClient.listEntities('users', { walletAddress: user.uid });
          if (usersList.length === 0) {
            console.log(`Creating new user profile for wallet: ${user.uid}`);
            const username = user.displayName?.replace(/\s/g, '') || `user${user.uid.slice(0, 6)}`;
            const photoURL = user.photoURL;

            const newUser = await devbaseClient.createEntity('users', {
              walletAddress: user.uid,
              email: user.email,
              username: username,
              profilePhotoUrl: photoURL,
              bio: '',
              role: 'regular',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            await devbaseClient.updateEntity('users', newUser.id, { userId: newUser.id });
            console.log('User profile created successfully.');
          } else {
            const existingUser = usersList[0];
            if (!existingUser.userId || existingUser.userId !== existingUser.id) {
              await devbaseClient.updateEntity('users', existingUser.id, { userId: existingUser.id });
            }
          }
        } catch (error) {
          console.error('Error ensuring user profile:', error);
        } finally {
          setIsEnsuringProfile(false);
        }
      } else {
        setIsEnsuringProfile(false);
      }
    };
    ensureUserProfile();
  }, [user, devbaseClient, loadingUser, showSplash]);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (loadingUser || isEnsuringProfile) {
    return (
        <div className="flex items-center justify-center bg-background" style={{ height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-foreground">Loading user profile...</p>
            </div>
        </div>
    );
  }

  return <>{children}</>;
}
