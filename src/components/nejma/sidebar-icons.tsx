"use client";

import { ThumbsUp, ThumbsDown, Heart, ArrowDown, DollarSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { BookIcon, AdoptIcon } from './custom-icons';
import { cn } from '@/lib/utils';

type SidebarIconsProps = {
  handleVote: (isTop: boolean) => void;
  handleBook: () => void;
  handleAdopt: () => void;
  toggleBookmark: () => void;
  nextVideo: () => void;
  handleTip: () => void;
  video: any;
  bookmarked: boolean;
};

export function SidebarIcons({
  handleVote,
  handleBook,
  handleAdopt,
  toggleBookmark,
  nextVideo,
  handleTip,
  video,
  bookmarked,
}: SidebarIconsProps) {
  const isMobile = useIsMobile();
  const iconSize = isMobile ? 20 : 24;
  const buttonSize = isMobile ? 44 : 56;
  const fontSize = isMobile ? '9px' : '10px';

  const buttonStyle: React.CSSProperties = {
    width: `${buttonSize}px`,
    height: `${buttonSize}px`,
  };

  const icons = [
    { action: () => handleVote(true), icon: <ThumbsUp size={iconSize} className="text-green-400"/>, label: video?.topCount || 0, color: "purple" },
    { action: () => handleVote(false), icon: <ThumbsDown size={iconSize} className="text-red-400"/>, label: video?.flopCount || 0, color: "pink" },
    { action: toggleBookmark, icon: <Heart size={iconSize} className={cn("transition-colors", bookmarked ? "fill-pink-400 text-pink-400" : "text-pink-400")}/>, label: 'Save', color: "pink" },
    { action: nextVideo, icon: <ArrowDown size={iconSize} className="text-purple-400"/>, label: 'Next', color: "purple" },
    { action: handleTip, icon: <DollarSign size={iconSize} className="text-green-400"/>, label: 'Tip', color: "green" },
    { action: handleBook, icon: <BookIcon size={iconSize} className="text-cyan-400"/>, label: 'Book', color: "cyan" },
    { action: handleAdopt, icon: <AdoptIcon size={iconSize} className="text-yellow-400"/>, label: 'Adopt', color: "yellow" },
  ];

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {icons.map((item, index) => (
        <button
          key={index}
          onClick={item.action}
          style={buttonStyle}
          className={cn(
            "rounded-full hover:scale-110 transition-all duration-200 flex flex-col items-center justify-center group p-0 bg-black/40 backdrop-blur-sm border-2",
            {
                "border-primary/50 text-primary-foreground shadow-[0_0_15px_rgba(108,71,255,0.5)]": item.color === "purple",
                "border-pink-500/50 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.5)]": item.color === "pink",
                "border-green-500/50 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.5)]": item.color === "green",
                "border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]": item.color === "cyan",
                "border-yellow-500/50 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.5)]": item.color === "yellow",
            }
          )}
        >
          {item.icon}
          <span className="leading-none font-bold mt-0.5" style={{ fontSize }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

    