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

export function sanitizeUrl(url: string): string | null {
    if (!url || url.trim() === '') return null;
    let decodedUrl;
    try {
        decodedUrl = decodeURIComponent(url);
    } catch (e) {
        // malformed URI
        return null;
    }

    // List of allowed protocols
    const allowedProtocols = ['http:', 'https:'];

    try {
        const parsedUrl = new URL(decodedUrl);
        if (!allowedProtocols.includes(parsedUrl.protocol)) {
            return null;
        }
        // Basic check for javascript in path, etc.
        if (/(javascript|data|vbscript):/i.test(parsedUrl.href)) {
            return null;
        }
    } catch (e) {
        // Invalid URL
        return null;
    }
    
    // Check for script tags and other dangerous html
    const dangerousTags = /<script|<iframe|<object|<embed|<style/i;
    if(dangerousTags.test(decodedUrl)) {
        return null;
    }

    return url;
}