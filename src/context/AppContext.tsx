"use client";

import { createContext, useContext, useState, type Dispatch, type SetStateAction } from 'react';

interface AppContextType {
  activeFeedTab: string;
  setActiveFeedTab: Dispatch<SetStateAction<string>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeFeedTab, setActiveFeedTab] = useState('music');
  return (
    <AppContext.Provider value={{ activeFeedTab, setActiveFeedTab }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
