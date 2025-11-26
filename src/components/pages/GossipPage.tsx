"use client";

import { useState } from 'react';
import { GossipFeed } from '@/components/nejma/gossip/gossip-feed';
import { GossipInbox } from '@/components/nejma/gossip/gossip-inbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function GossipPage() {
  const [activeTab, setActiveTab] = useState('gossip');

  return (
    <div className="min-h-screen pt-6 pb-20 text-foreground">
        <div className="text-center py-6">
            <h1 className="text-4xl font-extrabold tracking-wide">
                <span className="text-primary">G</span><span>ossip</span>
            </h1>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl mx-auto px-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="gossip">Gossip</TabsTrigger>
                <TabsTrigger value="inbox">Inbox</TabsTrigger>
            </TabsList>
            <TabsContent value="gossip">
                <GossipFeed />
            </TabsContent>
            <TabsContent value="inbox">
                <GossipInbox />
            </TabsContent>
        </Tabs>
    </div>
  );
}
