'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, ShoppingCart, Tag, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type MarketplaceItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory: string;
  imageUrl: string;
  imageHint: string;
  seller: string;
  sellerAvatar: string;
};

interface MarketplaceClientProps {
  items: MarketplaceItem[];
  categories: string[];
  subcategories: Record<string, string[]>;
}

function ItemCard({ item }: { item: MarketplaceItem }) {
  return (
    <Card className="overflow-hidden bg-muted border-border hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 group">
      <CardHeader className="p-0">
        <div className="aspect-w-16 aspect-h-9 relative">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={item.imageHint}
          />
           <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-full">
            ${item.price}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <CardTitle className="text-lg leading-tight line-clamp-2 h-[2.5em]">
          {item.name}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tag className="w-4 h-4 text-primary" />
          <span className="capitalize">{item.category}</span>
          <span>&middot;</span>
          <span className="capitalize">{item.subcategory}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
         <div className="flex items-center gap-2">
           <Image src={item.sellerAvatar} alt={item.seller} width={24} height={24} className="rounded-full" data-ai-hint="person avatar" />
           <span className="text-xs text-muted-foreground font-medium">{item.seller}</span>
         </div>
        <Button size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function MarketplaceClient({ items, categories, subcategories }: MarketplaceClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    subcategory: 'all',
    priceRange: [0, 1500],
    sortBy: 'newest',
  });

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => {
        const newFilters = { ...prev, [key]: value };
        if (key === 'category') {
            newFilters.subcategory = 'all';
        }
        return newFilters;
    });
  };

  const filteredItems = items.filter(item => {
    const { search, category, subcategory, priceRange } = filters;
    const searchLower = search.toLowerCase();
    
    return (
      (search ? item.name.toLowerCase().includes(searchLower) || item.seller.toLowerCase().includes(searchLower) : true) &&
      (category !== 'all' ? item.category === category : true) &&
      (subcategory !== 'all' ? item.subcategory === subcategory : true) &&
      item.price >= priceRange[0] && item.price <= priceRange[1]
    );
  }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      // 'newest' is default, and our mock data isn't sorted by date, so no action needed.
      return 0;
  });

  const currentSubcategories = filters.category === 'all' ? [] : subcategories[filters.category] || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            Marketplace
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">Discover exclusive items from your favorite artists.</p>
        </header>
        
        <Tabs defaultValue="buy" className="w-full">
          <div className="flex justify-between items-end mb-4 flex-wrap gap-4">
              <TabsList>
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="rent">Rent</TabsTrigger>
              </TabsList>
              <Button onClick={() => router.push('/marketplace/list')} >
                <PlusCircle className="mr-2 h-4 w-4" /> List an Item
              </Button>
          </div>

          <aside className="mb-8 p-4 bg-muted/50 rounded-xl border border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search items or sellers..." 
                  className="pl-10"
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                />
              </div>
              
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

               <Select value={filters.subcategory} onValueChange={(value) => handleFilterChange('subcategory', value)} disabled={filters.category === 'all'}>
                <SelectTrigger><SelectValue placeholder="Subcategory" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subcategories</SelectItem>
                   {currentSubcategories.map(sub => (
                    <SelectItem key={sub} value={sub} className="capitalize">{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <div className="col-span-full space-y-2">
                <div className="flex justify-between text-sm">
                  <label>Price Range</label>
                  <span>${filters.priceRange[0]} - ${filters.priceRange[1] === 1500 ? '1500+' : filters.priceRange[1]}</span>
                </div>
                <Slider
                  min={0}
                  max={1500}
                  step={10}
                  value={[filters.priceRange[1]]}
                  onValueChange={(value) => handleFilterChange('priceRange', [0, value[0]])}
                />
              </div>

            </div>
          </aside>
          
          <TabsContent value="buy">
             <main>
              {filteredItems.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredItems.map(item => <ItemCard key={item.id} item={item} />)}
                 </div>
              ) : (
                 <div className="text-center py-20 bg-muted rounded-xl border border-dashed">
                    <h3 className="text-xl font-semibold">No items found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
                 </div>
              )}
            </main>
          </TabsContent>
          <TabsContent value="rent">
            <div className="text-center py-20 bg-muted rounded-xl border border-dashed">
                <h3 className="text-xl font-semibold">Rental Marketplace Coming Soon!</h3>
                <p className="text-muted-foreground mt-2">Check back later to rent items from creators.</p>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
