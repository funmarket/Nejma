"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDevapp } from '@/components/providers/devapp-provider';
import { useToast } from '@/components/providers/toast-provider';
import { RENTAL_SUBCATEGORIES } from '@/lib/nejma/constants';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function RentalPage() {
  const { devbaseClient, user } = useDevapp();
  const router = useRouter();
  const { addToast } = useToast();

  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [subcategory, setSubcategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!user) {
        // router.push('/onboarding');
    }
  }, [user, router]);
  
  useEffect(() => {
    const loadRentals = async () => {
      if (!devbaseClient) return;
      setLoading(true);
      try {
        const filters: any = { status: 'active' };
        if (category !== 'all') filters.category = category;
        if (subcategory !== 'all') filters.subCategory = subcategory;
        let allRentals = await devbaseClient.listEntities('rentals', filters);
        
        if (sortBy === 'price_low') allRentals.sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0));
        else if (sortBy === 'price_high') allRentals.sort((a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0));
        else allRentals.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        setRentals(allRentals);
      } catch (error) {
        addToast('Failed to load rentals', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadRentals();
  }, [devbaseClient, category, subcategory, sortBy]);
  
  return (
    <div className="min-h-screen pt-6 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Rental Marketplace</h1>
          <Button onClick={() => router.push('/marketplace/rental/new')} className="bg-accent text-accent-foreground hover:bg-accent/90">
            + List Rental
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
            <Button onClick={() => router.push('/marketplace')} variant="secondary" className="flex-1">Buy Products</Button>
            <Button variant="default" className="flex-1">Rent Equipment</Button>
        </div>

        <div className="flex gap-4 mb-4">
            <Select value={category} onValueChange={val => { setCategory(val); setSubcategory('all'); }}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.keys(RENTAL_SUBCATEGORIES).map(cat => <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>)}
                </SelectContent>
            </Select>
            {category !== 'all' && (
                <Select value={subcategory} onValueChange={setSubcategory}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Subcategory" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Subcategories</SelectItem>
                        {RENTAL_SUBCATEGORIES[category]?.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                    </SelectContent>
                </Select>
            )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground text-sm">{rentals.length} items</p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : rentals.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No rentals yet</h2>
            <p className="text-muted-foreground mb-4">Be the first to list an item for rent!</p>
            <Button onClick={() => router.push('/marketplace/rental/new')}>List Your First Rental</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rentals.map(rental => (
              <Link key={rental.id} href={`/marketplace/rental/${rental.id}`}>
                <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer h-full flex flex-col">
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {rental.images && JSON.parse(rental.images)[0] ? <Image src={JSON.parse(rental.images)[0]} alt={rental.title} width={300} height={300} className="w-full h-full object-cover" /> : <Sparkles className="w-12 h-12 text-primary" />}
                  </div>
                  <CardContent className="p-3 flex-grow flex flex-col">
                    <h3 className="font-bold text-sm mb-1 truncate flex-grow">{rental.title}</h3>
                    <p className="text-primary font-bold text-lg mb-1">{rental.pricePerDay} SOL/day</p>
                    <p className="text-muted-foreground text-xs">{rental.location || 'Location TBD'}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
