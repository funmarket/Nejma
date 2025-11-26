
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle } from 'lucide-react';
import StarRating from './StarRating';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { GossipPost, GossipRating, User } from '@/lib/types';


interface PostCardProps {
    post: GossipPost;
    author: User | null;
    onCommentClick: (postId: string) => void;
    onRate: (postId: string, score: number) => Promise<void>;
    ratings: Record<string, GossipRating[]>;
    onFollow: (followingId: string) => Promise<void>;
    isFollowing: boolean;
    userRating: number;
    commentsCount: number;
}

export default function PostCard({
    post,
    author,
    onCommentClick,
    onRate,
    ratings,
    onFollow,
    isFollowing,
    userRating,
    commentsCount,
}: PostCardProps) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleFollow = () => {
    if (!currentUser) {
      toast({ title: 'Please connect your wallet to follow users', variant: 'destructive' });
      return;
    }
    if (author?.userId === currentUser.userId) {
      return;
    }
    if (author?.userId) {
        onFollow(author.userId);
    }
  };
  
  const categoryVariant = (category: string) => {
    switch (category) {
      case 'announcement': return 'default';
      case 'achievement': return 'secondary';
      case 'question': return 'outline';
      default: return 'destructive';
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4">
        <Avatar className="cursor-pointer" onClick={() => author?.username && router.push(`/u/${author.username}`)}>
          <AvatarImage src={author?.profilePhotoUrl} alt={author?.username}/>
          <AvatarFallback>{author?.username?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-base cursor-pointer hover:underline" onClick={() => author?.username && router.push(`/u/${author.username}`)}>
            {author?.username || 'Anonymous'}
          </CardTitle>
          <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>{new Date(post.createdAt).toLocaleString()}</span>
            <Badge variant={categoryVariant(post.category)} className="capitalize">{post.category}</Badge>
          </div>
        </div>
        {currentUser && author && currentUser.userId !== author.userId && (
           <Button onClick={handleFollow} size="sm">
             {isFollowing ? 'Following' : 'Follow'}
           </Button>
        )}
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.imageUrl && (
          <div className="mt-4 aspect-video relative rounded-lg overflow-hidden border">
            <Image src={post.imageUrl} alt="Gossip post image" fill className="object-cover"/>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <StarRating 
            postId={post.id} 
            onRate={onRate} 
            ratings={ratings} 
            initialRating={userRating}
        />
        <Button variant="ghost" size="sm" onClick={() => onCommentClick(post.id)}>
            <MessageCircle className="w-4 h-4 mr-2" />
            {commentsCount || 0} Comments
        </Button>
      </CardFooter>
    </Card>
  );
}
