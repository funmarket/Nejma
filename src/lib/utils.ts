import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseYouTubeUrl(input: string | null): string | null {
  if (!input) return null;
  // This regex is from the original code. It handles various YouTube URL formats.
  const match = input.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  if (!match) return null;
  const id = match[1];
  // Parameters for optimal embedded playback experience
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&enablejsapi=1&playsinline=1&controls=0&modestbranding=1&rel=0`;
}
