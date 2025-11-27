"use client";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function UserButton() {
  return (
    <WalletMultiButton style={{
      height: '36px',
      padding: '0 16px',
      borderRadius: '9999px',
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      fontSize: '14px',
      fontWeight: 'bold',
    }} />
  );
}