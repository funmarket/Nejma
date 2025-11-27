
'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/providers/toast-provider';
import { createPost } from '@/lib/actions/gossip.actions';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sanitizeUrl } from '@/lib/utils';

export default function PostComposer({ onPostCreated }: { onPostCreated: () => void }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentUser) {
      addToast('Please connect your wallet to post.', 'error');
      return;
    }
    if (!content.trim()) {
      addToast('Post content cannot be empty.', 'error');
      return;
    }
    let sanitizedImageUrl = '';
    if (imageUrl.trim()) {
        sanitizedImageUrl = sanitizeUrl(imageUrl.trim()) || '';
        if (!sanitizedImageUrl) {
            addToast('Invalid or unsafe image URL.', 'error');
            return;
        }
    }

    setSubmitting(true);
    try {
      await createPost({
        content: content.trim(),
        imageUrl: sanitizedImageUrl,
        category,
        authorId: currentUser.userId,
        authorWallet: currentUser.walletAddress,
      });
      setContent('');
      setImageUrl('');
      setCategory('general');
      addToast('Post created!', 'success');
      onPostCreated();
    } catch (error) {
      addToast('Error creating post', 'error');
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
        <Button onClick={handleSubmit} disabled={!content.trim() || submitting || !currentUser}>
          {submitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </div>
  );
}
