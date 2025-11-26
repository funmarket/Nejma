"use client";

import { useRef, useEffect, useState } from 'react';
import { parseYouTubeUrl } from '@/lib/nejma/youtube';
import { useIsMobile } from '@/hooks/use-mobile';
import { VolumeX } from 'lucide-react';

declare global {
  interface Window {
    __audioUnlocked?: boolean;
  }
}

type VideoPlayerProps = {
  url: string | null;
  isActive: boolean;
};

export function VideoPlayer({ url, isActive }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const isMobile = useIsMobile();
  
  const embedUrl = parseYouTubeUrl(url);

  useEffect(() => {
    const postMessage = (func: string, args: any[] = []) => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func, args }), "*");
        }
    }
    
    if (isActive) {
        postMessage("playVideo");
    } else {
        postMessage("pauseVideo");
    }
  }, [isActive]);

  useEffect(() => {
    function handleYouTubeMessage(event: MessageEvent) {
      if (typeof event.data !== "string") return;
      let data;
      try { data = JSON.parse(event.data); } catch (e) { return; }

      if (data.event === "onReady" && iframeRef.current) {
        if (window.__audioUnlocked) {
            setTimeout(() => {
                try {
                    iframeRef.current!.contentWindow!.postMessage(JSON.stringify({ event: "command", func: "unMute", args: [] }), "*");
                    setIsMuted(false);
                } catch (err) { console.log("Auto unmute failed:", err); }
            }, 300);
        }
      }
    }
    window.addEventListener("message", handleYouTubeMessage);
    return () => window.removeEventListener("message", handleYouTubeMessage);
  }, []);

  const handleTapToUnmute = () => {
    if (iframeRef.current?.contentWindow) {
        try {
            iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: "command", func: "unMute", args: [] }), "*");
            window.__audioUnlocked = true;
            setIsMuted(false);
        } catch (e) {
            console.log("Tap to unmute failed", e);
        }
    }
  };
  
  if (!embedUrl) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
        <p className="text-red-400 text-center px-4">Invalid or unsupported video link.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="absolute w-full h-full pointer-events-auto"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '177.77vh', minWidth: '100%', height: '100vh', minHeight: '56.25vw' }}
        frameBorder="0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        title="YouTube video player"
      />
      {isMuted && isActive && (
        <button onClick={handleTapToUnmute} className="fixed bottom-24 right-4 z-50 px-4 py-2 bg-black/70 text-white text-xs rounded-full pointer-events-auto flex items-center gap-2">
            <VolumeX size={14}/>
            Tap to Unmute
        </button>
      )}
    </div>
  );
}
