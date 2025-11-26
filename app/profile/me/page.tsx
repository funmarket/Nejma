'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserByWallet } from '@/lib/actions/user.actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyProfilePage() {
  const { userWallet, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!userWallet) {
      router.push('/onboarding');
      return;
    }

    const fetchUserAndRedirect = async () => {
      try {
        const user = await getUserByWallet(userWallet);
        if (user?.username) {
          router.replace(`/u/${user.username}`);
        } else {
          // User exists but has no username, or is a 'regular' user.
          // Go to onboarding to create a proper profile.
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Failed to fetch user for redirect:', error);
        router.push('/');
      }
    };

    fetchUserAndRedirect();
  }, [userWallet, router, authLoading]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        <Skeleton className="h-48 w-full" />
        <div className="flex items-center space-x-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
      </div>
    </div>
  );
}
