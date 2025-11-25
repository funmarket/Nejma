'use client';

import { ThumbsUp, ThumbsDown, Heart, ArrowDown, DollarSign } from 'lucide-react';
import { BookIcon, AdoptIcon } from './VideoActionIcons';
import type { Video } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface SidebarIconsProps {
  video: Video;
  isBookmarked: boolean;
  onVote: (isTop: boolean) => void;
  onToggleBookmark: () => void;
  onNext: () => void;
  onTip: () => void;
  onBook: () => void;
  onAdopt: () => void;
}

export default function SidebarIcons({
  video,
  isBookmarked,
  onVote,
  onToggleBookmark,
  onNext,
  onTip,
  onBook,
  onAdopt,
}: SidebarIconsProps) {
  const actions = [
    {
      label: video.topCount.toString(),
      icon: ThumbsUp,
      onClick: () => onVote(true),
      color: 'text-green-400',
      shadow: 'shadow-green-500/50',
      border: 'border-green-500/50',
    },
    {
      label: video.flopCount.toString(),
      icon: ThumbsDown,
      onClick: () => onVote(false),
      color: 'text-red-400',
      shadow: 'shadow-red-500/50',
      border: 'border-red-500/50',
    },
    {
      label: 'Save',
      icon: Heart,
      onClick: onToggleBookmark,
      color: `transition-colors ${isBookmarked ? 'text-pink-400 fill-pink-400' : 'text-pink-400'}`,
      shadow: 'shadow-pink-500/50',
      border: 'border-pink-500/50',
    },
    {
      label: 'Next',
      icon: ArrowDown,
      onClick: onNext,
      color: 'text-purple-400',
      shadow: 'shadow-purple-500/50',
      border: 'border-purple-500/50',
    },
    {
      label: 'Tip',
      icon: DollarSign,
      onClick: onTip,
      color: 'text-accent',
      shadow: 'shadow-accent/50',
      border: 'border-accent/50',
    },
    {
      label: 'Book',
      icon: BookIcon,
      onClick: onBook,
      color: 'text-cyan-400',
      shadow: 'shadow-cyan-500/50',
      border: 'border-cyan-500/50',
    },
    {
      label: 'Adopt',
      icon: AdoptIcon,
      onClick: onAdopt,
      color: 'text-yellow-400',
      shadow: 'shadow-yellow-500/50',
      border: 'border-yellow-500/50',
    },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {actions.map(({ label, icon: Icon, onClick, color, shadow, border }) => (
        <Button
          key={label}
          onClick={onClick}
          variant="ghost"
          className={`group flex flex-col items-center justify-center w-10 h-10 sm:w-14 sm:h-14 p-0 rounded-full bg-black/40 backdrop-blur-sm border-2 transition-transform hover:scale-110 active:scale-95 ${border} ${shadow} hover:${shadow}-lg`}
        >
          <Icon className={`${color} w-4 h-4 sm:w-6 sm:h-6 shrink-0`} />
          <span className={`text-xs sm:text-sm font-bold leading-none mt-0.5 ${color} opacity-80`}>{label}</span>
        </Button>
      ))}
    </div>
  );
}
