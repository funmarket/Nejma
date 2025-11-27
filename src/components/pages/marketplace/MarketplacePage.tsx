"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/toast-provider';
import { MARKETPLACE_SUBCATEGORIES } from '@/lib/nejma/constants';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function MarketplacePage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [subcategory, setSubcategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const filters = [where('status', '==', 'active')];
        if (category !== 'all') filters.push(where('category', '==', category));
        if (subcategory !== 'all') filters.push(where('subcategory', '==', subcategory));

        let sortOrder: any = orderBy('createdAt', 'desc');
        if (sortBy === 'price_low') sortOrder = orderBy('price', 'asc');
        else if (sortBy === 'price_high') sortOrder = orderBy('price', 'desc');
        
        const q = query(collection(db, 'marketplace_products'), ...filters, sortOrder);
        const snapshot = await getDocs(q);
        const allProducts = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
        setProducts(allProducts);
      } catch (error) {
        console.error(error);
        addToast('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [category, subcategory, sortBy, addToast]);

  return (
    <div className="min-h-screen pt-6 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Marketplace</h1>
          <Button onClick={() => router.push('/marketplace/new')} className="bg-accent text-accent-foreground hover:bg-accent/90">
            + Sell Item
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
            <Button variant="default" className="flex-1">Buy Products</Button>
            <Button onClick={() => router.push('/marketplace/rental')} variant="secondary" className="flex-1">Rent Equipment</Button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-2">
            {['all', 'music', 'acting', 'creator'].map(cat => (
                <Button key={cat} onClick={() => { setCategory(cat); setSubcategory('all'); }} variant={category === cat ? 'default' : 'secondary'} className="rounded-full whitespace-nowrap">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
            ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            {category !== 'all' && (
                <Select value={subcategory} onValueChange={setSubcategory}>
                    <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Subcategory" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Subcategories</SelectItem>
                        {MARKETPLACE_SUBCATEGORIES[category]?.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                    </SelectContent>
                </Select>
            )}
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <p className="text-muted-foreground text-sm flex-grow sm:flex-grow-0">{products.length} items</p>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : products.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No products yet</h2>
            <p className="text-muted-foreground mb-4">Be the first to list an item!</p>
            <Button onClick={() => router.push('/marketplace/new')}>List Your First Item</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <Link key={product.id} href={`/marketplace/product/${product.id}`}>
                <Card className="overflow-hidden hover:border-primary transition-all cursor-pointer h-full flex flex-col">
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {product.images && JSON.parse(product.images)[0] ? (
                        <Image src={JSON.parse(product.images)[0]} alt={product.title} width={300} height={300} className="w-full h-full object-cover" />
                    ) : <Sparkles className="w-12 h-12 text-primary" />}
                  </div>
                  <CardContent className="p-3 flex-grow flex flex-col">
                    <h3 className="font-bold text-sm mb-1 truncate flex-grow">{product.title}</h3>
                    <p className="text-primary font-bold text-lg mb-1">{product.price} {product.currency}</p>
                    <p className="text-muted-foreground text-xs capitalize">{product.condition}</p>
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
