
'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/providers/toast-provider';
import { cn } from '@/lib/utils';
import type { GossipRating } from '@/lib/types';

interface StarRatingProps {
    postId: string;
    onRate: (postId: string, score: number) => Promise<void>;
    ratings: Record<string, GossipRating[]>;
    initialRating?: number;
}

export default function StarRating({ postId, onRate, ratings, initialRating = 0 }: StarRatingProps) {
  const { userWallet } = useAuth();
  const { addToast } = useToast();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [userCurrentRating, setUserCurrentRating] = useState(initialRating);

  useEffect(() => {
    setUserCurrentRating(initialRating);
  }, [initialRating]);

  const postRatings = ratings[postId] || [];
  const avgRating = postRatings.length > 0 ? postRatings.reduce((sum, r) => sum + r.score, 0) / postRatings.length : 0;

  const handleRate = async (score: number) => {
    if (!userWallet) {
      addToast('Please connect your wallet to rate', 'error');
      return;
    }
    setUserCurrentRating(score); // Optimistic update
    await onRate(postId, score);
  };

  return (
    <div className="flex items-center gap-2">
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                key={star}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleRate(star)}
                className="transition-colors"
                >
                <Star
                    className={cn(
                        'w-5 h-5',
                        star <= (hoveredStar || userCurrentRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                    )}
                />
                </button>
            ))}
        </div>
      <span className="text-sm text-muted-foreground tabular-nums">
        {avgRating.toFixed(1)} ({postRatings.length})
      </span>
    </div>
  );
}
