"use client";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function useUserButton() {
  const CustomWalletMultiButton = () => (
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
  
  return { UserButton: CustomWalletMultiButton };
}

export function UserButton() {
    const { UserButton: CustomButton } = useUserButton();
    return <CustomButton />;
}
