'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/providers/toast-provider';
import { createVideo } from '@/lib/actions/video.actions';
import { parseYouTubeUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { VideoCategory } from '@/lib/types';

export default function SubmitVideoForm() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const { addToast } = useToast();

    const [rawVideoInput, setRawVideoInput] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<VideoCategory>('music');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            addToast('You must be logged in to submit a video.', 'error');
            return;
        }
        if (currentUser.role !== 'artist') {
            addToast('Only artists can upload videos.', 'error');
            return;
        }
        if (!previewUrl) {
            addToast('Please provide a valid YouTube link.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await createVideo({
                artistId: currentUser.userId,
                rawVideoInput: rawVideoInput.trim(),
                videoUrl: previewUrl,
                description,
                category,
            });
            addToast('Video submitted successfully.', 'success');
            router.push('/');
        } catch (error) {
            console.error('Error submitting video:', error);
            addToast('Could not submit your video. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (!currentUser || currentUser.role !== 'artist') {
        return (
            <div className="min-h-screen flex items-center justify-center text-center p-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Artists Only</h2>
                    <p className="text-gray-400 mb-6">You need an artist profile to submit videos.</p>
                    <Button onClick={() => router.push('/onboarding')}>Create an Artist Profile</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-gray-900/80 rounded-xl border border-border p-8">
                <h2 className="text-3xl font-bold text-center text-white mb-6">
                    Submit Your Talent
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="video-url">Video URL</Label>
                        <Textarea
                            id="video-url"
                            value={rawVideoInput}
                            onChange={(e) => setRawVideoInput(e.target.value)}
                            required
                            rows={3}
                            placeholder="Paste YouTube link (e.g., youtube.com/watch?v=... or youtu.be/...)"
                        />
                         {parseError && <p className="mt-2 text-red-400 text-sm">{parseError}</p>}
                    </div>

                    {previewUrl && (
                        <div>
                            <Label>Preview</Label>
                            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-border">
                                <iframe
                                    src={previewUrl.replace('autoplay=1', 'autoplay=0')} // prevent autoplay in preview
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="encrypted-media; picture-in-picture"
                                    allowFullScreen
                                    title="Video Preview"
                                />
                            </div>
                            <p className="mt-2 text-green-400 text-sm">✓ Video parsed successfully</p>
                        </div>
                    )}
                    
                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={(value: VideoCategory) => setCategory(value)}>
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
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={4}
                            placeholder="Describe your talent, the video content, etc."
                        />
                    </div>

                    <Button type="submit" disabled={isSubmitting || !!parseError || !previewUrl} className="w-full text-lg">
                        {isSubmitting ? 'Submitting...' : 'Submit Video'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
