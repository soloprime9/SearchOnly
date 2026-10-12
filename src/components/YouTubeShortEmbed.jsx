"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaYoutube } from "react-icons/fa";

/**
 * 🎬 YouTubeShortEmbed - Isolated, Zero-Risk YouTube Shorts Player
 * Plays YouTube Shorts natively inside the 9:16 vertical player frame.
 * Controlled seamlessly via YouTube IFrame Player PostMessage API.
 */
export default function YouTubeShortEmbed({
  youtubeId,
  isActive = false,
  isMuted = false,
  thumbnail = null,
  title = "YouTube Short",
}) {
  const iframeRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

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

  // Sync Play / Pause when user scrolls into / out of this short
  useEffect(() => {
    if (!isLoaded) return;
    if (isActive) {
      sendCommand("playVideo");
    } else {
      sendCommand("pauseVideo");
    }
  }, [isActive, isLoaded]);

  // Sync Mute / Unmute state
  useEffect(() => {
    if (!isLoaded) return;
    if (isMuted) {
      sendCommand("mute");
    } else {
      sendCommand("unMute");
    }
  }, [isMuted, isLoaded]);

  if (!youtubeId || hasError) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {thumbnail && (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-contain"
          />
        )}
      </div>
    );
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${
    isActive ? 1 : 0
  }&mute=${
    isMuted ? 1 : 0
  }&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&iv_load_policy=3&fs=0&disablekb=1`;

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none">
      {/* High-Resolution Poster while iframe initializes */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <img
            src={thumbnail || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
            alt={title}
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div className="absolute w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl animate-pulse">
            <FaYoutube size={26} />
          </div>
        </div>
      )}

      {/* Sandboxed YouTube Player Frame (Fills 9:16 cleanly) */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => {
          setIsLoaded(true);
          if (isActive) {
            sendCommand("playVideo");
            if (isMuted) sendCommand("mute");
            else sendCommand("unMute");
          }
        }}
        onError={() => setHasError(true)}
        className={`relative z-0 w-full h-full border-0 pointer-events-auto transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          width: "100%",
          height: "100%",
          aspectRatio: "9/16",
        }}
      />

      {/* Sleek Source Badge (Non-intrusive) */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold shadow-lg">
        <FaYoutube className="text-red-500 text-xs" />
        <span>YouTube Short</span>
      </div>
    </div>
  );
}
