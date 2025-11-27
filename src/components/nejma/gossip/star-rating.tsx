"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/components/providers/toast-provider';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';

export function StarRating({ postId, onRate, ratings, initialRating = 0 }: any) {
  const { user } = useUser();
  const { addToast } = useToast();
  
  const [hoveredStar, setHoveredStar] = useState(0);
  const [userCurrentRating, setUserCurrentRating] = useState(initialRating);
  
  const postRatings = ratings[postId] || [];
  const avgRating = postRatings.length > 0 ? postRatings.reduce((sum: number, r: any) => sum + r.score, 0) / postRatings.length : 0;
  
  useEffect(() => {
    setUserCurrentRating(initialRating);
  }, [initialRating]);

  const handleRate = (score: number) => {
    if (!user) {
      addToast('Please connect your wallet to rate', 'error');
      return;
    }
    setUserCurrentRating(score);
    onRate(postId, score);
  };
  
  return (
    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} onClick={() => handleRate(star)} className="transition-transform duration-100 ease-in-out hover:scale-125">
          <Star className={cn("w-5 h-5 sm:w-6 sm:h-6 transition-colors", star <= (hoveredStar || userCurrentRating) ? "text-yellow-400" : "text-muted-foreground/50")} fill={star <= (hoveredStar || userCurrentRating) ? "currentColor" : "none"} />
        </button>
      ))}
      <span className="text-muted-foreground text-xs sm:text-sm ml-1">
        {avgRating.toFixed(1)} ({postRatings.length})
      </span>
    </div>
  );
}
