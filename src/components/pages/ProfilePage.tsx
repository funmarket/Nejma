"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';

export function ProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState("Loading profile...");

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      setStatus("Profile not found, redirecting to setup...");
      router.push('/onboarding');
      return;
    }

    if (user.username) {
        setStatus(`Redirecting to @${user.username}...`);
        router.push(`/u/${user.username}`);
    } else {
        setStatus("Profile not complete, redirecting to setup...");
        router.push('/create/fan');
    }

  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-background pt-16 pb-20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}

    