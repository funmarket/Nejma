"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Star, MessageSquare, Plus, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const MarketIcon = ({ size = 20, className = '', isActive = false }) => {
  const activeColor = "hsl(var(--primary))";
  const inactiveColor = "hsl(var(--muted-foreground))";
  
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={isActive ? activeColor : inactiveColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className, isActive ? "text-primary" : "text-muted-foreground")}>
      <path d="M2 10l10-7 10 7"/>
      <path d="M4 10v11h16V10"/>
      <path d="M10 15v6h4v-6" fill={isActive ? activeColor : "none"}/>
    </svg>
  );
};


export function BottomNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const iconSize = isMobile ? 20 : 24;

  const navItems = [
    { href: '/', icon: Star, label: 'Home', activeCondition: pathname === '/' },
    { href: '/marketplace', icon: MarketIcon, label: 'Market' },
    { href: '/submit-video', icon: Plus, label: 'Upload' },
    { href: '/gossip', icon: MessageSquare, label: 'Gossip' },
    { href: '/profile/me', icon: UserIcon, label: 'Profile', activePath: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border z-40">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map(item => {
          const isActive = item.activeCondition ?? pathname.startsWith(item.activePath || item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex flex-col items-center justify-center gap-1 transition-colors",
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}>
              <Icon size={iconSize} {...(item.icon === MarketIcon && { isActive })} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
