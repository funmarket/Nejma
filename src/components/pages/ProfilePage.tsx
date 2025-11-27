"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDevapp } from '@/components/providers/devapp-provider';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function ProfilePage() {
  const { user, loadingUser } = useDevapp();
  const router = useRouter();
  const [status, setStatus] = useState("Loading profile...");

  useEffect(() => {
    if (loadingUser) {
      return;
    }
    if (!user) {
      router.push('/onboarding');
      return;
    }

    const loadUser = async () => {
      if (!user) return;
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('walletAddress', '==', user.uid));
        const userSnapshot = await getDocs(q);

        if (userSnapshot.empty || !userSnapshot.docs[0].data().username) {
          setStatus("Profile not found, redirecting to setup...");
          router.push('/create/fan');
        } else {
          const userProfile = userSnapshot.docs[0].data();
          setStatus(`Redirecting to @${userProfile.username}...`);
          router.push(`/u/${userProfile.username}`);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setStatus("Error loading profile, redirecting...");
        router.push('/onboarding');
      }
    };

    loadUser();
  }, [user, loadingUser, router]);

  return (
    <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
