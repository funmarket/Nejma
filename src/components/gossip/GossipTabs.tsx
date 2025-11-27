
'use client';

import { Button } from "@/components/ui/button";

interface GossipTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function GossipTabs({ activeTab, setActiveTab }: GossipTabsProps) {
  return (
    <div className="flex gap-3 mb-6 px-4 max-w-2xl mx-auto">
      <Button
        onClick={() => setActiveTab('gossip')}
        variant={activeTab === 'gossip' ? 'default' : 'secondary'}
        className="flex-1"
      >
        Gossip
      </Button>
      <Button
        onClick={() => setActiveTab('inbox')}
        variant={activeTab === 'inbox' ? 'default' : 'secondary'}
        className="flex-1"
      >
        Inbox
      </Button>
    </div>
  );
}
