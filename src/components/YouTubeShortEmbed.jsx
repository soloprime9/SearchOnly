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
 * 🎬 YouTubeShortEmbed - Pure Video Player (Zero Ghost Audio, Zero YouTube Controls, Zero Overlays)
 * Guarantees 0 background audio leakage: strictly unmounts iframe and stops audio instantly when not active or on unmount!
 */
export default function YouTubeShortEmbed({
  youtubeId,
  isActive = false,
  shouldPreload = false,
  isNearby = true,
  isMuted = false,
  title = "Short Video",
  thumbnail = "",
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

  // Sync Play / Pause immediately when active state changes, and hard-kill sound on deactivate/unmount
  useEffect(() => {
    if (!youtubeId) return;

    if (isActive) {
      sendCommand("playVideo");
      if (isMuted) sendCommand("mute");
      else sendCommand("unMute");
    } else {
      sendCommand("pauseVideo");
      sendCommand("stopVideo");
      sendCommand("mute");
    }

    return () => {
      // ⚡ HARD STOP ON UNMOUNT (Navigating away to /upload or any route)
      try {
        sendCommand("stopVideo");
        sendCommand("pauseVideo");
        sendCommand("mute");
        if (iframeRef.current) {
          iframeRef.current.src = "about:blank";
        }
      } catch (_) {}
    };
  }, [isActive, isMuted, youtubeId]);

  if (!youtubeId) {
    return <div className="relative w-full h-full bg-black" />;
  }

  const resolvedThumb =
    thumbnail ||
    `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

  const currentOrigin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://www.fondpeace.com";

  // Clean embed URL: NO playlist, controls=0, modestbranding=1
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
        ⚡ ZERO-GHOST-AUDIO ARCHITECTURE:
        ONLY mount YouTube iframe when `isActive` is strictly TRUE.
        When `isActive` is false (scrolled away or upcoming), render high-res poster thumbnail.
        This physically terminates the YouTube audio process in the browser with 0% chance of ghost sound!
      */}
      {isActive ? (
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
          className="absolute inset-0 w-full h-full border-0 pointer-events-none select-none object-contain"
        />
      ) : (
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
          {resolvedThumb && (
            <img
              src={resolvedThumb}
              alt={title}
              loading="lazy"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
