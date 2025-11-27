'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TopCategoryMenu() {
  const { activeFeedTab, setActiveFeedTab } = useAppContext();
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
      case 'music': return 'Music';
      case 'acting': return 'Acting';
      case 'creator': return 'Creator';
      case 'rising': return 'Rising Stars';
      default: return '';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 h-12 sm:h-14 flex items-center justify-between gap-1 sm:gap-2">
        <Link href="/" className="font-black flex-shrink-0 text-xl md:text-2xl" style={{
          background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          NEJMA
        </Link>
        
        <div className="flex-1 flex justify-center items-center overflow-hidden mx-2">
          {!searchOpen && ['music', 'acting', 'creator', 'rising'].map(cat => (
            <Button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              variant="ghost"
              className={`rounded-full font-bold whitespace-nowrap transition-all text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 ${
                activeFeedTab === cat ? 'bg-primary/20 text-primary-foreground border border-primary/50' : 'text-gray-400 hover:text-white'
              }`}
            >
              {getTabLabel(cat)}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex gap-2 items-center">
              <Input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-gray-800 text-white px-3 py-1 h-8 rounded-lg text-sm outline-none w-32 sm:w-48"
                autoFocus
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-white h-8 w-8">
                <X size={16} />
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="text-gray-400 hover:text-white h-9 w-9">
              <Search size={18} className="sm:w-5 sm:h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
