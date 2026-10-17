"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Globe } from "lucide-react";
import { FaVolumeMute, FaVolumeUp, FaPlay, FaPause } from "react-icons/fa";

// Safe, universal YouTube Video ID extractor (supports watch, embed, shorts, youtu.be, and ytimg CDN)
export function getYouTubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  const regExp = /(?:(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|vi)\/|.*[?&]v=|shorts\/|live\/))|(?:youtu\.be\/)|(?:ytimg\.com\/vi\/))([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

export default function LinkPreviewCard({
  preview,
  postId = null,
  inFeed = false,
  isGlobalMuted = null,
  onToggleMute = null,
}) {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  // On Single Post Page (!inFeed), start inView = true immediately so autoplay starts on visit!
  const [isInView, setIsInView] = useState(!inFeed);
  const [hasObserverChecked, setHasObserverChecked] = useState(!inFeed);
  const [isMuted, setIsMuted] = useState(isGlobalMuted !== null ? isGlobalMuted : true);
  const [isPlayingState, setIsPlayingState] = useState(true);
  const [showPlayPauseRipple, setShowPlayPauseRipple] = useState(false);

  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  if (!preview) return null;
  const effectiveUrl = preview.url || preview.media || preview.link || "";

  const youtubeVideoId =
    preview.youtubeId ||
    getYouTubeVideoId(effectiveUrl) ||
    getYouTubeVideoId(preview.media) ||
    getYouTubeVideoId(preview.image) ||
    getYouTubeVideoId(preview.link) ||
    getYouTubeVideoId(preview.title) ||
    (preview.siteName?.toLowerCase() === "youtube" ? getYouTubeVideoId(preview.image || preview.description) : null);
  const isYouTubeVideo = Boolean(youtubeVideoId);

  if (!effectiveUrl && !isYouTubeVideo && !preview.image) return null;

  const domain = preview.domain || (() => {
    try {
      return new URL(effectiveUrl).hostname.replace(/^www\./, "");
    } catch {
      return isYouTubeVideo ? "youtube.com" : "external link";
    }
  })();

  // Sync mute state with global preference and listen for global sound changes
  useEffect(() => {
    if (isGlobalMuted !== null) {
      setIsMuted(isGlobalMuted);
    } else {
      try {
        const stored = localStorage.getItem("fondpeace_global_muted");
        if (stored !== null) setIsMuted(stored === "true");
      } catch (_) {}
    }

    const handleMuteChange = (e) => {
      if (typeof e.detail?.isMuted === "boolean") {
        setIsMuted(e.detail.isMuted);
      }
    };

    window.addEventListener("fondpeace_mute_changed", handleMuteChange);
    return () => window.removeEventListener("fondpeace_mute_changed", handleMuteChange);
  }, [isGlobalMuted]);

  // Send command to YouTube Iframe Player via PostMessage API
  const sendCommand = useCallback((func, args = []) => {
    try {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func, args }),
          "*"
        );
      }
    } catch (_) {}
  }, []);

  // Listen for YouTube Iframe API state changes to eliminate 2-3s black screen
  useEffect(() => {
    if (!isYouTubeVideo) return;

    const handleMessage = (event) => {
      try {
        let data = event.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (_) {
            return;
          }
        }
        if (!data) return;

        // YT.PlayerState.PLAYING is 1. When video begins actual frame playback:
        if (
          (data.event === "onStateChange" && data.info === 1) ||
          (data.event === "infoDelivery" && (data.info?.playerState === 1 || data.info?.currentTime > 0.05))
        ) {
          setIsPlaybackActive(true);
          setIsLoaded(true);
        }
      } catch (_) {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isYouTubeVideo]);

  // Safety fallback: ensure poster fades out smoothly even if player events are blocked
  useEffect(() => {
    if (!isYouTubeVideo) return;
    const timer = setTimeout(() => {
      setIsPlaybackActive(true);
      setIsLoaded(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [isYouTubeVideo]);

  // IntersectionObserver: For inFeed posts, autoplay when visible and pause when scrolled away
  useEffect(() => {
    if (!isYouTubeVideo || !inFeed || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setHasObserverChecked(true);
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            setIsInView(true);
          } else if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
            setIsInView(false);
          }
        });
      },
      { threshold: [0, 0.25, 0.5] }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isYouTubeVideo, inFeed]);

  // Sync Play / Pause when scrolled in or out of view
  useEffect(() => {
    if (!isLoaded || !isYouTubeVideo) return;
    if (!hasObserverChecked && inFeed) return;

    if ((!inFeed || isInView) && isPlayingState) {
      sendCommand("playVideo");
    } else {
      sendCommand("pauseVideo");
    }
  }, [isInView, isLoaded, isPlayingState, isYouTubeVideo, hasObserverChecked, inFeed, sendCommand]);

  // Sync Audio Mute / Unmute
  useEffect(() => {
    if (!isLoaded || !isYouTubeVideo) return;
    sendCommand(isMuted ? "mute" : "unMute");
  }, [isMuted, isLoaded, isYouTubeVideo, sendCommand]);

  // Handle Mute / Unmute toggle matching native videos
  const handleToggleMute = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onToggleMute) {
      onToggleMute(e);
    } else {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      try {
        localStorage.setItem("fondpeace_global_muted", String(nextMuted));
      } catch (_) {}
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("fondpeace_mute_changed", { detail: { isMuted: nextMuted } })
        );
      }
    }
  };

  // Handle clicking on media: on feed navigates to post, on single post toggles play/pause
  const handleMediaClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (inFeed && postId) {
      router.push(`/post/${postId}`);
    } else {
      const nextPlay = !isPlayingState;
      setIsPlayingState(nextPlay);
      sendCommand(nextPlay ? "playVideo" : "pauseVideo");
      setShowPlayPauseRipple(true);
      setTimeout(() => setShowPlayPauseRipple(false), 700);
    }
  };

  // ==========================================
  // CASE 1: YOUTUBE VIDEO LINK (AUTOPLAY LIKE NATIVE VIDEOS)
  // ==========================================
  if (isYouTubeVideo) {
    const resolvedThumbnail =
      preview.image ||
      `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;

    const currentOrigin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://www.fondpeace.com";

    // Embed URL optimized for silent seamless background autoplay, loop, and zero clutter
    const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeVideoId}&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(
      currentOrigin
    )}&iv_load_policy=3&fs=0&disablekb=1`;

    return (
      <div className="my-2.5 block rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:border-blue-500/40 transition-all duration-200 shadow-md hover:shadow-xl relative">
        <div
          ref={containerRef}
          className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden"
        >
          {/* Sandboxed YouTube Player Frame (No controls, looping, autoplaying) */}
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={preview.title || "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="w-full h-full border-0 absolute inset-0 pointer-events-none"
            onLoad={() => {
              setIsLoaded(true);
              try {
                iframeRef.current?.contentWindow?.postMessage(
                  JSON.stringify({ event: "listening" }),
                  "*"
                );
              } catch (_) {}
              if (!inFeed || isInView) {
                sendCommand("playVideo");
                sendCommand(isMuted ? "mute" : "unMute");
                setTimeout(() => {
                  sendCommand("playVideo");
                  sendCommand(isMuted ? "mute" : "unMute");
                }, 250);
                setTimeout(() => {
                  sendCommand("playVideo");
                }, 600);
              }
            }}
          />

          {/* Smooth Poster Transition: Eliminates 2-3s black screen entirely */}
          <div
            className={`absolute inset-0 z-10 bg-black flex items-center justify-center transition-opacity duration-500 ease-out pointer-events-none ${
              isPlaybackActive ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {resolvedThumbnail && (
              <img
                src={resolvedThumbnail}
                alt={preview.title || "Video thumbnail"}
                className="w-full h-full object-cover"
                loading="eager"
              />
            )}
            {!isPlaybackActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                <div className="w-9 h-9 rounded-full border-2 border-white/20 border-t-white animate-spin shadow-xl" />
              </div>
            )}
          </div>

          {/* Transparent Click Shield: User interaction stays on FondPeace */}
          <div
            className="absolute inset-0 z-20 cursor-pointer"
            onClick={handleMediaClick}
          />

          {/* Single Post Play/Pause Ripple Indicator */}
          {!inFeed && showPlayPauseRipple && (
            <div className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/75 backdrop-blur-md text-white flex items-center justify-center shadow-2xl transition-all scale-110">
                {isPlayingState ? <FaPlay size={22} className="ml-1" /> : <FaPause size={22} />}
              </div>
            </div>
          )}

          {/* Single Post Paused Indicator */}
          {!inFeed && !isPlayingState && (
            <div className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-xl border border-white/20">
                <FaPlay size={18} className="ml-1" />
              </div>
            </div>
          )}

          {/* Sleek Native-Matching Mute / Unmute Button */}
          <button
            type="button"
            onClick={handleToggleMute}
            className="absolute bottom-3 right-3 z-30 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full backdrop-blur-md transition-all active:scale-90 border border-white/10 shadow-lg cursor-pointer"
            title={isMuted ? "Sound is muted" : "Sound is on"}
          >
            {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
          </button>
        </div>

        {/* Post Details (Navigates to /post/[id] on FondPeace) */}
        <Link
          href={postId ? `/post/${postId}` : "#"}
          className="block p-3.5 sm:p-4 no-underline text-inherit cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors"
        >
          {preview.title && (
            <h4 className="font-bold text-sm sm:text-base text-[var(--text-primary)] line-clamp-2 leading-snug hover:text-blue-500 transition-colors mb-1">
              {preview.title}
            </h4>
          )}

          {preview.description && (
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {preview.description}
            </p>
          )}
        </Link>
      </div>
    );
  }

  // ==========================================
  // CASE 2: REGULAR EXTERNAL LINK (Articles, Blogs, News, Websites)
  // ==========================================
  return (
    <div className="my-2.5 block rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:border-blue-500/40 transition-all duration-200 shadow-md hover:shadow-xl relative">
      {preview.image && (
        <a
          href={preview.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="relative w-full aspect-video overflow-hidden bg-black flex items-center justify-center group block cursor-pointer"
        >
          <img
            src={preview.image}
            alt={preview.title || domain}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.parentElement.style.display = "none";
            }}
          />

          {/* Top Source Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md border border-white/10 pointer-events-none">
            <Globe className="w-3 h-3 text-blue-400" />
            <span className="text-white truncate max-w-[150px]">{preview.siteName || domain}</span>
          </div>

          {/* External Link Visit Badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 shadow-md border border-white/10 pointer-events-none">
            <ExternalLink className="w-3 h-3 text-white" />
            <span className="text-white">Visit</span>
          </div>
        </a>
      )}

      {/* Post details area below media */}
      <Link
        href={postId ? `/post/${postId}` : preview.url}
        className="block p-3.5 sm:p-4 no-underline text-inherit cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors"
      >
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium mb-1.5 truncate">
          <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">{preview.siteName || domain}</span>
        </div>

        {preview.title && (
          <h4 className="font-bold text-sm sm:text-base text-[var(--text-primary)] line-clamp-2 leading-snug hover:text-blue-500 transition-colors mb-1">
            {preview.title}
          </h4>
        )}

        {preview.description && (
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
            {preview.description}
          </p>
        )}
      </Link>
    </div>
  );
}
