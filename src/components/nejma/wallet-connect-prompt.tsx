"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserButton } from '@/components/auth/user-button';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type WalletConnectPromptProps = {
  accountType: string;
  onBack: () => void;
};

export function WalletConnectPrompt({ accountType, onBack }: WalletConnectPromptProps) {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const { UserButton } = useUserButton();

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (connected && publicKey && !checking) {
        setChecking(true);
        try {
            const q = query(collection(db, 'users'), where('walletAddress', '==', publicKey.toBase58()));
            const existingUsers = await getDocs(q);
          
            if (existingUsers.empty) {
                router.push(`/create/${accountType}`);
            } else {
                router.push(`/create/${accountType}`);
            }
        } catch (error) {
          console.error('Error checking profile:', error);
          router.push(`/create/${accountType}`);
        } finally {
          setChecking(false);
        }
      }
    };
    checkAndRedirect();
  }, [publicKey, connected, accountType, router, checking]);

  const getAccountTypeDescription = () => {
    switch (accountType) {
      case 'fan': return 'Connect your wallet to create a free Fan account';
      case 'artist': return 'Artists need a wallet to receive payments and bookings';
      case 'business': return 'Connect your wallet to create a business account';
      default: return 'Connect your wallet to continue';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-20 pb-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-500 via-primary to-blue-500 bg-clip-text text-transparent">
            Connect Your Wallet
          </h1>
          <p className="text-muted-foreground text-lg">
            {getAccountTypeDescription()}
          </p>
        </div>
        <div className="bg-card rounded-3xl p-8 md:p-10 border border-border shadow-2xl shadow-primary/10">
          <div className="flex flex-col items-center gap-6">
            <div className="scale-125">
              <UserButton />
            </div>
            <p className="text-muted-foreground text-center text-sm">
              Click above to connect your Solana wallet.
            </p>
            {checking && <p className="text-primary">Checking profile...</p>}
            <Button onClick={onBack} variant="secondary" className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

    