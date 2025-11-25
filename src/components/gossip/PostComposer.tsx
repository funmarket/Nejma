
'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createPost } from '@/lib/actions/gossip.actions';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sanitizeUrl } from '@/lib/utils';

export default function PostComposer({ onPostCreated }: { onPostCreated: () => void }) {
  const { userWallet } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!userWallet) {
      toast({ title: 'Please connect your wallet to post.', variant: 'destructive' });
      return;
    }
    if (!content.trim()) {
      toast({ title: 'Post content cannot be empty.', variant: 'destructive' });
      return;
    }
    let sanitizedImageUrl = '';
    if (imageUrl.trim()) {
        sanitizedImageUrl = sanitizeUrl(imageUrl.trim()) || '';
        if (!sanitizedImageUrl) {
            toast({ title: 'Invalid or unsafe image URL.', variant: 'destructive' });
            return;
        }
    }

    setSubmitting(true);
    try {
      await createPost({
        content: content.trim(),
        imageUrl: sanitizedImageUrl,
        category,
        authorWallet: userWallet,
      });
      setContent('');
      setImageUrl('');
      setCategory('general');
      toast({ title: 'Post created!', description: 'Your post is now live on the feed.' });
      onPostCreated();
    } catch (error) {
      toast({ title: 'Error creating post', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-muted/50 rounded-xl border border-border p-4 mb-6">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="bg-transparent border-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base min-h-[60px]"
      />
      <Input
        type="url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Image URL (optional)"
        className="my-2"
      />
      <div className="flex justify-between items-center mt-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="announcement">Announcement</SelectItem>
            <SelectItem value="achievement">Achievement</SelectItem>
            <SelectItem value="question">Question</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSubmit} disabled={!content.trim() || submitting || !userWallet}>
          {submitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </div>
  );
}
