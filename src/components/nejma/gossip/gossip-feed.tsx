
"use client";

import { useEffect, useState } from 'react';
import { useDevapp } from '@/components/providers/devapp-provider';
import { useGossipFeed } from '@/lib/nejma/gossip';
import { PostComposer } from './post-composer';
import { PostCard } from './post-card';
import { PostComments } from './post-comments';
import { ServiceAdCard } from './service-ad-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function GossipFeed() {
  const { posts, ads, loading, refreshFeed, comments, ratings, userPostRatings, expandedComments, toggleComments, submitComment, ratePost, userFollows, toggleFollow, feedFilter, setFeedFilter, handleDeleteComment } = useGossipFeed();
  const { user } = useDevapp();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      if (user) {
        const q = query(collection(db, "users"), where("walletAddress", "==", user.uid));
        const usersSnapshot = await getDocs(q);
        if (!usersSnapshot.empty) {
          setCurrentUser({id: usersSnapshot.docs[0].id, ...usersSnapshot.docs[0].data()});
        }
      } else {
        setCurrentUser(null);
      }
    };
    loadCurrentUser();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 pt-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const feedItems = [];
  posts.forEach((post, index) => {
    feedItems.push(<PostCard key={post.id} post={post} onCommentClick={toggleComments} onRate={ratePost} ratings={ratings} onFollow={toggleFollow} isFollowing={!!userFollows[post.authorWallet]} userRating={userPostRatings[post.id] || 0} commentsCount={post.commentsCount || 0} />);
    if (expandedComments[post.id]) {
      feedItems.push(<PostComments key={`comments-${post.id}`} postId={post.id} comments={comments[post.id] || []} onSubmitComment={submitComment} onDeleteComment={handleDeleteComment} currentUser={currentUser} />);
    }
    if ((index + 1) % 5 === 0 && ads.length > 0) {
      const adIndex = Math.floor(index / 5) % ads.length;
      feedItems.push(<ServiceAdCard key={`ad-${index}`} ad={ads[adIndex]} />);
    }
  });

  return (
    <div>
      <PostComposer onPostCreated={refreshFeed} />
      <div className="flex gap-3 mb-6">
        <Button onClick={() => setFeedFilter('all')} variant={feedFilter === 'all' ? 'default' : 'secondary'} className="flex-1">All Posts</Button>
        <Button onClick={() => setFeedFilter('following')} variant={feedFilter === 'following' ? 'default' : 'secondary'} className="flex-1" disabled={!user}>Following</Button>
      </div>
      <div className="space-y-4">
        {feedItems.length > 0 ? feedItems : (
          <div className="text-center text-muted-foreground py-12">
            <p>{feedFilter === 'following' ? 'No posts from users you follow.' : 'No posts yet. Be the first!'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
