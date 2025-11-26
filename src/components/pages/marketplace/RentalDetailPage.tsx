"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDevapp } from '@/components/providers/devapp-provider';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export function RentalDetailPage() {
  const { id } = useParams();
  const { devbaseClient, user } = useDevapp();
  const router = useRouter();
  const { addToast } = useToast();

  const [rental, setRental] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadRental = async () => {
      if (!devbaseClient) return;
      try {
        const rentalData = await devbaseClient.getEntity('rentals', id as string);
        setRental(rentalData);
        if (rentalData?.ownerId) {
          const users = await devbaseClient.listEntities('users', { walletAddress: rentalData.ownerId });
          if (users.length > 0) setOwner(users[0]);
        }
      } catch (error) {
        addToast('Failed to load rental', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadRental();
  }, [devbaseClient, id]);
  
  const handleContact = () => {
    if (!user) { addToast('Please connect wallet to contact owner', 'error'); return; }
    addToast('Contact feature coming soon!', 'info');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!rental) return <div className="min-h-screen flex items-center justify-center"><p>Rental not found</p></div>;

  const images = rental.images ? JSON.parse(rental.images) : [];
  const isOwner = user?.uid === rental.ownerId;

  return (
    <div className="min-h-screen pt-6 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4 text-muted-foreground"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Rentals</Button>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card className="aspect-square overflow-hidden mb-4">
              {images.length > 0 ? <Image src={images[currentImageIndex]} alt={rental.title} width={600} height={600} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-muted"><Sparkles className="w-16 h-16 text-primary" /></div>}
            </Card>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: string, idx: number) => <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${idx === currentImageIndex ? 'border-primary' : 'border-transparent'}`}><Image src={img} alt={`${rental.title} thumbnail ${idx + 1}`} width={64} height={64} className="w-full h-full object-cover" /></button>)}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{rental.title}</h1>
            <p className="text-4xl font-bold text-primary">{rental.pricePerDay} SOL/day</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="capitalize">{rental.category}</Badge>
              <Badge variant="outline" className="capitalize">{rental.subCategory}</Badge>
            </div>
            {owner && (
              <Card className="p-4">
                  <p className="text-muted-foreground text-sm mb-2">Owner</p>
                  <Link href={`/u/${owner.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold overflow-hidden">
                      {owner.profilePhotoUrl ? <Image src={owner.profilePhotoUrl} alt={owner.username} width={40} height={40} className="w-full h-full object-cover" /> : owner.username?.[0]?.toUpperCase()}
                    </div>
                    <div><p className="font-bold">@{owner.username}</p><p className="text-muted-foreground text-sm capitalize">{owner.role || 'User'}</p></div>
                  </Link>
              </Card>
            )}
            <Card className="p-4"><h3 className="font-bold mb-2">Description</h3><p className="text-muted-foreground whitespace-pre-wrap">{rental.description}</p></Card>
            {rental.location && <Card className="p-4"><h3 className="font-bold mb-2">Location</h3><p className="text-muted-foreground">{rental.location}</p></Card>}
            {rental.availability && <Card className="p-4"><h3 className="font-bold mb-2">Availability</h3><p className="text-muted-foreground">{rental.availability}</p></Card>}
            {isOwner ? (
                <Card className="p-4 bg-yellow-500/10 border-yellow-500/30"><p className="text-yellow-400 text-sm">This is your rental listing.</p></Card>
            ) : (
                <Button onClick={handleContact} size="lg" className="w-full">Contact Owner</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
