
'use client';

import { useState } from 'react';
import GossipHeader from './GossipHeader';
import GossipTabs from './GossipTabs';
import GossipFeed from './GossipFeed';
import GossipInbox from './GossipInbox';

export default function GossipClient() {
  const [activeTab, setActiveTab] = useState('gossip');

  return (
    <div className="min-h-screen pt-12 pb-20 bg-background text-foreground">
      <GossipHeader />
      <GossipTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="max-w-2xl mx-auto px-4">
        {activeTab === 'gossip' ? <GossipFeed /> : <GossipInbox />}
      </div>
    </div>
  );
}
