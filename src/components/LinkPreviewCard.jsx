"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, Globe, ArrowRight, Play, MessageCircle, X } from "lucide-react";

// Safe, universal YouTube Video ID extractor
export function getYouTubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

export default function LinkPreviewCard({ preview, postId = null, inFeed = false }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!preview || !preview.url) return null;

  const domain = preview.domain || (() => {
    try {
      return new URL(preview.url).hostname.replace(/^www\./, "");
    } catch {
      return "external link";
    }
  })();

  const youtubeVideoId = getYouTubeVideoId(preview.url);
  const isYouTube = Boolean(
    youtubeVideoId ||
    domain.includes("youtube.com") || 
    domain.includes("youtu.be") || 
    preview.siteName?.toLowerCase() === "youtube"
  );

  // CASE 1: In Feed / Community Homepage
  if (inFeed && postId) {
    return (
      <div className="my-2.5 block rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:border-blue-500/40 transition-all duration-200 shadow-md hover:shadow-xl relative">
        {/* If user clicked Play on a YouTube link, play inline right on FondPeace */}
        {isPlaying && youtubeVideoId ? (
          <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
              title={preview.title || "YouTube video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
            {/* Control Bar Overlay: Open on external YouTube or Close player */}
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(preview.url, "_blank", "noopener,noreferrer");
                }}
                className="px-2.5 py-1 rounded-full bg-black/85 hover:bg-black text-white text-[11px] font-semibold backdrop-blur-md flex items-center gap-1 border border-white/20 shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
                title="Watch on YouTube directly"
              >
                <ExternalLink className="w-3 h-3 text-red-500" />
                <span>Visit YouTube</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPlaying(false);
                }}
                className="px-2.5 py-1 rounded-full bg-black/85 hover:bg-black text-white text-[11px] font-semibold backdrop-blur-md flex items-center gap-1 border border-white/20 shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
                title="Close Inline Player"
              >
                <X className="w-3.5 h-3.5 text-white" />
                <span>Close</span>
              </button>
            </div>
          </div>
        ) : (
          preview.image && (
            <div 
              className="relative w-full aspect-video overflow-hidden bg-black flex items-center justify-center cursor-pointer group"
              onClick={(e) => {
                if (isYouTube && youtubeVideoId) {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPlaying(true);
                }
              }}
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

              {/* YouTube Play Icon - Clicking plays directly on FondPeace */}
              {isYouTube && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (youtubeVideoId) setIsPlaying(true);
                      else window.open(preview.url, "_blank", "noopener,noreferrer");
                    }}
                    className="w-16 h-16 rounded-full bg-red-600/95 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-white/30"
                    title="Play on FondPeace"
                  >
                    <Play className="w-7 h-7 fill-white text-white ml-1" />
                  </button>
                </div>
              )}

              {/* Top Source Badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md border border-white/10 pointer-events-none">
                <Globe className={`w-3 h-3 ${isYouTube ? "text-red-500" : "text-blue-400"}`} />
                <span className="text-white truncate max-w-[150px]">{preview.siteName || (isYouTube ? "YouTube" : domain)}</span>
              </div>

              {/* Direct External Link: Always takes user to the external platform (YouTube, etc.) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(preview.url, "_blank", "noopener,noreferrer");
                }}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 shadow-md border border-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
                title={`Visit ${domain} directly`}
              >
                <ExternalLink className="w-3 h-3 text-white" />
                <span className="text-white">Visit</span>
              </button>

              {/* Bottom pill: View Post & Discussion on FondPeace */}
              <Link
                href={`/post/${postId}`}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-blue-600/90 hover:bg-blue-500 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3 h-3 text-white" />
                <span>Discussion & Details</span>
              </Link>
            </div>
          )
        )}

        {/* Post details area below media - navigates to post page */}
        <Link
          href={`/post/${postId}`}
          className="block p-3.5 sm:p-4 no-underline text-inherit cursor-pointer hover:bg-[var(--bg-surface-hover)] transition-colors"
        >
          <div className="flex items-center justify-between gap-1.5 text-xs text-[var(--text-secondary)] font-medium mb-1.5">
            <div className="flex items-center gap-1.5 truncate">
              <Globe className={`w-3.5 h-3.5 ${isYouTube ? "text-red-500" : "text-blue-500"} shrink-0`} />
              <span className="truncate">{preview.siteName || (isYouTube ? "YouTube" : domain)}</span>
            </div>
            <span className="text-[11px] text-blue-500 font-bold shrink-0 flex items-center gap-0.5 hover:translate-x-0.5 transition-transform">
              Read Post <ArrowRight className="w-3 h-3" />
            </span>
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

  // CASE 2: Inside Single Post Page (/post/[id])
  return (
    <div className="my-3 block rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-subtle)] shadow-md">
      {isPlaying && youtubeVideoId ? (
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            title={preview.title || "YouTube video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(preview.url, "_blank", "noopener,noreferrer");
              }}
              className="px-2.5 py-1 rounded-full bg-black/85 hover:bg-black text-white text-[11px] font-semibold backdrop-blur-md flex items-center gap-1 border border-white/20 shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <ExternalLink className="w-3 h-3 text-red-500" />
              <span>Watch on YouTube</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="px-2.5 py-1 rounded-full bg-black/85 hover:bg-black text-white text-[11px] font-semibold backdrop-blur-md flex items-center gap-1 border border-white/20 shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <X className="w-3.5 h-3.5 text-white" />
              <span>Close</span>
            </button>
          </div>
        </div>
      ) : (
        preview.image && (
          <div className="relative w-full aspect-video overflow-hidden bg-black flex items-center justify-center group">
            <img
              src={preview.image}
              alt={preview.title || domain}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.parentElement.style.display = "none";
              }}
            />
            {isYouTube && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="w-16 h-16 rounded-full bg-red-600/95 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-white/30"
                  title="Play on FondPeace"
                >
                  <Play className="w-7 h-7 fill-white text-white ml-1" />
                </button>
              </div>
            )}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md border border-white/10 pointer-events-none">
              <Globe className={`w-3 h-3 ${isYouTube ? "text-red-500" : "text-blue-400"}`} />
              <span className="text-white truncate max-w-[150px]">{preview.siteName || (isYouTube ? "YouTube" : domain)}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(preview.url, "_blank", "noopener,noreferrer");
              }}
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 shadow-md border border-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
              title={`Visit ${domain} directly`}
            >
              <ExternalLink className="w-3 h-3 text-white" />
              <span className="text-white">Visit</span>
            </button>
          </div>
        )
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium mb-1.5">
          <Globe className={`w-3.5 h-3.5 ${isYouTube ? "text-red-500" : "text-blue-500"}`} />
          <span className="truncate">{preview.siteName || (isYouTube ? "YouTube" : domain)}</span>
        </div>

        {preview.title && (
          <h4 className="font-bold text-base sm:text-lg text-[var(--text-primary)] leading-snug mb-1.5">
            {preview.title}
          </h4>
        )}

        {preview.description && (
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed mb-4">
            {preview.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {isYouTube && youtubeVideoId && !isPlaying && (
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Play on FondPeace</span>
            </button>
          )}
          <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 no-underline cursor-pointer"
          >
            {isYouTube ? (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>Watch on YouTube</span>
              </>
            ) : (
              <>
                <span>Visit {preview.siteName || domain}</span>
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </a>
        </div>
      </div>
    </div>
  );
}
