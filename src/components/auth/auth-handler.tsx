"use client";

import { useEffect, useState, useCallback } from "react";
import { SplashScreen } from "../nejma/splash-screen";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export function AuthHandler({ children }: { children: React.ReactNode }) {
  const { publicKey, connected, connecting } = useWallet();

  const [isEnsuringProfile, setIsEnsuringProfile] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [walletReady, setWalletReady] = useState(false);

  // ---------- 1. SPLASH ----------
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // ---------- 2. WAIT FOR WALLET TO FINISH INITIALIZING ----------
  useEffect(() => {
    // Wallet adapter can briefly report connected:false while initializing
    if (!connecting && publicKey) {
      setWalletReady(true);
    } else if (!connecting && !publicKey) {
      setWalletReady(false); // not connected, but ready
      setIsEnsuringProfile(false);
    }
  }, [connecting, publicKey]);

  // ---------- 3. CREATE / LOAD FIRESTORE PROFILE ----------
  const ensureUserProfile = useCallback(async () => {
    if (!walletReady || !publicKey) return;

    setIsEnsuringProfile(true);

    try {
      const wallet = publicKey.toBase58();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("walletAddress", "==", wallet));
      const snap = await getDocs(q);

      if (snap.empty) {
        console.log(`Creating Firestore user for wallet ${wallet}`);

        const username = "user" + wallet.slice(0, 6);

        const newUser = await addDoc(usersRef, {
          walletAddress: wallet,
          username,
          bio: "",
          role: "fan",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "users", newUser.id), {
          userId: newUser.id,
        });
      } else {
        // Ensure legacy users have userId
        const docSnap = snap.docs[0];
        const data = docSnap.data();

        if (!data.userId || data.userId !== docSnap.id) {
          await updateDoc(docSnap.ref, { userId: docSnap.id });
        }
      }
    } catch (err) {
      console.error("Error ensuring Firestore profile:", err);
    } finally {
      setIsEnsuringProfile(false);
    }
  }, [walletReady, publicKey]);

  // ---------- 4. RUN PROFILE CHECK WHEN READY ----------
  useEffect(() => {
    if (walletReady && connected) {
      ensureUserProfile();
    }
  }, [walletReady, connected, ensureUserProfile]);

  // ---------- 5. LOADING STATES ----------
  if (showSplash) {
    return <SplashScreen />;
  }

  const showLoading =
    connecting ||
    (walletReady && connected && isEnsuringProfile);

  if (showLoading) {
    return (
      <div
        className="flex items-center justify-center bg-background"
        style={{
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      >
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4 rounded-full"></div>
          <p className="text-foreground">
            {connecting
              ? "Connecting to wallet..."
              : "Verifying profile..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
