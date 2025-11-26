"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDevapp } from '@/components/providers/devapp-provider';
import { useToast } from '@/components/providers/toast-provider';
import { StarRating } from './star-rating';
import { MessageCircle, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function PostCard({ post, onCommentClick, onRate, ratings, onFollow, isFollowing, userRating, commentsCount }: any) {
  const { devbaseClient, user } = useDevapp();
  const router = useRouter();
  const { addToast } = useToast();

  const [author, setAuthor] = useState<any>(null);
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);

  useEffect(() => {
    const loadAuthor = async () => {
      const users = await devbaseClient.listEntities('users', { walletAddress: post.authorWallet });
      if (users.length > 0) setAuthor(users[0]);
    };
    loadAuthor();
  }, [post.authorWallet, devbaseClient]);

  const handleFollow = () => {
    if (!user) { addToast('Please connect your wallet to follow users', 'error'); return; }
    if (post.authorWallet === user.uid) return;
    onFollow(post.authorWallet);
  };

  const categoryColors = {
    general: 'bg-green-500/20 text-green-400 border-green-500/30',
    announcement: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    achievement: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    question: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <div onClick={() => author?.username && router.push(`/u/${author.username}`)} className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 bg-primary/20 overflow-hidden">
          {author?.profilePhotoUrl ? <Image src={author.profilePhotoUrl} alt="" width={40} height={40} className="w-full h-full object-cover" /> : <User size={20} className="text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span onClick={() => author?.username && router.push(`/u/${author.username}`)} className="text-foreground font-bold cursor-pointer hover:underline truncate">
              {author?.username || 'Anonymous'}
            </span>
            <Badge variant="outline" className={cn("capitalize text-xs", categoryColors[post.category as keyof typeof categoryColors] || categoryColors.general)}>{post.category}</Badge>
          </div>
          <span className="text-muted-foreground text-xs block mt-1">{new Date(post.createdAt).toLocaleString()}</span>
        </div>
        {user && post.authorWallet !== user.uid && (
            <Button onClick={handleFollow} onMouseEnter={() => setIsHoveringFollow(true)} onMouseLeave={() => setIsHoveringFollow(false)} size="sm" variant={isFollowing ? 'secondary' : 'outline'}>
                {isFollowing ? (isHoveringFollow ? 'Unfollow' : 'Following') : 'Follow'}
            </Button>
        )}
      </div>

      <p className="text-foreground mb-3 break-words">{post.content}</p>

      {post.imageUrl && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
              <Image src={post.imageUrl} alt="" layout="fill" objectFit="cover" />
          </div>
      )}

      <div className="flex items-center gap-4 text-sm flex-wrap justify-between">
        <StarRating postId={post.id} onRate={onRate} ratings={ratings} initialRating={userRating} />
        <button onClick={() => onCommentClick(post.id)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <MessageCircle size={16} />
          <span className="text-sm">Comments ({commentsCount})</span>
        </button>
      </div>
    </Card>
  );
}
