export function parseYouTubeUrl(input: string | null): string | null {
  if (!input) return null;

  // Regex to capture video ID from various YouTube URL formats
  const match = input.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  if (!match) return null;

  const id = match[1];
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&enablejsapi=1&playsinline=1&controls=0&modestbranding=1&rel=0`;
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

    