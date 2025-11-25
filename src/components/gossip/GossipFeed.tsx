
'use client';

import PostComposer from './PostComposer';
import PostCard from './PostCard';
import ServiceAdCard from './ServiceAdCard';
import { useGossipFeed } from '@/hooks/useGossipFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '../ui/button';

export default function GossipFeed() {
  const {
    posts,
    ads,
    loading,
    refreshFeed,
    comments,
    ratings,
    userPostRatings,
    expandedComments,
    toggleComments,
    submitComment,
    ratePost,
    userFollows,
    toggleFollow,
    feedFilter,
    setFeedFilter,
    handleDeleteComment,
    authors,
  } = useGossipFeed();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const feedItems = [];
  posts.forEach((post, index) => {
    feedItems.push(
      <PostCard
        key={post.id}
        post={post}
        author={authors[post.authorWallet]}
        onCommentClick={toggleComments}
        onRate={ratePost}
        ratings={ratings}
        onFollow={toggleFollow}
        isFollowing={!!userFollows[post.authorWallet]}
        userRating={userPostRatings[post.id] || 0}
        commentsCount={post.commentsCount || 0}
      />
    );
    if (expandedComments[post.id]) {
      // Placeholder for comments section
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
        <Button onClick={() => setFeedFilter('all')} variant={feedFilter === 'all' ? 'default' : 'secondary'} className="flex-1">
          All Posts
        </Button>
        <Button onClick={() => setFeedFilter('following')} variant={feedFilter === 'following' ? 'default' : 'secondary'} className="flex-1">
          Following
        </Button>
      </div>
      <div className="space-y-4">
        {feedItems}
        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {feedFilter === 'following' ? 'No posts from users you follow.' : 'No posts yet. Be the first!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

