"use client";
import { useState, useEffect } from 'react';
import { useDevapp } from '@/components/providers/devapp-provider';

export function useGossipApi() {
  const { devbaseClient, user } = useDevapp();

  const listPosts = async () => {
    return devbaseClient.listEntities('gossip_posts');
  };

  const createPost = async (postData: any) => {
    return devbaseClient.createEntity('gossip_posts', {
      ...postData,
      authorWallet: user?.uid,
      createdAt: Date.now(),
      commentsCount: 0,
    });
  };

  const listComments = async (postId: string) => {
    return devbaseClient.listEntities('gossip_comments', { postId });
  };

  const createComment = async (postId: string, content: string) => {
    return devbaseClient.createEntity('gossip_comments', {
      postId,
      content,
      authorWallet: user?.uid,
      createdAt: Date.now(),
    });
  };

  const deleteComment = async (commentId: string) => {
    return devbaseClient.deleteEntity('gossip_comments', commentId);
  };
  
  const ratePost = async (postId: string, score: number) => {
    if (!user) return;
    const existingRatings = await devbaseClient.listEntities('gossip_ratings', {
      postId,
      raterWallet: user.uid,
    });
    if (existingRatings.length > 0) {
      return devbaseClient.updateEntity('gossip_ratings', existingRatings[0].id, { score });
    } else {
      return devbaseClient.createEntity('gossip_ratings', { postId, score, raterWallet: user.uid });
    }
  };

  const getRatings = async (postId: string) => {
    return devbaseClient.listEntities('gossip_ratings', { postId });
  };
  
  const getUserRatingForPost = async (postId: string, walletAddress: string) => {
    if (!walletAddress) return 0;
    const ratings = await devbaseClient.listEntities('gossip_ratings', {
      postId,
      raterWallet: walletAddress,
    });
    return ratings.length > 0 ? ratings[0].score : 0;
  };
  
  const listServiceAds = async () => {
    return devbaseClient.listEntities('gossip_service_ads');
  };
  
  const followUser = async (followingId: string) => {
    if(!user) return;
    return devbaseClient.createEntity('gossip_user_follows', { followerWallet: user.uid, followingId });
  };
  
  const unfollowUser = async (followId: string) => {
    return devbaseClient.deleteEntity('gossip_user_follows', followId);
  };
  
  const getUserFollows = async () => {
    if (!user) return [];
    return devbaseClient.listEntities('gossip_user_follows', { followerWallet: user.uid });
  };

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

  const loadFeed = async () => {
    setLoading(true);
    const [postsData, adsData, followsData] = await Promise.all([
      api.listPosts(),
      api.listServiceAds(),
      api.getUserFollows()
    ]);
    
    setPosts(postsData.sort((a, b) => b.createdAt - a.createdAt));
    setAds(adsData);
    
    const followsMap: Record<string, string> = {};
    followsData.forEach(follow => {
      followsMap[follow.followingId] = follow.id;
    });
    setUserFollows(followsMap);

    const allRatingsMap: Record<string, any[]> = {};
    const userRatingsMap: Record<string, number> = {};
    if (user) {
      for (const post of postsData) {
        const postAllRatings = await api.getRatings(post.id);
        allRatingsMap[post.id] = postAllRatings;
        const userRating = await api.getUserRatingForPost(post.id, user.uid);
        userRatingsMap[post.id] = userRating;
      }
    }
    setRatings(allRatingsMap);
    setUserPostRatings(userRatingsMap);
    setLoading(false);
  };

  useEffect(() => {
    loadFeed();
  }, [user]);

  const toggleComments = async (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId]) {
      const commentsData = await api.listComments(postId);
      setComments(prev => ({ ...prev, [postId]: commentsData }));
    }
  };

  const submitComment = async (postId: string, content: string) => {
    await api.createComment(postId, content);
    const postToUpdate = posts.find(p => p.id === postId);
    if (postToUpdate) {
      await devbaseClient.updateEntity('gossip_posts', postId, { commentsCount: (postToUpdate.commentsCount || 0) + 1 });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
    }
    const commentsData = await api.listComments(postId);
    setComments(prev => ({ ...prev, [postId]: commentsData }));
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    await api.deleteComment(commentId);
    const postToUpdate = posts.find(p => p.id === postId);
    if (postToUpdate && postToUpdate.commentsCount > 0) {
      await devbaseClient.updateEntity('gossip_posts', postId, { commentsCount: postToUpdate.commentsCount - 1 });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount - 1 } : p));
    }
    const updatedComments = await api.listComments(postId);
    setComments(prev => ({ ...prev, [postId]: updatedComments }));
  };
  
  const ratePost = async (postId: string, score: number) => {
    await api.ratePost(postId, score);
    const ratingsData = await api.getRatings(postId);
    setRatings(prev => ({ ...prev, [postId]: ratingsData }));
    setUserPostRatings(prev => ({ ...prev, [postId]: score }));
  };

  const toggleFollow = async (followingId: string) => {
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
  };

  const filteredPosts = feedFilter === 'following' ? posts.filter(post => userFollows[post.authorWallet]) : posts;

  return { posts: filteredPosts, ads, loading, refreshFeed: loadFeed, comments, ratings, userPostRatings, expandedComments, toggleComments, submitComment, ratePost, userFollows, toggleFollow, feedFilter, setFeedFilter, handleDeleteComment };
}
