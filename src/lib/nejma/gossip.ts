
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useDevapp } from '@/components/providers/devapp-provider';

export function useGossipApi() {
  const { devbaseClient, user } = useDevapp();

  const listPosts = useCallback(async () => {
    return devbaseClient.listEntities('gossip_posts');
  }, [devbaseClient]);

  const createPost = useCallback(async (postData: any) => {
    if (!user) throw new Error("User not authenticated");
    return devbaseClient.createEntity('gossip_posts', {
      ...postData,
      authorWallet: user.uid,
      createdAt: Date.now(),
      commentsCount: 0,
      rating: 0,
      ratingCount: 0
    });
  }, [devbaseClient, user]);

  const listComments = useCallback(async (postId: string) => {
    return devbaseClient.listEntities('gossip_comments', { postId });
  }, [devbaseClient]);

  const createComment = useCallback(async (postId: string, content: string) => {
    if (!user) throw new Error("User not authenticated");
    return devbaseClient.createEntity('gossip_comments', {
      postId,
      content,
      authorWallet: user.uid,
      createdAt: Date.now(),
    });
  }, [devbaseClient, user]);

  const deleteComment = useCallback(async (commentId: string) => {
    return devbaseClient.deleteEntity('gossip_comments', commentId);
  }, [devbaseClient]);
  
  const ratePost = useCallback(async (postId: string, score: number) => {
    if (!user) throw new Error("User not authenticated");
    const existingRatings = await devbaseClient.listEntities('gossip_ratings', {
      postId,
      raterWallet: user.uid,
    });
    if (existingRatings.length > 0) {
      return devbaseClient.updateEntity('gossip_ratings', existingRatings[0].id, { score });
    } else {
      return devbaseClient.createEntity('gossip_ratings', { postId, score, raterWallet: user.uid, createdAt: Date.now() });
    }
  }, [devbaseClient, user]);

  const getRatings = useCallback(async (postId: string) => {
    return devbaseClient.listEntities('gossip_ratings', { postId });
  }, [devbaseClient]);
  
  const getUserRatingForPost = useCallback(async (postId: string, walletAddress: string) => {
    if (!walletAddress) return 0;
    const ratings = await devbaseClient.listEntities('gossip_ratings', {
      postId,
      raterWallet: walletAddress,
    });
    return ratings.length > 0 ? ratings[0].score : 0;
  }, [devbaseClient]);
  
  const listServiceAds = useCallback(async () => {
    return devbaseClient.listEntities('gossip_service_ads');
  }, [devbaseClient]);
  
  const followUser = useCallback(async (followingId: string) => {
    if(!user) throw new Error("User not authenticated");
    return devbaseClient.createEntity('gossip_user_follows', { followerWallet: user.uid, followingId, createdAt: Date.now() });
  }, [devbaseClient, user]);
  
  const unfollowUser = useCallback(async (followId: string) => {
    return devbaseClient.deleteEntity('gossip_user_follows', followId);
  }, [devbaseClient]);
  
  const getUserFollows = useCallback(async () => {
    if (!user) return [];
    return devbaseClient.listEntities('gossip_user_follows', { followerWallet: user.uid });
  }, [devbaseClient, user]);

  return { listPosts, createPost, listComments, createComment, deleteComment, ratePost, getRatings, getUserRatingForPost, listServiceAds, followUser, unfollowUser, getUserFollows };
}

export function useGossipFeed() {
  const api = useGossipApi();
  const { user, devbaseClient } = useDevapp();
  const [posts, setPosts] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [ratings, setRatings] = useState<Record<string, any[]>>({});
  const [userPostRatings, setUserPostRatings] = useState<Record<string, number>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [userFollows, setUserFollows] = useState<Record<string, string>>({});
  const [feedFilter, setFeedFilter] = useState('all');

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const [postsData, adsData, followsData] = await Promise.all([
        api.listPosts(),
        api.listServiceAds(),
        user ? api.getUserFollows() : Promise.resolve([]),
      ]);
      
      const sortedPosts = postsData.sort((a, b) => b.createdAt - a.createdAt);
      setPosts(sortedPosts);
      setAds(adsData);
      
      const followsMap: Record<string, string> = {};
      followsData.forEach((follow: any) => {
        followsMap[follow.followingId] = follow.id;
      });
      setUserFollows(followsMap);

      if (user) {
        const ratingsPromises = sortedPosts.map(post => api.getRatings(post.id));
        const userRatingsPromises = sortedPosts.map(post => api.getUserRatingForPost(post.id, user.uid));
        
        const allRatingsResults = await Promise.all(ratingsPromises);
        const userRatingsResults = await Promise.all(userRatingsPromises);

        const allRatingsMap: Record<string, any[]> = {};
        const userRatingsMap: Record<string, number> = {};

        sortedPosts.forEach((post, index) => {
          allRatingsMap[post.id] = allRatingsResults[index];
          userRatingsMap[post.id] = userRatingsResults[index];
        });

        setRatings(allRatingsMap);
        setUserPostRatings(userRatingsMap);
      } else {
        setRatings({});
        setUserPostRatings({});
      }
    } catch (error) {
      console.error("Error loading feed:", error);
    } finally {
      setLoading(false);
    }
  }, [api, user]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const toggleComments = useCallback(async (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId] && (!expandedComments[postId])) { // fetch only if opening and not already fetched
      const commentsData = await api.listComments(postId);
      setComments(prev => ({ ...prev, [postId]: commentsData.sort((a, b) => a.createdAt - b.createdAt) }));
    }
  }, [api, comments, expandedComments]);

  const submitComment = useCallback(async (postId: string, content: string) => {
    await api.createComment(postId, content);
    const postToUpdate = posts.find(p => p.id === postId);
    if (postToUpdate && devbaseClient) {
      await devbaseClient.updateEntity('gossip_posts', postId, { commentsCount: (postToUpdate.commentsCount || 0) + 1 });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
    }
    const commentsData = await api.listComments(postId);
    setComments(prev => ({ ...prev, [postId]: commentsData.sort((a, b) => a.createdAt - b.createdAt) }));
  }, [api, devbaseClient, posts]);

  const handleDeleteComment = useCallback(async (commentId: string, postId: string) => {
    await api.deleteComment(commentId);
    const postToUpdate = posts.find(p => p.id === postId);
    if (postToUpdate && postToUpdate.commentsCount > 0 && devbaseClient) {
      await devbaseClient.updateEntity('gossip_posts', postId, { commentsCount: postToUpdate.commentsCount - 1 });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount - 1 } : p));
    }
    const updatedComments = await api.listComments(postId);
    setComments(prev => ({ ...prev, [postId]: updatedComments.sort((a, b) => a.createdAt - b.createdAt) }));
  }, [api, devbaseClient, posts]);
  
  const ratePost = useCallback(async (postId: string, score: number) => {
    if (!user) return;
    await api.ratePost(postId, score);
    const ratingsData = await api.getRatings(postId);

    const totalScore = ratingsData.reduce((sum, r) => sum + r.score, 0);
    const avgRating = ratingsData.length > 0 ? totalScore / ratingsData.length : 0;

    if (devbaseClient) {
      await devbaseClient.updateEntity('gossip_posts', postId, {
        rating: avgRating,
        ratingCount: ratingsData.length,
      });
    }

    setRatings(prev => ({ ...prev, [postId]: ratingsData }));
    setUserPostRatings(prev => ({ ...prev, [postId]: score }));
  }, [api, user, devbaseClient]);

  const toggleFollow = useCallback(async (followingId: string) => {
    if (!user) return;
    const followId = userFollows[followingId];
    if (followId) {
      await api.unfollowUser(followId);
      setUserFollows(prev => {
        const newFollows = { ...prev };
        delete newFollows[followingId];
        return newFollows;
      });
    } else {
      const newFollow = await api.followUser(followingId);
      if(newFollow) {
        setUserFollows(prev => ({ ...prev, [followingId]: newFollow.id }));
      }
    }
  }, [api, user, userFollows]);

  const filteredPosts = feedFilter === 'following' ? posts.filter(post => userFollows[post.authorWallet]) : posts;

  return { posts: filteredPosts, ads, loading, refreshFeed: loadFeed, comments, ratings, userPostRatings, expandedComments, toggleComments, submitComment, ratePost, userFollows, toggleFollow, feedFilter, setFeedFilter, handleDeleteComment };
}
