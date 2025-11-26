
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  listPosts,
  listServiceAds,
  getUserFollows,
  ratePost as apiRatePost,
  createComment as apiCreateComment,
  deleteComment as apiDeleteComment,
  getRatings,
  listComments,
  unfollowUser,
  followUser,
  getGossipAuthors,
} from '@/lib/actions/gossip.actions';
import type { GossipPost, GossipComment, GossipRating, GossipUserFollows, GossipServiceAd, User } from '@/lib/types';
import { useToast } from './use-toast';

export function useGossipFeed() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<GossipPost[]>([]);
  const [authors, setAuthors] = useState<Record<string, User>>({});
  const [ads, setAds] = useState<GossipServiceAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, GossipComment[]>>({});
  const [ratings, setRatings] = useState<Record<string, GossipRating[]>>({});
  const [userPostRatings, setUserPostRatings] = useState<Record<string, number>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [userFollows, setUserFollows] = useState<Record<string, boolean>>({});
  const [feedFilter, setFeedFilter] = useState('all'); // 'all' or 'following'

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const [postsData, adsData] = await Promise.all([
        listPosts(),
        listServiceAds(),
      ]);
      
      const authorsData = await getGossipAuthors(postsData);
      setAuthors(authorsData);

      setPosts(postsData);
      setAds(adsData);

      if (currentUser) {
        const followsData = await getUserFollows(currentUser.userId);
        const followsMap = followsData.reduce((acc, follow) => {
            acc[follow.followingId] = true;
            return acc;
        }, {} as Record<string, boolean>);
        setUserFollows(followsMap);

        const allRatingsMap: Record<string, GossipRating[]> = {};
        const userRatingsMap: Record<string, number> = {};
        for (const post of postsData) {
          const postAllRatings = await getRatings(post.id);
          allRatingsMap[post.id] = postAllRatings;
          const userRating = postAllRatings.find(r => r.raterId === currentUser.userId);
          if (userRating) {
            userRatingsMap[post.id] = userRating.score;
          }
        }
        setRatings(allRatingsMap);
        setUserPostRatings(userRatingsMap);
      } else {
        setUserFollows({});
        setUserPostRatings({});
        setRatings({});
      }

    } catch (error) {
      toast({ title: "Failed to load feed", variant: 'destructive' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const refreshFeed = useCallback(() => {
    loadFeed();
  }, [loadFeed]);

  const toggleComments = async (postId: string) => {
    const isExpanded = !!expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: !isExpanded }));
    
    // Fetch comments only if they haven't been fetched before and we are expanding.
    if (!comments[postId] && !isExpanded) {
      const commentsData = await listComments(postId);
      const commentAuthors = await getGossipAuthors(commentsData.map(c => ({...c, authorId: c.authorId })));
      setAuthors(prev => ({ ...prev, ...commentAuthors}));
      setComments(prev => ({ ...prev, [postId]: commentsData }));
    }
  };


  const submitComment = async (postId: string, content: string) => {
    if (!currentUser) {
        toast({ title: 'Please log in to comment', variant: 'destructive' });
        return;
    }
    const optimisticComment: GossipComment = {
        id: `temp-${Date.now()}`,
        postId,
        authorId: currentUser.userId,
        authorWallet: currentUser.walletAddress, // Keep for author display fallback
        content,
        createdAt: Date.now()
    }
    setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), optimisticComment]}));
    setPosts(prev => prev.map(p => p.id === postId ? {...p, commentsCount: (p.commentsCount || 0) + 1} : p));

    try {
        await apiCreateComment({ postId, content, authorId: currentUser.userId });
        const commentsData = await listComments(postId);
        setComments(prev => ({ ...prev, [postId]: commentsData }));
    } catch(e) {
        toast({title: 'Failed to post comment', variant: 'destructive'});
        setComments(prev => ({ ...prev, [postId]: (prev[postId] || []).filter(c => c.id !== optimisticComment.id)}));
        setPosts(prev => prev.map(p => p.id === postId ? {...p, commentsCount: Math.max(0, (p.commentsCount || 0) - 1)} : p));
    }
  };
  
  const handleDeleteComment = async (commentId: string, postId: string) => {
    const originalComments = comments[postId];
    setComments(prev => ({ ...prev, [postId]: (prev[postId] || []).filter(c => c.id !== commentId) }));
    setPosts(prev => prev.map(p => p.id === postId ? {...p, commentsCount: Math.max(0, (p.commentsCount || 0) - 1)} : p));
    try {
        await apiDeleteComment(commentId);
    } catch(e) {
        toast({title: 'Failed to delete comment', variant: 'destructive'});
        setComments(prev => ({...prev, [postId]: originalComments}));
        setPosts(prev => prev.map(p => p.id === postId ? {...p, commentsCount: (p.commentsCount || 1)} : p));
    }
  };


  const ratePost = async (postId: string, score: number) => {
     if (!currentUser) {
        toast({ title: 'Please log in to rate', variant: 'destructive' });
        return;
    }
    const originalRating = userPostRatings[postId];
    const originalRatings = ratings[postId];

    setUserPostRatings(prev => ({ ...prev, [postId]: score }));
    const newRatings = (ratings[postId] || []).filter(r => r.raterId !== currentUser.userId);
    newRatings.push({id: 'temp', postId, raterId: currentUser.userId, raterWallet: currentUser.walletAddress, score});
    setRatings(prev => ({ ...prev, [postId]: newRatings }));
    
    try {
        await apiRatePost(postId, currentUser.userId, score);
        const updatedRatingsData = await getRatings(postId);
        setRatings(prev => ({ ...prev, [postId]: updatedRatingsData }));
    } catch (e) {
        toast({title: "Failed to submit rating", variant: 'destructive'});
        setUserPostRatings(prev => ({ ...prev, [postId]: originalRating }));
        setRatings(prev => ({ ...prev, [postId]: originalRatings }));
    }
  };

  const toggleFollow = async (followingId: string) => {
    if (!currentUser) {
        toast({ title: 'Please log in to follow users', variant: 'destructive' });
        return;
    }
    const isCurrentlyFollowing = !!userFollows[followingId];
    setUserFollows(prev => ({...prev, [followingId]: !isCurrentlyFollowing}));
    try {
        if(isCurrentlyFollowing) {
            await unfollowUser(currentUser.userId, followingId);
            toast({ title: `Unfollowed` });
        } else {
            await followUser(currentUser.userId, followingId);
            toast({ title: `Followed` });
        }
    } catch (error) {
        setUserFollows(prev => ({...prev, [followingId]: isCurrentlyFollowing}));
        toast({ title: 'Failed to update follow status', variant: 'destructive' });
    }
  };

  return {
    posts,
    authors,
    ads,
    loading,
    refreshFeed,
    comments,
    ratings,
    userPostRatings,
    expandedComments,
    toggleComments,
    submitComment,
    handleDeleteComment,
    ratePost,
    userFollows,
    toggleFollow,
    feedFilter,
    setFeedFilter,
  };
}
