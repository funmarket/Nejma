'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ThumbsUp, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User as UserType, Video } from '@/lib/types';
import { getActiveUsers } from '@/lib/actions/user.actions';
import { getVideos } from '@/lib/actions/video.actions';
import { Skeleton } from '../ui/skeleton';

export default function SearchResults({ query }: { query: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const loadSearchResults = async () => {
      if (!query.trim()) {
        setLoading(false);
        setUsers([]);
        setVideos([]);
        return;
      }
      setLoading(true);
      try {
        const lowerCaseQuery = query.toLowerCase();
        
        const allUsers = await getActiveUsers();
        const matchingUsers = allUsers.filter(u => 
          u.username?.toLowerCase().includes(lowerCaseQuery) || 
          u.bio?.toLowerCase().includes(lowerCaseQuery)
        );
        setUsers(matchingUsers);

        const allVideos = await getVideos({ status: 'active' });
        const matchingVideos = allVideos.filter(v => 
          v.description?.toLowerCase().includes(lowerCaseQuery) ||
          v.category?.toLowerCase().includes(lowerCaseQuery)
        );
        setVideos(matchingVideos);

      } catch (error) {
        console.error('Error searching:', error);
        addToast('Could not perform search.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadSearchResults();
  }, [query, addToast]);

  if (loading) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-6 w-3/4 mb-6" />
          <div className="mb-8">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="grid gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
           <div className="mb-8">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="grid md:grid-cols-2 gap-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Search Results</h1>
      <p className="text-gray-400 mb-6">Showing results for "{query}"</p>

      {users.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Users ({users.length})</h2>
          <div className="grid gap-4">
            {users.map(user => (
              <div key={user.id} onClick={() => router.push(`/u/${user.username}`)} className="bg-gray-900 rounded-xl p-4 cursor-pointer hover:bg-gray-800 transition-colors border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                    {user.profilePhotoUrl ? (
                      <Image src={user.profilePhotoUrl} alt={user.username} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      user.username?.[0]?.toUpperCase() || <User />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-bold">@{user.username}</p>
                    <p className="text-gray-400 text-sm capitalize">{user.role || 'User'}</p>
                  </div>
                </div>
                {user.bio && <p className="text-gray-400 text-sm mt-2 line-clamp-2">{user.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Videos ({videos.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {videos.map(video => (
              <div key={video.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="aspect-video bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <p className="text-white font-bold mb-2 line-clamp-2">{video.description}</p>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> {video.topCount || 0}</span>
                  <span>{video.views || 0} views</span>
                  <span className="capitalize">{video.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {users.length === 0 && videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No results found for "{query}"</p>
          <p className="text-gray-500 text-sm mt-2">Try searching with different keywords</p>
        </div>
      )}
    </div>
  );
}

    