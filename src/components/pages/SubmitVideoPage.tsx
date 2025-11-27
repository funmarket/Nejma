"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/toast-provider';
import { parseYouTubeUrl } from '@/lib/nejma/youtube';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { VideoSummarizer } from '@/components/nejma/video-summarizer';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';

export function SubmitVideoPage() {
  const { user } = useUser();
  const router = useRouter();
  const { addToast } = useToast();

  const [rawVideoInput, setRawVideoInput] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('music');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/onboarding');
    }
  }, [user, router]);

  useEffect(() => {
    if (rawVideoInput.trim()) {
      const parsedUrl = parseYouTubeUrl(rawVideoInput);
      if (!parsedUrl) {
        setParseError('Invalid YouTube link. Please use a valid YouTube URL.');
        setPreviewUrl(null);
      } else {
        setParseError(null);
        setPreviewUrl(parsedUrl);
      }
    } else {
      setParseError(null);
      setPreviewUrl(null);
    }
  }, [rawVideoInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (user.role !== 'artist') {
      addToast('Only artists can upload videos. Please create an artist profile.', 'error');
      return;
    }
    const parsedUrl = parseYouTubeUrl(rawVideoInput);
    if (!parsedUrl) {
      addToast('Invalid YouTube link.', 'error');
      return;
    }
    if (!description) {
        addToast('Please add a description.', 'error');
        return;
    }
    setIsSubmitting(true);
    try {
      const newVideoRef = await addDoc(collection(db, 'videos'), {
        artistId: user.userId,
        rawVideoInput: rawVideoInput.trim(),
        description,
        category,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        topCount: 0,
        flopCount: 0,
        views: 0,
        rankingScore: 0,
        bookCount: 0,
        adoptCount: 0,
      });
      await updateDoc(doc(db, 'videos', newVideoRef.id), { videoId: newVideoRef.id });
      
      addToast('Video submitted successfully!', 'success');
      router.push('/');
    } catch (error) {
      console.error('Error submitting video:', error);
      addToast('Failed to submit video. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-12 sm:pt-20 pb-20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card rounded-2xl border border-border p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-6">
          Submit Your Talent
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="video-url">Video URL</Label>
            <Textarea
              id="video-url"
              value={rawVideoInput}
              onChange={e => setRawVideoInput(e.target.value)}
              required
              rows={3}
              className="font-mono text-sm"
              placeholder="Paste YouTube link (e.g., youtube.com/watch?v=... or youtu.be/...)"
            />
            {parseError && <p className="mt-2 text-destructive text-sm">{parseError}</p>}
          </div>

          {previewUrl && (
            <div>
              <Label>Preview</Label>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Video Preview"
                />
              </div>
              <p className="mt-2 text-green-500 text-sm">✓ Video parsed successfully</p>
            </div>
          )}

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="acting">Acting</SelectItem>
                <SelectItem value="dance">Dance</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
                <SelectItem value="creator">Content Creator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Describe your talent, the video, etc."
            />
          </div>

          <VideoSummarizer 
            videoUrl={rawVideoInput}
            onSummaryGenerated={(summary) => setDescription(prev => prev ? `${prev}\n\n${summary}`.trim() : summary)}
          />

          <Button type="submit" disabled={isSubmitting || !!parseError || !previewUrl} className="w-full !mt-8" size="lg">
            {isSubmitting ? 'Submitting...' : 'Submit Video'}
          </Button>
        </form>
      </div>
    </div>
  );
}
