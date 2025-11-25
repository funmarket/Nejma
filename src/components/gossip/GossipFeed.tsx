
'use client';

import PostComposer from './PostComposer';
import PostCard from './PostCard';
import ServiceAdCard from './ServiceAdCard';
import { useGossipFeed } from '@/hooks/useGossipFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '../ui/button';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, Trash2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useState } from 'react';
import { Textarea } from '../ui/textarea';

function CommentsSection({ postId, comments, authors, onDeleteComment, onSubmitComment }: { 
    postId: string, 
    comments: any[], 
    authors: Record<string, any>,
    onDeleteComment: (commentId: string, postId: string) => void,
    onSubmitComment: (postId: string, content: string) => void,
}) {
    const { userWallet } = useAuth();
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(newComment.trim()) {
            onSubmitComment(postId, newComment.trim());
            setNewComment('');
        }
    }

    return (
        <div className="bg-muted/30 border-t border-border mt-4 p-4 space-y-4">
            {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={authors[comment.authorWallet]?.profilePhotoUrl} />
                        <AvatarFallback>{authors[comment.authorWallet]?.username[0]?.toUpperCase() || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-sm">@{authors[comment.authorWallet]?.username || 'anonymous'}</p>
                            {userWallet === comment.authorWallet && (
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDeleteComment(comment.id, postId)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                </div>
            ))}
             <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <Textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                    rows={1}
                />
                <Button type="submit" size="icon" disabled={!newComment.trim()}>
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    )
}

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

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  const feedItems: JSX.Element[] = [];

  posts.forEach((post, index) => {
    feedItems.push(
      <div key={post.id} className="bg-muted/50 rounded-xl border border-border">
          <PostCard
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
          {expandedComments[post.id] && (
            <CommentsSection 
                postId={post.id} 
                comments={comments[post.id] || []}
                authors={authors}
                onDeleteComment={handleDeleteComment}
                onSubmitComment={submitComment}
            />
          )}
      </div>
    );
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
        {!loading && posts.length === 0 && (
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
