import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";

const NETWORK = clusterApiUrl("mainnet-beta");
// or: clusterApiUrl("devnet");

export const connection = new Connection(NETWORK, "confirmed");

export type WalletProvider = "phantom" | "solflare" | "backpack";

export const getWalletAdapter = (provider: WalletProvider) => {
  switch (provider) {
    case "phantom":
      return new PhantomWalletAdapter();
    case "solflare":
      return new SolflareWalletAdapter();
    case "backpack":
      return new BackpackWalletAdapter();
    default:
      throw new Error("Unknown wallet provider");
  }
};
