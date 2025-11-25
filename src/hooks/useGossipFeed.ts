
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
      const [postsData, adsData, followsData] = await Promise.all([
        listPosts(),
        listServiceAds(),
        userWallet ? getUserFollows(userWallet) : Promise.resolve([]),
      ]);
      
      const authorsData = await getGossipAuthors(postsData);
      setAuthors(authorsData);

      setPosts(postsData);
      setAds(adsData);

      const followsMap = followsData.reduce((acc, follow) => {
        acc[follow.followingWallet] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setUserFollows(followsMap);
      
      if (userWallet) {
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
    if (!comments[postId]) {
      const commentsData = await listComments(postId);
      setComments(prev => ({ ...prev, [postId]: commentsData }));
    }
  };

  const submitComment = async (postId: string, content: string) => {
    if (!userWallet) {
        toast({ title: 'Please connect your wallet to comment', variant: 'destructive' });
        return;
    }
    await apiCreateComment({ postId, content, authorWallet: userWallet });
    // Refresh comments for the post
    const commentsData = await listComments(postId);
    setComments(prev => ({ ...prev, [postId]: commentsData }));
    // Refresh post to update comment count
    setPosts(prev => prev.map(p => p.id === postId ? {...p, commentsCount: (p.commentsCount || 0) + 1} : p));
  };
  
  const handleDeleteComment = async (commentId: string, postId: string) => {
    await apiDeleteComment(commentId);
     const commentsData = await listComments(postId);
    setComments(prev => ({ ...prev, [postId]: commentsData }));
     setPosts(prev => prev.map(p => p.id === postId ? {...p, commentsCount: Math.max(0, (p.commentsCount || 0) - 1)} : p));
  };


  const ratePost = async (postId: string, score: number) => {
     if (!userWallet) {
        toast({ title: 'Please connect your wallet to rate', variant: 'destructive' });
        return;
    }
    await apiRatePost(postId, userWallet, score);
    const ratingsData = await getRatings(postId);
    setRatings(prev => ({ ...prev, [postId]: ratingsData }));
    setUserPostRatings(prev => ({ ...prev, [postId]: score }));
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

  const filteredPosts = feedFilter === 'following'
    ? posts.filter(post => userFollows[post.authorWallet])
    : posts;

  return {
    posts: filteredPosts,
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
