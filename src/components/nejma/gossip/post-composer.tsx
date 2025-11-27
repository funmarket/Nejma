"use client";
import { useState } from 'react';
import { useToast } from '@/components/providers/toast-provider';
import { useGossipApi } from '@/lib/nejma/gossip';
import { sanitizeUrl } from '@/lib/nejma/youtube';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-user';

export function PostComposer({ onPostCreated }: { onPostCreated: () => void }) {
  const { user } = useAuth();
  const api = useGossipApi();
  const { addToast } = useToast();

  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) { addToast('Please connect your wallet to post.', 'error'); return; }
    if (!content.trim()) { addToast('Post content cannot be empty.', 'error'); return; }

    const sanitizedImageUrl = sanitizeUrl(imageUrl.trim());
    if (imageUrl.trim() && !sanitizedImageUrl) {
      addToast('Invalid or unsafe image URL.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createPost({ content: content.trim(), imageUrl: sanitizedImageUrl, category });
      setContent('');
      setImageUrl('');
      setCategory('general');
      addToast('Post created successfully!', 'success');
      onPostCreated();
    } catch (error) {
      addToast('Failed to create post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          rows={3}
        />
        <Input
          type="url"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          placeholder="Image URL (optional)"
          className="bg-muted border-border"
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="achievement">Achievement</SelectItem>
              <SelectItem value="question">Question</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit} disabled={!content.trim() || submitting || !user} className="w-full sm:w-auto flex-grow">
            {submitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </div>
  );
}
