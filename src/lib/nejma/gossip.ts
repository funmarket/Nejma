
"use client";
import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, where, orderBy, getDocs, doc, writeBatch, addDoc, serverTimestamp, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';

export function useGossipApi() {
  const { user } = useUser();

  const createPost = useCallback(async (postData: any) => {
    if (!user) throw new Error("User not authenticated");
    return addDoc(collection(db, 'gossip_posts'), {
        ...postData,
        authorWallet: user.walletAddress,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        commentsCount: 0,
        rating: 0,
        ratingCount: 0,
    });
  }, [user]);

  const createComment = useCallback(async (postId: string, content: string) => {
    if (!user) throw new Error("User not authenticated");
    const batch = writeBatch(db);
    
    const commentRef = doc(collection(db, 'gossip_comments'));
    batch.set(commentRef, {
        postId,
        content,
        authorWallet: user.walletAddress,
        createdAt: serverTimestamp(),
    });

    const postRef = doc(db, 'gossip_posts', postId);
    const postSnap = await getDoc(postRef);
    if(postSnap.exists()) {
        batch.update(postRef, { commentsCount: (postSnap.data().commentsCount || 0) + 1 });
    }
    
    await batch.commit();

  }, [user]);

  const deleteComment = useCallback(async (commentId: string, postId: string) => {
    const batch = writeBatch(db);

    const commentRef = doc(db, 'gossip_comments', commentId);
    batch.delete(commentRef);

    const postRef = doc(db, 'gossip_posts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists() && (postSnap.data().commentsCount || 0) > 0) {
        batch.update(postRef, { commentsCount: postSnap.data().commentsCount - 1 });
    }

    await batch.commit();

  }, []);
  
  const ratePost = useCallback(async (postId: string, score: number) => {
    if (!user) throw new Error("User not authenticated");

    const ratingsQuery = query(collection(db, 'gossip_ratings'), where('postId', '==', postId), where('raterWallet', '==', user.walletAddress));
    const querySnapshot = await getDocs(ratingsQuery);

    const batch = writeBatch(db);
    
    if (!querySnapshot.empty) {
        const ratingDocRef = querySnapshot.docs[0].ref;
        batch.update(ratingDocRef, { score });
    } else {
        const newRatingRef = doc(collection(db, 'gossip_ratings'));
        batch.set(newRatingRef, { postId, score, raterWallet: user.walletAddress, createdAt: serverTimestamp() });
    }

    const postRef = doc(db, 'gossip_posts', postId);
    const allRatingsQuery = query(collection(db, 'gossip_ratings'), where('postId', '==', postId));
    const allRatingsSnapshot = await getDocs(allRatingsQuery);
    
    const allRatings = allRatingsSnapshot.docs.map(d => d.data());
    const existingRating = allRatings.find(r => r.raterWallet === user.walletAddress);
    
    let totalScore = allRatings.reduce((sum, r) => sum + r.score, 0);
    let ratingCount = allRatings.length;

    if (existingRating) {
        totalScore = (totalScore - existingRating.score) + score;
    } else {
        totalScore += score;
        ratingCount += 1;
    }
    
    const avgRating = ratingCount > 0 ? totalScore / ratingCount : 0;
    batch.update(postRef, { rating: avgRating, ratingCount });
    
    await batch.commit();

  }, [user]);
  
  const followUser = useCallback(async (followingId: string) => {
    if(!user) throw new Error("User not authenticated");
    return addDoc(collection(db, 'gossip_user_follows'), { followerWallet: user.walletAddress, followingId, createdAt: serverTimestamp() });
  }, [user]);
  
  const unfollowUser = useCallback(async (followId: string) => {
    return deleteDoc(doc(db, 'gossip_user_follows', followId));
  }, []);

  return { createPost, createComment, deleteComment, ratePost, followUser, unfollowUser };
}

export function useGossipFeed() {
  const api = useGossipApi();
  const { user } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [ratings, setRatings] = useState<Record<string, any[]>>({});
  const [userPostRatings, setUserPostRatings] = useState<Record<string, number>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [userFollows, setUserFollows] = useState<Record<string, string>>({});
  const [feedFilter, setFeedFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const postsQuery = query(collection(db, 'gossip_posts'), orderBy('createdAt', 'desc'));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching posts:", error);
        setLoading(false);
    });

    const adsQuery = query(collection(db, 'gossip_service_ads'));
    const unsubscribeAds = onSnapshot(adsQuery, (snapshot) => {
        const adsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAds(adsData);
    });

    return () => {
        unsubscribePosts();
        unsubscribeAds();
    };
  }, []);

  useEffect(() => {
    if (!user) {
        setUserFollows({});
        return;
    }
    const followsQuery = query(collection(db, 'gossip_user_follows'), where('followerWallet', '==', user.walletAddress));
    const unsubscribeFollows = onSnapshot(followsQuery, (snapshot) => {
        const followsMap: Record<string, string> = {};
        snapshot.forEach(doc => {
            followsMap[doc.data().followingId] = doc.id;
        });
        setUserFollows(followsMap);
    });
    return () => unsubscribeFollows();
  }, [user]);

  useEffect(() => {
      if (posts.length === 0) return;

      const postIds = posts.map(p => p.id);
      if (postIds.length === 0) return;

      const ratingsQuery = query(collection(db, 'gossip_ratings'), where('postId', 'in', postIds));
      const unsubscribeRatings = onSnapshot(ratingsQuery, (snapshot) => {
          const allRatingsMap: Record<string, any[]> = {};
          const userRatingsMap: Record<string, number> = {};

          posts.forEach(p => allRatingsMap[p.id] = []);

          snapshot.docs.forEach(doc => {
              const rating = doc.data();
              if (allRatingsMap[rating.postId]) {
                  allRatingsMap[rating.postId].push(rating);
              }
              if (user && rating.raterWallet === user.walletAddress) {
                  userRatingsMap[rating.postId] = rating.score;
              }
          });
          setRatings(allRatingsMap);
          setUserPostRatings(userRatingsMap);
      });

      return () => unsubscribeRatings();

  }, [posts, user]);

  const toggleComments = useCallback(async (postId: string) => {
    setExpandedComments(prev => {
        const isOpening = !prev[postId];
        if (isOpening && !comments[postId]) {
             const commentsQuery = query(collection(db, 'gossip_comments'), where('postId', '==', postId), orderBy('createdAt', 'asc'));
             onSnapshot(commentsQuery, (snapshot) => {
                const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setComments(prevComments => ({ ...prevComments, [postId]: commentsData }));
             });
        }
        return { ...prev, [postId]: isOpening };
    });
  }, [comments]);

  const toggleFollow = useCallback(async (followingId: string) => {
    if (!user) return;
    const followId = userFollows[followingId];
    if (followId) {
      await api.unfollowUser(followId);
    } else {
      await api.followUser(followingId);
    }
  }, [api, user, userFollows]);

  const filteredPosts = feedFilter === 'following' ? posts.filter(post => userFollows[post.authorWallet]) : posts;

  return { 
      posts: filteredPosts, 
      ads, 
      loading, 
      refreshFeed: () => {}, 
      comments, 
      ratings, 
      userPostRatings, 
      expandedComments, 
      toggleComments, 
      submitComment: api.createComment, 
      ratePost: api.ratePost,
      userFollows, toggleFollow, 
      feedFilter, 
      setFeedFilter, 
      handleDeleteComment: api.deleteComment 
  };
}
