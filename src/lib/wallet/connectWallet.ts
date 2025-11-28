import { getWalletAdapter, WalletProvider } from "./solanaWallet";

export const connectWallet = async (provider: WalletProvider) => {
  const adapter = getWalletAdapter(provider);

  await adapter.connect();

  return {
    publicKey: adapter.publicKey?.toString()!,
    provider,
  };
};

    