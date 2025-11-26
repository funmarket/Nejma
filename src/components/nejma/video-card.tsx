"use client";

import Link from 'next/link';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { VideoPlayer } from './video-player';
import { SidebarIcons } from './sidebar-icons';
import { BookIcon, AdoptIcon } from './custom-icons';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type VideoCardProps = {
  video: any;
  artist: any;
  onVote: (isTop: boolean) => void;
  onBook: () => void;
  onAdopt: () => void;
  onToggleBookmark: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onTip: () => void;
  bookmarked: boolean;
  currentIndex: number;
};

export function VideoCard({
  video,
  artist,
  onVote,
  onBook,
  onAdopt,
  onToggleBookmark,
  onNext,
  onPrevious,
  onTip,
  bookmarked,
  currentIndex,
}: VideoCardProps) {
  const isMobile = useIsMobile();
  if (!video) return null;

  return (
    <div className="fixed inset-0 bg-black">
        <div className="relative w-full h-full overflow-hidden">
            <VideoPlayer url={video.rawVideoInput || video.videoUrl} isActive={true} />

            <div className="absolute bottom-20 sm:bottom-24 left-4 z-10 flex flex-col gap-2">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-white">
                        <span className="flex items-center gap-1"><ThumbsUp size={14} className="text-green-400" /> {video?.topCount || 0}</span>
                        <span className="flex items-center gap-1"><ThumbsDown size={14} className="text-red-400" /> {video?.flopCount || 0}</span>
                        <span className="hidden sm:flex items-center gap-1">📊 {Math.round(video?.rankingScore || 0)}</span>
                        <span className="flex items-center gap-1"><BookIcon size={14} className="text-cyan-400" /> {video?.bookCount || 0}</span>
                        <span className="flex items-center gap-1"><AdoptIcon size={14} className="text-purple-400" /> {video?.adoptCount || 0}</span>
                    </div>
                </div>
                {artist && (
                    <Link href={`/u/${artist?.username}`} className="bg-black/60 backdrop-blur-sm hover:bg-black/75 transition text-left overflow-hidden p-2 sm:p-3 rounded-lg flex items-baseline max-w-[200px] sm:max-w-[280px]">
                        <span className="text-[10px] sm:text-xs opacity-75 font-medium text-white mr-1.5 whitespace-nowrap">Artist:</span>
                        <span className="text-sm sm:text-lg font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                            {artist?.username || 'Unknown'}
                        </span>
                    </Link>
                )}
            </div>

            <div className="absolute z-20 left-1 sm:left-2 top-1/2 -translate-y-1/2">
                <button onClick={onPrevious} disabled={currentIndex === 0} className="text-white font-bold p-2 bg-black/30 rounded-full disabled:opacity-20 disabled:cursor-not-allowed text-2xl sm:text-3xl">
                ‹
                </button>
            </div>
            
            <div className={cn("absolute z-20 top-1/2 -translate-y-1/2", isMobile ? "right-1" : "right-4")}>
                <SidebarIcons
                    handleVote={onVote}
                    handleBook={onBook}
                    handleAdopt={onAdopt}
                    toggleBookmark={onToggleBookmark}
                    nextVideo={onNext}
                    handleTip={onTip}
                    video={video}
                    bookmarked={bookmarked}
                />
            </div>
        </div>
    </div>
  );
}
