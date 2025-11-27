
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { GossipServiceAd } from "@/lib/types";

export default function ServiceAdCard({ ad }: { ad: GossipServiceAd }) {
    return (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{ad.title}</CardTitle>
                        <CardDescription>Sponsored</CardDescription>
                    </div>
                    {ad.contactInfo && (
                        <Button asChild size="sm">
                            <a href={`mailto:${ad.contactInfo}`}>Contact</a>
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <p className="mb-4">{ad.description}</p>
                {ad.imageUrl && (
                    <div className="aspect-video relative rounded-lg overflow-hidden border mb-4">
                        <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" />
                    </div>
                )}
                 {ad.workLinks && (
                    <Button asChild variant="link" className="p-0">
                        <a href={ad.workLinks} target="_blank" rel="noopener noreferrer">
                            View Work &rarr;
                        </a>
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
