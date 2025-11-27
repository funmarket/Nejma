import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeUrl(url: string | null): string | null {
    if (!url || url.trim() === '') return null;

    let decodedUrl: string;
    try {
        decodedUrl = decodeURIComponent(url);
    } catch {
        return null; // Malformed URI
    }

    // Basic XSS checks
    if (/^(javascript|vbscript|data):/i.test(decodedUrl)) return null;
    if (/<script/i.test(decodedUrl)) return null;

    try {
        const parsed = new URL(url);
        // Ensure it's a web protocol
        if (!['http:', 'https:'].includes(parsed.protocol)) return null;
        // Double-check href after parsing
        if (/^(javascript|vbscript|data):/i.test(parsed.href)) return null;
        return parsed.href;
    } catch {
        return null; // Invalid URL
    }
}
