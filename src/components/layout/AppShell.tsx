'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TopCategoryMenu from './TopCategoryMenu';
import BottomNav from './BottomNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideNavForPaths = ['/onboarding', '/create/'];
  const hideNav = hideNavForPaths.some(p => pathname.startsWith(p));
  const isVideoFeed = pathname === '/';

  return (
    <div className="min-h-screen bg-black">
      {!hideNav && <TopCategoryMenu />}
      <main
        className={`bg-background min-h-screen ${
          !hideNav && !isVideoFeed ? 'pt-12 sm:pt-14' : ''
        } ${!hideNav ? 'pb-16 sm:pb-20' : ''}`}
      >
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
