'use client';

import { MessageSquare } from 'lucide-react';

export default function GossipPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center text-center p-4">
      <div>
        <MessageSquare className="w-16 h-16 mx-auto text-primary mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Gossip Is Coming Soon</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          A new space for artists, fans, and industry pros to connect and chat is on the way. Stay tuned!
        </p>
      </div>
    </div>
  );
}
