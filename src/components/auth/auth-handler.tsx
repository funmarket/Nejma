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
import { useUser } from "@/hooks/use-user";

export function AuthHandler({ children }: { children: React.ReactNode }) {
  const { publicKey, connected, connecting } = useWallet();
  const { user, loading: userLoading } = useUser();

  const [isEnsuringProfile, setIsEnsuringProfile] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // 1. Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // 2. Profile Creation/Verification Logic
  const ensureUserProfile = useCallback(async () => {
    if (connecting || !connected || !publicKey || userLoading || user) {
      return;
    }
    
    setIsEnsuringProfile(true);
    
    try {
      const wallet = publicKey.toBase58();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("walletAddress", "==", wallet));
      const snap = await getDocs(q);

      if (snap.empty) {
        console.log(`Creating Firestore user for wallet ${wallet}`);
        const username = "user" + wallet.slice(0, 6);
        const newUserDoc = await addDoc(usersRef, {
          walletAddress: wallet,
          username,
          bio: "",
          role: "fan",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await updateDoc(newUserDoc, { userId: newUserDoc.id });
      } else {
        const userDoc = snap.docs[0];
        if (!userDoc.data().userId) {
          await updateDoc(userDoc.ref, { userId: userDoc.id });
        }
      }
    } catch (err) {
      console.error("Error ensuring Firestore profile:", err);
    } finally {
      setIsEnsuringProfile(false);
    }
  }, [connecting, connected, publicKey, user, userLoading]);

  // 3. Trigger Profile Check
  useEffect(() => {
    ensureUserProfile();
  }, [ensureUserProfile]);
  
  // 4. Determine Loading State
  if (showSplash) {
    return <SplashScreen />;
  }

  const showLoading = connecting || (!user && connected && (userLoading || isEnsuringProfile));

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
            {connecting ? "Connecting to wallet..." : "Verifying profile..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
