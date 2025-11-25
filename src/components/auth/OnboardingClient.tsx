'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

function ChoiceButton({ label, subLabel, gradient, onClick }: { label: string, subLabel: string, gradient: string, onClick: () => void }) {
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

function WalletConnectPrompt({ onBack, onConnect }: { onBack: () => void, onConnect: () => void }) {
    return (
        <div className="max-w-2xl w-full mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                    Connect Your Wallet
                </h1>
                <p className="text-white/60 text-lg">
                    Connect your wallet to create your account.
                </p>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 
            border border-white/10 shadow-[0_20px_60px_rgb(0,0,0,0.3)]">
                <div className="flex flex-col items-center gap-6">
                    <Button onClick={onConnect} size="lg" className="scale-110">Connect Wallet</Button>
                    <p className="text-white/60 text-center text-sm">
                        Click above to connect your Solana wallet (mock).
                    </p>
                    <Button onClick={onBack} variant="ghost" className="text-sm">
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}


export default function OnboardingClient() {
    const { userWallet, connectWallet } = useAuth();
    const router = useRouter();
    const [showWalletConnect, setShowWalletConnect] = useState<string | null>(null);

    const handleRoleClick = (role: string) => {
        if (!userWallet) {
            setShowWalletConnect(role);
        } else {
            router.push(`/create/${role}`);
        }
    };
    
    const handleConnectAndRedirect = () => {
        connectWallet();
        if (showWalletConnect) {
            router.push(`/create/${showWalletConnect}`);
        }
    };

    if (showWalletConnect) {
        return (
            <div className="min-h-screen bg-black text-white pt-20 pb-20 flex items-center justify-center px-4">
                <WalletConnectPrompt 
                    onBack={() => setShowWalletConnect(null)}
                    onConnect={handleConnectAndRedirect}
                />
            </div>
        );
    }
  
    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-20 flex items-center justify-center px-4">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                        Join Spotly
                    </h1>
                    <p className="text-white/60 text-lg">Create your profile to get started</p>
                </div>
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 
                    border border-white/10 shadow-[0_20px_60px_rgb(0,0,0,0.3)]">
                    <div className="space-y-6">
                        <ChoiceButton
                            label="Regular User"
                            subLabel="Watch and vote — no account needed"
                            gradient="from-blue-500 via-cyan-500 to-blue-400"
                            onClick={() => router.push('/')}
                        />
                        <ChoiceButton
                            label="Fan (Free Account)"
                            subLabel="Unlimited voting + messaging"
                            gradient="from-green-500 via-cyan-500 to-blue-400"
                            onClick={() => handleRoleClick('fan')}
                        />
                        <ChoiceButton
                            label="Artist / Talent"
                            subLabel="Showcase your talent and get discovered"
                            gradient="from-pink-500 via-purple-500 to-blue-500"
                            onClick={() => handleRoleClick('artist')}
                        />
                        <ChoiceButton
                            label="Business / Producer"
                            subLabel="Discover and hire talent"
                            gradient="from-yellow-500 via-orange-500 to-yellow-600"
                            onClick={() => handleRoleClick('business')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
