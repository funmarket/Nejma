"use client";

import { createContext } from 'react';
import { useUser } from '@/hooks/use-user';

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
