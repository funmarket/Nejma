"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ServiceAdCard({ ad }: { ad: any }) {
  return (
    <Card className="p-4 relative overflow-hidden bg-gradient-to-r from-primary/10 via-background to-background">
      <Badge className="absolute top-2 right-2" variant="secondary">Sponsored</Badge>
      <CardContent className="p-0">
        <h3 className="text-foreground font-bold text-lg mb-2">{ad.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">{ad.description}</p>
        {ad.imageUrl && 
          <div className="relative aspect-video rounded-md overflow-hidden mb-3">
            <Image src={ad.imageUrl} alt="" layout="fill" objectFit="cover" />
          </div>
        }
        {ad.contactInfo && <p className="text-muted-foreground text-sm">Contact: {ad.contactInfo}</p>}
        {ad.workLinks && (
          <a href={ad.workLinks} target="_blank" rel="noopener noreferrer" className="text-sm font-bold mt-2 inline-block text-primary hover:underline">
            View Work →
          </a>
        )}
      </CardContent>
    </Card>
  );
}
