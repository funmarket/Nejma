'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Video, User } from '@/lib/types';
import VideoPlayer from './VideoPlayer';
import SidebarIcons from './SidebarIcons';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { BookIcon, AdoptIcon } from './VideoActionIcons';

interface VideoCardProps {
  video: Video;
  artist?: User;
  isActive: boolean;
  isBookmarked: boolean;
  onVote: (isTop: boolean) => void;
  onToggleBookmark: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onTip: () => void;
  onBook: () => void;
  onAdopt: () => void;
}

export default function VideoCard({
  video,
  artist,
  isActive,
  isBookmarked,
  onVote,
  onToggleBookmark,
  onNext,
  onPrevious,
  onTip,
  onBook,
  onAdopt,
}: VideoCardProps) {
  const router = useRouter();

  const handleProfileClick = () => {
    if (artist?.username) {
      router.push(`/u/${artist.username}`);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <VideoPlayer url={video.rawVideoInput} isActive={isActive} />

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center gap-3 text-xs text-white">
            <span className="flex items-center gap-1">
              <ThumbsUp size={14} className="text-green-400" />
              {video?.topCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsDown size={14} className="text-red-400" />
              {video?.flopCount || 0}
            </span>
            <span className="flex items-center gap-1">📊 {Math.round(video?.rankingScore || 0)}</span>
            <span className="flex items-center gap-1">
              <BookIcon size={14} className="text-cyan-400" />
              {video?.bookCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <AdoptIcon size={14} className="text-purple-400" />
              {video?.adoptCount || 0}
            </span>
          </div>
        </div>

        {artist && (
          <button
            onClick={handleProfileClick}
            className="group flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-lg p-2 hover:bg-black/80 transition-colors max-w-[200px] sm:max-w-xs"
          >
            <Image
              src={artist.profilePhotoUrl || "https://picsum.photos/seed/avatar/40/40"}
              alt={artist.username}
              width={40}
              height={40}
              className="rounded-full w-8 h-8 sm:w-10 sm:h-10 object-cover border-2 border-primary/50"
              data-ai-hint="person avatar"
            />
            <div className="text-left overflow-hidden">
              <p className="text-sm sm:text-base font-bold text-white truncate group-hover:text-primary transition-colors">
                @{artist.username}
              </p>
              <p className="text-xs text-gray-300 truncate">{video.description}</p>
            </div>
          </button>
        )}
      </div>

      <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-auto">
        <SidebarIcons
          video={video}
          isBookmarked={isBookmarked}
          onVote={onVote}
          onToggleBookmark={onToggleBookmark}
          onNext={onNext}
          onTip={onTip}
          onBook={onBook}
          onAdopt={onAdopt}
        />
      </div>
      
      <button onClick={onPrevious} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-white pointer-events-auto transition-opacity" aria-label="Previous video">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-[-90deg] w-8 h-8 sm:w-10 sm:h-10"><path d="m18 15-6-6-6 6"/></svg>
      </button>
    </div>
  );
}
