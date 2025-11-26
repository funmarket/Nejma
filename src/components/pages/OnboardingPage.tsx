"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDevapp } from '@/components/providers/devapp-provider';
import { WalletConnectPrompt } from '@/components/nejma/wallet-connect-prompt';
import { Button } from '@/components/ui/button';

function ChoiceButton({ label, subLabel, gradient, onClick }: { label:string, subLabel:string, gradient:string, onClick:()=>void }) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full bg-gradient-to-br ${gradient} rounded-full py-4 px-6 
        transform transition-all duration-200 ease-out
        hover:scale-[1.02] active:scale-[0.98]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_15px_rgba(0,0,0,0.3)] 
        hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_20px_rgba(0,0,0,0.4)]
        active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2)]
        border border-white/20`}
    >
      <div className="relative z-10">
        <h3 className="text-lg font-extrabold text-white mb-1 tracking-tight
          [text-shadow:0_2px_4px_rgba(0,0,0,0.5),0_-1px_1px_rgba(255,255,255,0.2)]
          group-active:[text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
          {label}
        </h3>
        <p className="text-xs text-white/90 font-medium
          [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
          {subLabel}
        </p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10 
        opacity-60 rounded-full pointer-events-none" />
    </button>
  );
}

export function OnboardingPage() {
  const { user } = useDevapp();
  const router = useRouter();
  const [showWalletConnect, setShowWalletConnect] = useState<string | null>(null);

  const handleRoleClick = (role: string) => {
    if (!user) {
      setShowWalletConnect(role);
      return;
    }
    router.push(`/create/${role}`);
  };

  if (showWalletConnect) {
    return <WalletConnectPrompt accountType={showWalletConnect} onBack={() => setShowWalletConnect(null)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-20 pb-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-500 via-primary to-blue-500 bg-clip-text text-transparent">
            Join NEJMA
          </h1>
          <p className="text-muted-foreground text-lg">Create your profile to get started</p>
        </div>
        <div className="bg-card rounded-3xl p-6 md:p-8 border border-border/50 shadow-2xl shadow-primary/10">
          <div className="space-y-4">
            <ChoiceButton label="Regular User" subLabel="Watch and vote — no account needed" gradient="from-blue-500 via-cyan-500 to-blue-400" onClick={() => router.push('/')} />
            <ChoiceButton label="Fan (Free Account)" subLabel="Unlimited voting + messaging" gradient="from-green-500 via-cyan-500 to-blue-400" onClick={() => handleRoleClick('fan')} />
            <ChoiceButton label="Artist / Talent" subLabel="Showcase your talent and get discovered" gradient="from-pink-500 via-primary to-blue-500" onClick={() => handleRoleClick('artist')} />
            <ChoiceButton label="Business / Producer" subLabel="Discover and hire talent" gradient="from-yellow-500 via-orange-500 to-yellow-600" onClick={() => handleRoleClick('business')} />
          </div>
        </div>
      </div>
    </div>
  );
}
