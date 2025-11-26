"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDevapp } from '@/components/providers/devapp-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, ThumbsUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export function SearchResultsPage() {
  const searchParams = useSearchParams();
  const { devbaseClient } = useDevapp();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const loadSearchResults = async () => {
      if (!devbaseClient || !searchQuery.trim()) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const query = searchQuery.toLowerCase();
        
        // This is not efficient for Firestore. Real-world would need a search service like Algolia/Typesense.
        // Emulating the original logic for now.
        const allVideos = await devbaseClient.listEntities('videos', { status: 'active' });
        const matchingVideos = allVideos.filter(v => 
          v.description?.toLowerCase().includes(query) || 
          v.category?.toLowerCase().includes(query)
        );

        const allUsers = await devbaseClient.listEntities('users');
        const matchingUsers = allUsers.filter(u => 
          u.username?.toLowerCase().includes(query) || 
          u.bio?.toLowerCase().includes(query)
        );

        setVideos(matchingVideos);
        setUsers(matchingUsers);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSearchResults();
  }, [searchQuery, devbaseClient]);

  return (
    <div className="min-h-screen text-foreground pt-6 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground mb-6">Showing results for "{searchQuery}"</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : (
          <>
            {users.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Users ({users.length})</h2>
                <div className="grid gap-4">
                  {users.map(user => (
                    <Card key={user.id} onClick={() => router.push(`/u/${user.username}`)} className="bg-card p-4 cursor-pointer hover:bg-muted transition-colors border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold overflow-hidden">
                          {user.profilePhotoUrl ? (
                            <Image src={user.profilePhotoUrl} alt={user.username} width={48} height={48} className="w-full h-full object-cover" />
                          ) : (
                            user.username?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <p className="text-foreground font-bold">@{user.username}</p>
                          <p className="text-muted-foreground text-sm capitalize">{user.role || 'User'}</p>
                        </div>
                      </div>
                      {user.bio && <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{user.bio}</p>}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {videos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Videos ({videos.length})</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {videos.map(video => (
                    <Card key={video.id} className="bg-card p-4 border-border">
                      <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-primary" />
                      </div>
                      <p className="text-foreground font-bold mb-2 line-clamp-2">{video.description}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> {video.topCount || 0}</span>
                        <span>{video.views || 0} views</span>
                        <span className="capitalize">{video.category}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {users.length === 0 && videos.length === 0 && (
              <div className="text-center py-16 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground text-lg">No results found for "{searchQuery}"</p>
                <p className="text-muted-foreground/70 text-sm mt-2">Try searching with different keywords.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
