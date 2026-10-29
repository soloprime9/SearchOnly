"use client";

import React, { useEffect, useRef } from "react";

// Safe, universal YouTube Video ID extractor
export function getYouTubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * 🎬 YouTubeShortEmbed - Pure Video Player (Zero YouTube Controls, Zero Overlays)
 * Removes YouTube's native back/next/pause controls and crops out title/creator bar.
 */
export default function YouTubeShortEmbed({
  youtubeId,
  isActive = false,
  shouldPreload = false,
  isNearby = true,
  isMuted = false,
  title = "Short Video",
}) {
  const iframeRef = useRef(null);

  // Send command to YouTube player via postMessage
  const sendCommand = (func, args = []) => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func, args }),
          "*"
        );
      }
    } catch (_) {}
  };

  // Sync Play / Pause immediately when active state changes
  useEffect(() => {
    if (!youtubeId) return;
    if (isActive) {
      sendCommand("playVideo");
      if (isMuted) sendCommand("mute");
      else sendCommand("unMute");
    } else {
      sendCommand("pauseVideo");
    }
  }, [isActive, isMuted, youtubeId]);

  if (!youtubeId) {
    return <div className="relative w-full h-full bg-black" />;
  }

  const currentOrigin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://www.fondpeace.com";

  // Clean embed URL: NO playlist (removes Next/Back buttons), controls=0 (removes player bar), modestbranding=1
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${
    isActive ? 1 : 0
  }&mute=${
    isMuted ? 1 : 0
  }&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(
    currentOrigin
  )}&iv_load_policy=3&fs=0&disablekb=1&showinfo=0`;

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none">
      {/* 
        Direct YouTube IFrame with:
        1. pointer-events-none: Prevents YouTube from showing its internal pause button or capturing clicks
        2. -top-[52px] h-[calc(100%+104px)] scale-[1.08]: Crops out YouTube's top header bar (creator avatar & title) and bottom watermark
      */}
      {(isActive || shouldPreload || isNearby) ? (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => {
            if (isActive) {
              sendCommand("playVideo");
              if (isMuted) sendCommand("mute");
              else sendCommand("unMute");
            }
          }}
          className="absolute inset-0 w-full h-[calc(100%+104px)] -top-[52px] border-0 pointer-events-none select-none scale-[1.08] sm:scale-105"
        />
      ) : (
        <div className="relative z-10 w-full h-full bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-rose-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
