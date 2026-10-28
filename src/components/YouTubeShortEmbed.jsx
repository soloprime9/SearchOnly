"use client";

import React, { useEffect, useRef } from "react";
import { FaYoutube } from "react-icons/fa";

// Safe, universal YouTube Video ID extractor
export function getYouTubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * 🎬 YouTubeShortEmbed - High-Performance, Zero-Delay YouTube Shorts Player
 * Directly renders YouTube Short iframe with zero thumbnail lag or blocking overlays.
 */
export default function YouTubeShortEmbed({
  youtubeId,
  isActive = false,
  shouldPreload = false,
  isNearby = true,
  isMuted = false,
  title = "YouTube Short",
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
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <FaYoutube className="text-zinc-600 text-4xl" />
      </div>
    );
  }

  const currentOrigin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://www.fondpeace.com";

  // Highly optimized YouTube embed with autoplay enabled & zero thumbnail delays
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${
    isActive ? 1 : 0
  }&mute=${
    isMuted ? 1 : 0
  }&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(
    currentOrigin
  )}&iv_load_policy=3&fs=0&disablekb=1`;

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none">
      {/* Direct YouTube IFrame: Mounts when active or nearby with zero blocking overlays */}
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
          className="relative z-10 w-full h-full border-0 pointer-events-auto"
          style={{
            width: "100%",
            height: "100%",
            aspectRatio: "9/16",
          }}
        />
      ) : (
        <div className="relative z-10 w-full h-full bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-rose-500 animate-spin" />
        </div>
      )}

      {/* Sleek Source Badge (Non-intrusive) */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold shadow-lg">
        <FaYoutube className="text-red-500 text-xs" />
        <span>YouTube Short</span>
      </div>
    </div>
  );
}
