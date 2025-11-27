
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDevapp } from '@/components/providers/devapp-provider';
import { useToast } from '@/components/providers/toast-provider';
import { devbaseHelpers } from '@/lib/nejma/helpers';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoCard } from '@/components/nejma/video-card';
import { Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function SkeletonLoader() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="w-full h-full max-w-md animate-pulse">
        <Skeleton className="w-full h-full bg-muted/20" />
      </div>
    </div>
  );
}

export function VideoFeedPage() {
  const { devbaseClient, user } = useDevapp();
  const searchParams = useSearchParams();
  const activeFeedTab = searchParams.get('category') || 'music';

  const [videos, setVideos] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artists, setArtists] = useState<Record<string, any>>({});
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  const loadArtistsAndInitialVideos = useCallback(async () => {
    if (!devbaseClient) return;
    setLoading(true);
    setError(null);
    try {
      const allUsers = await devbaseClient.listEntities('users');
      const artistsMap: Record<string, any> = {};
      allUsers.forEach(user => {
        if (user.userId) artistsMap[user.userId] = user;
        else if (user.id) artistsMap[user.id] = user;
      });
      setArtists(artistsMap);
    } catch (err: any) {
      console.error('Error loading artists:', err);
      setError(err.message || 'Failed to load artists');
    } finally {
      setLoading(false);
    }
  }, [devbaseClient]);
  
  useEffect(() => {
    loadArtistsAndInitialVideos();
  }, [loadArtistsAndInitialVideos]);

  useEffect(() => {
    if (Object.keys(artists).length === 0) return;

    const videosCollection = collection(db, 'videos');
    const q = query(videosCollection, where('status', '==', 'active'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allVideos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      let filteredVideos = allVideos.filter(v => {
        if (!v || v.isBanned === true || v.hiddenFromFeed === true) return false;
        const artist = artists[v.artistId];
        if (!artist || artist.isDeleted === true || artist.isBanned === true || artist.isSuspended === true) return false;
        if (activeFeedTab === 'rising') return true;
        
        const videoCategory = (v.category || '').toLowerCase();
        const feedCategory = activeFeedTab.toLowerCase();
        return videoCategory === feedCategory;
      });

      if (activeFeedTab === 'rising') {
        filteredVideos.sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0) || (b.createdAt || 0) - (a.createdAt || 0));
      } else {
        // Keep existing order for non-rising to avoid reshuffling on updates
        setVideos(currentVideos => {
          const newVideoMap = new Map(filteredVideos.map(v => [v.id, v]));
          const updatedVideos = currentVideos.map(v => newVideoMap.get(v.id) || v).filter(Boolean);
          
          const currentVideoIds = new Set(updatedVideos.map(v => v.id));
          const newVideos = filteredVideos.filter(v => !currentVideoIds.has(v.id));

          const finalVideos = [...updatedVideos, ...newVideos];
          if (finalVideos.length > 0 && currentVideos.length === 0) {
            // Initial random sort
            return finalVideos.sort(() => Math.random() - 0.5);
          }
          return finalVideos;
        });
      }
      setLoading(false);
    }, (err) => {
      console.error('Error with video snapshot:', err);
      setError(err.message || 'Failed to load videos in real-time');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [artists, activeFeedTab]);

  
  const loadBookmarks = async () => {
    if (!user || !devbaseClient) return;
    try {
      const bookmarks = await devbaseClient.listEntities('bookmarks', { userId: user.uid });
      const bookmarkMap = bookmarks.reduce((acc, bookmark) => {
        acc[bookmark.videoId] = bookmark.id;
        return acc;
      }, {} as Record<string, string>);
      setBookmarkedVideos(bookmarkMap);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  useEffect(() => {
    if (user) {
        loadBookmarks();
    } else {
        setBookmarkedVideos({});
    }
  }, [user, devbaseClient]);

  const recordView = async (videoId: string) => {
    if (!user || !devbaseClient) return;
    try {
      // This is a fire-and-forget operation on the client
      devbaseClient.createEntity('video_views', {
        videoId,
        viewerId: user.uid,
        viewedAt: Date.now()
      });
      // Also update the video document's view count
      const video = videos.find(v => v.id === videoId);
      if (video) {
        devbaseClient.updateEntity('videos', videoId, { views: (video.views || 0) + 1 });
      }
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };
  
  useEffect(() => {
      if (videos.length > 0 && videos[currentIndex]) {
          recordView(videos[currentIndex].id);
      }
  }, [currentIndex, videos]);


  const handleVote = async (isTop: boolean) => {
    if (!videos[currentIndex]) return;
    const video = videos[currentIndex];
    const field = isTop ? 'topCount' : 'flopCount';

    // Optimistic UI update
    setVideos(prev => prev.map((v, i) => i === currentIndex ? { ...v, [field]: (v[field] || 0) + 1 } : v));

    try {
        await devbaseClient.updateEntity('videos', video.id, { [field]: (video[field] || 0) + 1 });
        // No need to emit, Firestore listener will catch the update
        nextVideo();
    } catch (error) {
        addToast('Failed to vote', 'error');
        // Revert optimistic update
        setVideos(prev => prev.map((v, i) => i === currentIndex ? { ...v, [field]: (v[field] || 0) - 1 } : v));
    }
  };

  const handleInteraction = async (interactionType: 'bookings' | 'adoptions', promptMessage: string) => {
    if (!user) { addToast('Please connect wallet to interact', 'error'); return; }
    if (!videos[currentIndex]) return;

    const video = videos[currentIndex];
    const baseAmountStr = prompt(promptMessage);
    if (!baseAmountStr) return;

    const baseAmount = parseFloat(baseAmountStr);
    if (isNaN(baseAmount) || baseAmount <= 0) { addToast('Invalid amount', 'error'); return; }

    const message = prompt('Add a message for the artist (optional):');
    
    try {
      await devbaseClient.createEntity(interactionType, {
          artistId: video.artistId,
          businessId: user.uid,
          videoId: video.id,
          message: message || `New ${interactionType} request`,
          baseAmount: baseAmount,
          createdAt: Date.now()
      });

      const countField = interactionType === 'bookings' ? 'bookCount' : 'adoptCount';
      await devbaseClient.updateEntity('videos', video.id, { [countField]: (video[countField] || 0) + 1 });
      
      addToast(`${interactionType.slice(0, -1)} created successfully!`, 'success');
    } catch (error) {
      console.error(`Error creating ${interactionType}:`, error);
      addToast(`Failed to create ${interactionType.slice(0, -1)}`, 'error');
    }
  };

  const toggleBookmark = async () => {
    if (!user || !devbaseClient) { addToast('Please connect wallet to save', 'error'); return; }
    if (!videos[currentIndex]) return;

    const videoId = videos[currentIndex].id;
    const existingBookmarkId = bookmarkedVideos[videoId];

    try {
      if (existingBookmarkId) {
        await devbaseClient.deleteEntity('bookmarks', existingBookmarkId);
        setBookmarkedVideos(prev => {
          const newBookmarks = { ...prev };
          delete newBookmarks[videoId];
          return newBookmarks;
        });
        addToast('Removed from saved', 'success');
      } else {
        const newBookmark = await devbaseClient.createEntity('bookmarks', { userId: user.uid, videoId: videoId, createdAt: Date.now() });
        setBookmarkedVideos(prev => ({...prev, [videoId]: newBookmark.id }));
        addToast('Saved!', 'success');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      addToast('Failed to update', 'error');
    }
  };

  const handleTip = async () => {
    if (!user) { addToast('Please connect wallet to tip', 'error'); return; }
    if (!videos[currentIndex]) return;

    const video = videos[currentIndex];
    const tipAmountStr = prompt('Enter tip amount (SOL):', '0.01');
    if (!tipAmountStr) return;

    const tipAmount = parseFloat(tipAmountStr);
    if (isNaN(tipAmount) || tipAmount <= 0) { addToast('Invalid amount', 'error'); return; }

    try {
      await devbaseClient.createEntity('tips', {
        fromWallet: user.uid,
        toWallet: video.artistId,
        amount: tipAmount,
        videoId: video.id,
        createdAt: Date.now()
      });
      addToast(`Tipped ${tipAmount} SOL!`, 'success');
    } catch (error) {
      addToast('Failed to send tip', 'error');
    }
  };

  const nextVideo = () => setCurrentIndex(prev => (prev < videos.length - 1 ? prev + 1 : prev));
  const previousVideo = () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));

  if (loading) return <SkeletonLoader />;
  if (error) return <div className="h-screen flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="relative w-full h-[calc(100vh-theme(spacing.28))] sm:h-[calc(100vh-theme(spacing.32))] overflow-hidden bg-background">
      {videos.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center p-8">
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">No Videos Found</h2>
            <p className="text-muted-foreground">Try selecting a different category.</p>
          </div>
        </div>
      ) : (
        <VideoCard
          key={videos[currentIndex]?.id}
          video={videos[currentIndex]}
          artist={artists[videos[currentIndex]?.artistId]}
          onVote={handleVote}
          onBook={() => handleInteraction('bookings', 'Enter artist payment amount (SOL):')}
          onAdopt={() => handleInteraction('adoptions', 'Enter adoption payment amount (SOL):')}
          onToggleBookmark={toggleBookmark}
          onNext={nextVideo}
          onPrevious={previousVideo}
          onTip={handleTip}
          bookmarked={!!bookmarkedVideos[videos[currentIndex]?.id]}
          currentIndex={currentIndex}
        />
      )}
    </div>
  );
}
