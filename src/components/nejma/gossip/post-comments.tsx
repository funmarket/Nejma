"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDevapp } from '@/components/providers/devapp-provider';
import { ADMIN_WALLET } from '@/lib/nejma/constants';
import { User, Send, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function PostComments({ postId, comments, onSubmitComment, onDeleteComment, currentUser }: any) {
  const { user: authUser } = useDevapp();
  const router = useRouter();
  
  const [newComment, setNewComment] = useState('');
  const [commentAuthors, setCommentAuthors] = useState<Record<string, any>>({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const loadAuthors = async () => {
      const authors: Record<string, any> = {};
      const authorWallets = new Set(comments.map((c: any) => c.authorWallet));
      const walletsToFetch = Array.from(authorWallets).filter(w => w) as string[];

      if (walletsToFetch.length > 0) {
        const q = query(collection(db, "users"), where("walletAddress", "in", walletsToFetch));
        const usersSnapshot = await getDocs(q);
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            authors[userData.walletAddress] = userData;
        });
        setCommentAuthors(authors);
      }
    };
    if (comments.length > 0) loadAuthors();
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      setShowLoginPrompt(true);
      return;
    }
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    await onSubmitComment(postId, newComment.trim());
    setNewComment('');
    setIsSubmitting(false);
  };
  
  const isCommentingDisabled = !authUser;

  return (
    <div className="mt-4 rounded-lg p-3 bg-muted/30 border border-border">
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {comments.map((comment: any) => {
          const author = commentAuthors[comment.authorWallet];
          const canDelete = authUser && (authUser.uid === comment.authorWallet || authUser.uid === ADMIN_WALLET);
          return (
            <div key={comment.id} className="group flex items-start gap-2 text-sm">
              <div className="w-8 h-8 rounded-full flex-shrink-0 bg-primary/20 overflow-hidden">
                {author?.profilePhotoUrl ? <Image src={author.profilePhotoUrl} alt="" width={32} height={32} className="w-full h-full object-cover" /> : <User className="w-full h-full p-1.5 text-primary" />}
              </div>
              <div className="flex-1">
                <span className="font-bold text-foreground">{author?.username || 'Anonymous'}</span>
                <p className="text-muted-foreground">{comment.content}</p>
              </div>
              {canDelete && (
                  <Button onClick={() => onDeleteComment(comment.id, postId)} variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <Input
          type="text"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder={isCommentingDisabled ? "Connect wallet to comment..." : "Add a comment..."}
          disabled={isCommentingDisabled || isSubmitting}
          onClick={() => isCommentingDisabled && setShowLoginPrompt(true)}
        />
        <Button type="submit" disabled={isCommentingDisabled || !newComment.trim() || isSubmitting} size="icon">
          <Send size={16} />
        </Button>
      </form>

      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Join the Conversation!</DialogTitle>
                  <DialogDescription>
                      You need to create an account to comment on posts. It's free and unlocks more features!
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                  <DialogClose asChild><Button variant="secondary">Maybe Later</Button></DialogClose>
                  <Button onClick={() => { setShowLoginPrompt(false); router.push('/onboarding'); }}>Create Account</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
