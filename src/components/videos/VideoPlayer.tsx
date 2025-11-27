'use client';

import { useRef, useEffect, useState } from 'react';
import { parseYouTubeUrl } from '@/lib/nejma/youtube';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  url: string | null;
  isActive: boolean;
}

export default function VideoPlayer({ url, isActive }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const embedUrl = parseYouTubeUrl(url);
  
  useEffect(() => {
    const player = iframeRef.current;
    if (!player || !isActive) return;

    const playVideo = () => player.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo' }), '*');
    const pauseVideo = () => player.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo' }), '*');
    
    if (isActive) {
        playVideo();
    } else {
        pauseVideo();
    }

  }, [isActive, isReady]);

  useEffect(() => {
    function handleYouTubeMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (typeof event.data !== "string") return;

      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        return;
      }
      
      if (data.event === "onReady") {
        setIsReady(true);
        // Autoplay is handled by the useEffect above
      }
    }
    window.addEventListener("message", handleYouTubeMessage);
    return () => window.removeEventListener("message", handleYouTubeMessage);
  }, []);

  const handleTapToUnmute = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "unMute" }), "*");
      setIsMuted(false);
    }
  };

  if (!embedUrl) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900">
        <p className="text-white text-center px-4">Invalid or unsupported video link</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="absolute top-1/2 left-1/2 w-full h-full min-w-[177.77vh] min-h-[100vw] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        frameBorder="0"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        title="Spotly Video Player"
      />
      {isMuted && isActive && (
        <div className="absolute bottom-24 right-4 z-50 pointer-events-auto">
             <Button onClick={handleTapToUnmute} variant="secondary" className="bg-black/70 text-white text-xs rounded-full">
                🔇 Tap to Unmute
             </Button>
        </div>
      )}
    </div>
  );
}
