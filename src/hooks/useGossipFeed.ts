
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
  const { userWallet } = useAuth();
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

      if (userWallet) {
        const followsData = await getUserFollows(userWallet);
        const followsMap = followsData.reduce((acc, follow) => {
            acc[follow.followingWallet] = true;
            return acc;
        }, {} as Record<string, boolean>);
        setUserFollows(followsMap);

        const allRatingsMap: Record<string, GossipRating[]> = {};
        const userRatingsMap: Record<string, number> = {};
        for (const post of postsData) {
          const postAllRatings = await getRatings(post.id);
          allRatingsMap[post.id] = postAllRatings;
          const userRating = postAllRatings.find(r => r.raterWallet === userWallet);
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
  }, [userWallet, toast]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const refreshFeed = useCallback(() => {
    loadFeed();
  }, [loadFeed]);

  const toggleComments = async (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId] && !expandedComments[postId]) {
      const commentsData = await listComments(postId);
      const commentAuthors = await getGossipAuthors(commentsData.map(c => ({...c, authorWallet: c.authorWallet, content: '', category: '', createdAt: 0, commentsCount: 0})))
      setAuthors(prev => ({ ...prev, ...commentAuthors}));
      setComments(prev => ({ ...prev, [postId]: commentsData }));
    }
  };

  const submitComment = async (postId: string, content: string) => {
    if (!userWallet) {
        toast({ title: 'Please connect your wallet to comment', variant: 'destructive' });
        return;
    }
    const optimisticComment: GossipComment = {
        id: `temp-${Date.now()}`,
        postId,
        authorWallet: userWallet,
        content,
        createdAt: Date.now()
    }
    // Optimistic update
    setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), optimisticComment]}));
    setPosts(prev => prev.map(p => p.id === postId ? {...p, commentsCount: (p.commentsCount || 0) + 1} : p));

    try {
        await apiCreateComment({ postId, content, authorWallet: userWallet });
        // Refresh comments for the post to get real data
        const commentsData = await listComments(postId);
        setComments(prev => ({ ...prev, [postId]: commentsData }));
    } catch(e) {
        toast({title: 'Failed to post comment', variant: 'destructive'});
        // Revert
        setComments(prev => ({ ...prev, [postId]: (prev[postId] || []).filter(c => c.id !== optimisticComment.id)}));
        setPosts(prev => prev.map(p => p.id === postId ? {...p, commentsCount: Math.max(0, (p.commentsCount || 0) - 1)} : p));
    }
  };
  
  const handleDeleteComment = async (commentId: string, postId: string) => {
    const originalComments = comments[postId];
    // Optimistic delete
    setComments(prev => ({ ...prev, [postId]: (prev[postId] || []).filter(c => c.id !== commentId) }));
    setPosts(prev => prev.map(p => p.id === postId ? {...p, commentsCount: Math.max(0, (p.commentsCount || 0) - 1)} : p));
    try {
        await apiDeleteComment(commentId);
    } catch(e) {
        toast({title: 'Failed to delete comment', variant: 'destructive'});
        setComments(prev => ({...prev, [postId]: originalComments}));
        setPosts(prev => prev.map(p => p.id === postId ? {...p, commentsCount: (p.commentsCount || 0)} : p));
    }
  };


  const ratePost = async (postId: string, score: number) => {
     if (!userWallet) {
        toast({ title: 'Please connect your wallet to rate', variant: 'destructive' });
        return;
    }
    const originalRating = userPostRatings[postId];
    const originalRatings = ratings[postId];

    // Optimistic update
    setUserPostRatings(prev => ({ ...prev, [postId]: score }));
    const newRatings = (ratings[postId] || []).filter(r => r.raterWallet !== userWallet);
    newRatings.push({id: 'temp', postId, raterWallet: userWallet, score});
    setRatings(prev => ({ ...prev, [postId]: newRatings }));
    
    try {
        await apiRatePost(postId, userWallet, score);
        const updatedRatingsData = await getRatings(postId);
        setRatings(prev => ({ ...prev, [postId]: updatedRatingsData }));
    } catch (e) {
        toast({title: "Failed to submit rating", variant: 'destructive'});
        // Revert
        setUserPostRatings(prev => ({ ...prev, [postId]: originalRating }));
        setRatings(prev => ({ ...prev, [postId]: originalRatings }));
    }
  };

  const toggleFollow = async (followingWallet: string) => {
    if (!userWallet) {
        toast({ title: 'Please connect your wallet to follow users', variant: 'destructive' });
        return;
    }
    const isCurrentlyFollowing = !!userFollows[followingWallet];
    setUserFollows(prev => ({...prev, [followingWallet]: !isCurrentlyFollowing})); // Optimistic update
    try {
        if(isCurrentlyFollowing) {
            await unfollowUser(userWallet, followingWallet);
            toast({ title: `Unfollowed` });
        } else {
            await followUser(userWallet, followingWallet);
            toast({ title: `Followed` });
        }
    } catch (error) {
        setUserFollows(prev => ({...prev, [followingWallet]: isCurrentlyFollowing})); // Revert
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
