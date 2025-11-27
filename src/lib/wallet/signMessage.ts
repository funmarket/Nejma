import { getWalletAdapter, WalletProvider } from "./solanaWallet";

export const signWalletMessage = async (
  provider: WalletProvider,
  message: string
) => {
  const adapter = getWalletAdapter(provider);

  if (!adapter.connected) {
    await adapter.connect();
  }

  const encodedMessage = new TextEncoder().encode(message);
  const signature = await adapter.signMessage(encodedMessage);

  return Buffer.from(signature).toString("base64");
};
