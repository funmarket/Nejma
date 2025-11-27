"use client";

import { useState, useEffect, useContext } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AuthContext } from '@/components/providers/auth-provider';

export function useUser() {
    const { publicKey } = useWallet();
    const [user, setUser] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!publicKey) {
            setUser(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, 'users'), where('walletAddress', '==', publicKey.toBase58()));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const userDoc = snapshot.docs[0];
                setUser({ id: userDoc.id, ...userDoc.data() });
            } else {
                setUser(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch user:", error);
            setUser(null);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [publicKey]);

    return { user, loading };
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
