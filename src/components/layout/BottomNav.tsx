'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageSquare, Plus, User, Star } from 'lucide-react';
import { MarketIcon } from '../icons/MarketIcon';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Star, active: pathname === '/' },
    { path: '/marketplace', label: 'Market', icon: MarketIcon, active: isActive('/marketplace') },
    { path: '/submit-video', label: 'Upload', icon: Plus, active: isActive('/submit-video') },
    { path: '/gossip', label: 'Gossip', icon: MessageSquare, active: isActive('/gossip') },
    { path: '/profile/me', label: 'Profile', icon: User, active: isActive('/profile') || isActive('/u/') },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/10 z-50">
      <div className="flex justify-around items-center px-2 sm:px-4 py-2 sm:py-3 max-w-md mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const activeColor = 
            item.path === '/' ? 'text-yellow-400' :
            item.path === '/marketplace' ? 'text-pink-500' :
            item.path === '/submit-video' ? 'text-green-400' :
            item.path === '/gossip' ? 'text-white' :
            item.path === '/profile/me' ? 'text-white' :
            'text-gray-500';

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-colors ${
                item.active ? activeColor : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs font-medium">
                {item.path === '/gossip' && item.active ? (
                  <>
                    <span className="text-pink-500">G</span><span>ossip</span>
                  </>
                ) : (
                  item.label
                )}
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}
