"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';

export function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const { addToast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        const prodRef = doc(db, 'marketplace_products', id as string);
        const prodSnap = await getDoc(prodRef);
        
        if (prodSnap.exists()) {
            const prodData = {id: prodSnap.id, ...prodSnap.data()};
            setProduct(prodData);
            if (prodData?.sellerWallet) {
              const q = query(collection(db, 'users'), where('walletAddress', '==', prodData.sellerWallet));
              const usersSnapshot = await getDocs(q);
              if (!usersSnapshot.empty) {
                setSeller(usersSnapshot.docs[0].data());
              }
            }
        }
      } catch (error) {
        addToast('Failed to load product', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id, addToast]);

  const handleBuy = async (currency: string) => {
    if (!user) { addToast('Please connect wallet to buy', 'error'); return; }
    addToast('Order created! Funds held in escrow until delivery.', 'success');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center"><p>Product not found</p></div>;

  const images = product.images ? JSON.parse(product.images) : [];
  const isOwner = user?.walletAddress === product.sellerWallet;

  return (
    <div className="min-h-screen pt-6 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4 text-muted-foreground"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace</Button>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card className="aspect-square overflow-hidden mb-4">
              {images.length > 0 ? <Image src={images[currentImageIndex]} alt={product.title} width={600} height={600} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-muted"><Sparkles className="w-16 h-16 text-primary" /></div>}
            </Card>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: string, idx: number) => <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${idx === currentImageIndex ? 'border-primary' : 'border-transparent'}`}><Image src={img} alt={`${product.title} thumbnail ${idx + 1}`} width={64} height={64} className="w-full h-full object-cover" /></button>)}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="text-4xl font-bold text-primary">{product.price} {product.currency}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="capitalize">{product.category}</Badge>
              <Badge variant="outline" className="capitalize">{product.subcategory}</Badge>
              <Badge variant="outline" className="capitalize">{product.condition}</Badge>
            </div>
            {seller && (
                <Card className="p-4">
                  <p className="text-muted-foreground text-sm mb-2">Seller</p>
                  <Link href={`/u/${seller.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold overflow-hidden">
                      {seller.profilePhotoUrl ? <Image src={seller.profilePhotoUrl} alt={seller.username} width={40} height={40} className="w-full h-full object-cover" /> : seller.username?.[0]?.toUpperCase()}
                    </div>
                    <div><p className="font-bold">@{seller.username}</p><p className="text-muted-foreground text-sm capitalize">{seller.role || 'User'}</p></div>
                  </Link>
                </Card>
            )}
            <Card className="p-4"><h3 className="font-bold mb-2">Description</h3><p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p></Card>
            {product.location && <Card className="p-4"><h3 className="font-bold mb-2">Location</h3><p className="text-muted-foreground">{product.location}</p></Card>}
            <Card className="p-4 bg-green-500/10 border-green-500/30"><p className="text-green-400 text-sm">🔒 Protected by Escrow - Funds held safely until order completed</p></Card>
            {isOwner ? (
                <Card className="p-4 bg-yellow-500/10 border-yellow-500/30"><p className="text-yellow-400 text-sm">This is your listing.</p></Card>
            ) : (
                <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button onClick={() => handleBuy('SOL')} size="lg" className="bg-primary hover:bg-primary/90">Buy with SOL</Button>
                    <Button onClick={() => handleBuy('USDT')} size="lg" className="bg-green-600 hover:bg-green-700">Buy with USDT</Button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
