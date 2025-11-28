
"use client";

import { usePathname } from 'next/navigation';
import { BottomNav } from './bottom-nav';
import { TopCategoryMenu } from './top-category-menu';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideNavPaths = ['/onboarding', '/create/'];
  const hideNav = hideNavPaths.some(path => pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      { !hideNav && <TopCategoryMenu />}
      <main className={`${!hideNav ? 'pt-12' : ''} pb-16 sm:pb-20 bg-background min-h-screen`}>
        {children}
      </main>
      { !hideNav && <BottomNav />}
    </div>
  );
}

    