"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { UserButton } from '@/components/auth/user-button';
import { cn } from '@/lib/utils';

type TopCategoryMenuProps = {
  activeFeedTab: string;
  setActiveFeedTab: (tab: string) => void;
};

export function TopCategoryMenu({ activeFeedTab, setActiveFeedTab }: TopCategoryMenuProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleCategoryClick = (cat: string) => {
    setActiveFeedTab(cat);
    router.push('/');
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "music": return "Music";
      case "acting": return "Acting";
      case "creator": return "Creator";
      case "rising": return "Rising Stars";
      default: return "";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-12 flex items-center justify-between gap-1 sm:gap-2">
        <Link href="/" className="font-black text-xl flex-shrink-0 bg-gradient-to-r from-primary via-pink-500 to-orange-500 bg-clip-text text-transparent">
          NEJMA
        </Link>
        
        <div className="flex-1 flex justify-center items-center overflow-x-auto scrollbar-hide px-2">
          <div className="flex gap-1 sm:gap-2">
            {["music", "acting", "creator", "rising"].map(cat => (
              <button 
                key={cat} 
                onClick={() => handleCategoryClick(cat)} 
                className={cn(
                    'rounded-full font-bold whitespace-nowrap transition-all duration-200 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm',
                    activeFeedTab === cat 
                        ? 'bg-primary/20 text-primary border border-primary/50' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {getTabLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex gap-2 items-center">
              <input 
                type="text" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search..." 
                className="bg-muted text-foreground px-3 py-1 rounded-lg text-sm outline-none ring-primary focus:ring-2 w-32 sm:w-48 transition-all" 
                autoFocus 
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground">
              <Search size={18} />
            </button>
          )}
          <UserButton />
        </div>
      </div>
    </header>
  );
}
