'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/providers/toast-provider';
import { useAppContext } from '@/context/AppContext';
import VideoCard from './VideoCard';
import { getVideos, getArtistsForVideos, voteOnVideo, toggleBookmark } from '@/lib/actions/video.actions';
import { getActiveUsers } from '@/lib/actions/user.actions';
import type { Video, User } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function VideoFeed({ 
  initialVideos, 
  initialArtists 
}: { 
  initialVideos: Video[], 
  initialArtists: Record<string, User> 
}) {
  const { userWallet } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const { activeFeedTab } = useAppContext();

  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [artists, setArtists] = useState<Record<string, User>>(initialArtists);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bookmarkedState, setBookmarkedState] = useState<Record<string, boolean>>({});

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'y',
    loop: false,
  });

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const category = activeFeedTab === 'rising' ? undefined : activeFeedTab;
      const allVideos = await getVideos({ status: 'active', category });
      const allUsers = await getActiveUsers();
      const artistsMap = getArtistsForVideos(allVideos, allUsers);

      let filteredVideos = allVideos.filter(v => artistsMap[v.artistId]);

      if (activeFeedTab === 'rising') {
        filteredVideos.sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0));
      } else {
        filteredVideos.sort(() => Math.random() - 0.5);
      }
      
      setVideos(filteredVideos);
      setArtists(artistsMap);
      if(emblaApi) emblaApi.scrollTo(0);

    } catch (err) {
      addToast('Failed to load videos.', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeFeedTab, addToast, emblaApi]);

  useEffect(() => {
    loadVideos();
  }, [activeFeedTab]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);
  
  const handlePrevious = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const handleVote = async (videoId: string, isTop: boolean) => {
    const originalVideo = videos.find(v => v.id === videoId);
    if (!originalVideo) return;

    // Optimistic update
    const field = isTop ? 'topCount' : 'flopCount';
    const updatedVideos = videos.map(v => v.id === videoId ? { ...v, [field]: v[field] + 1 } : v);
    setVideos(updatedVideos);

    handleNext();

    try {
      await voteOnVideo(videoId, isTop);
    } catch (error) {
      addToast('Could not save your vote.', 'error');
      // Revert optimistic update
      setVideos(videos);
    }
  };

  const handleToggleBookmark = async (videoId: string) => {
    if (!userWallet) {
      addToast('Please connect your wallet to save videos.', 'info');
      return;
    }
    const isBookmarked = !!bookmarkedState[videoId];
    setBookmarkedState(prev => ({ ...prev, [videoId]: !isBookmarked }));
    try {
      const result = await toggleBookmark(userWallet, videoId);
      setBookmarkedState(prev => ({ ...prev, [videoId]: result.bookmarked }));
      addToast(result.bookmarked ? 'Saved!' : 'Removed from saved', 'success');
    } catch (error) {
      setBookmarkedState(prev => ({ ...prev, [videoId]: isBookmarked }));
      addToast('Could not update your saved videos.', 'error');
    }
  };

  const handleTip = () => {
    if (!userWallet) {
      addToast('Please connect your wallet to tip artists.', 'info');
      return;
    }
    addToast('Tipping functionality is under development.', 'info');
  };
  
  const handleBookOrAdopt = (action: 'book' | 'adopt') => {
    if (!userWallet) {
      addToast(`Please connect your wallet to ${action} artists.`, 'info');
      return;
    }
    addToast(`${action.charAt(0).toUpperCase() + action.slice(1)}ing functionality is under development.`, 'info');
  };

  const renderedVideos = useMemo(() => {
    if (loading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="w-full h-full max-w-md bg-muted animate-pulse rounded-lg" />
        </div>
      );
    }
    if (videos.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-center p-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">No Videos Found</h2>
            <p className="text-gray-400">Try selecting a different category.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="h-full" ref={emblaRef}>
        <div className="flex flex-col h-full">
          {videos.map((video, index) => (
            <div className="relative flex-[0_0_100%] min-h-0" key={video.id}>
              {/* Render only current, previous and next for performance */}
              {(index >= currentIndex - 1 && index <= currentIndex + 1) && (
                <VideoCard
                  video={video}
                  artist={artists[video.artistId]}
                  isActive={index === currentIndex}
                  isBookmarked={!!bookmarkedState[video.id]}
                  onVote={(isTop) => handleVote(video.id, isTop)}
                  onToggleBookmark={() => handleToggleBookmark(video.id)}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onTip={handleTip}
                  onBook={() => handleBookOrAdopt('book')}
                  onAdopt={() => handleBookOrAdopt('adopt')}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }, [loading, videos, artists, currentIndex, bookmarkedState, handleNext, handlePrevious, handleVote, handleToggleBookmark, handleTip, handleBookOrAdopt, emblaRef]);
  
  return (
    <div className="fixed inset-0 bg-black pt-12 sm:pt-14 pb-16 sm:pb-20">
      {renderedVideos}
    </div>
  );
}
