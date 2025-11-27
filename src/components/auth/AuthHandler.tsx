'use client';
import { useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import SplashScreen from '@/components/shared/SplashScreen';
import AppShell from '@/components/layout/AppShell';
import { checkOrCreateUser } from '@/lib/actions/user.actions';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import type { WalletProvider } from '@/lib/wallet/solanaWallet';

const walletProviders = [
  { name: 'Phantom', key: 'phantom' as WalletProvider },
  { name: 'Solflare', key: 'solflare' as WalletProvider },
  { name: 'Backpack', key: 'backpack' as WalletProvider },
];

export default function AuthHandler({ children }: { children: ReactNode }) {
  const { userWallet, loading: authLoading } = useAuth();
  const [isSyncingProfile, setIsSyncingProfile] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2000); // 2 seconds splash
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (showSplash || authLoading) return;

    const ensureUserProfile = async () => {
      setIsSyncingProfile(true);
      if (userWallet) {
        try {
          await checkOrCreateUser(userWallet);
        } catch (error) {
          console.error("Error ensuring user profile:", error);
        }
      }
      setIsSyncingProfile(false);
    };
    
    ensureUserProfile();
  }, [userWallet, authLoading, showSplash]);

  const isLoading = showSplash || authLoading || (isSyncingProfile && userWallet);
  
  if (isLoading) {
      return <SplashScreen />;
  }

  // A simple wallet connection prompt for demo purposes
  const isAuthWall = ['/submit-video', '/profile/me', '/create/'].some(p => pathname.startsWith(p));
  if(isAuthWall && !userWallet) {
      return <WalletConnectPrompt onBack={() => window.history.back()} />
  }

  return <AppShell>{children}</AppShell>;
}

function WalletConnectPrompt({ onBack }: { onBack: () => void }) {
    const { connectWallet, loading } = useAuth();
    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-20 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                    Connect Your Wallet
                </h1>
                <p className="text-white/60 text-lg mb-8">
                    Connect your wallet to access this feature.
                </p>
                <div className="bg-gray-900/80 rounded-3xl p-8 border border-white/10 shadow-lg">
                    <div className="flex flex-col items-center gap-4">
                        {walletProviders.map((p) => (
                            <Button
                                key={p.key}
                                onClick={() => connectWallet(p.key)}
                                size="lg"
                                className="w-full max-w-xs font-bold"
                                disabled={loading}
                            >
                                {loading ? 'Connecting...' : `Connect ${p.name}`}
                            </Button>
                        ))}
                        <Button onClick={onBack} variant="ghost" className="mt-4">Go Back</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}