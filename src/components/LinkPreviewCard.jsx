"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Globe, ArrowRight, Play, MessageCircle } from "lucide-react";

export default function LinkPreviewCard({ preview, postId = null, inFeed = false }) {
  if (!preview || !preview.url) return null;

  const domain = preview.domain || (() => {
    try {
      return new URL(preview.url).hostname.replace(/^www\./, "");
    } catch {
      return "external link";
    }
  })();

  const isYouTube = 
    domain.includes("youtube.com") || 
    domain.includes("youtu.be") || 
    preview.siteName?.toLowerCase() === "youtube";

  // CASE 1: In Feed / Homepage
  // When viewed inside the feed, clicking the card navigates internally to the FondPeace post page (/post/[id])
  // This keeps users on FondPeace to read comments, react, and view discussion, instead of immediately bouncing away!
  if (inFeed && postId) {
    return (
      <div className="my-2.5 block rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-hover)] hover:border-blue-500/40 transition-all duration-200 group no-underline text-inherit shadow-md hover:shadow-xl relative">
        <Link
          href={`/post/${postId}`}
          className="block no-underline text-inherit cursor-pointer"
        >
          {preview.image && (
            <div className="relative w-full aspect-video overflow-hidden bg-black flex items-center justify-center">
              <img
                src={preview.image}
                alt={preview.title || domain}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.parentElement.style.display = "none";
                }}
              />
              {/* YouTube Play Icon */}
              {isYouTube && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                  </div>
                </div>
              )}

              {/* Top Source Badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md border border-white/10">
                <Globe className="w-3 h-3 text-blue-400" />
                <span className="text-white truncate max-w-[150px]">{preview.siteName || domain}</span>
              </div>

              {/* Direct External Link in corner (optional explicit jump for user) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(preview.url, "_blank", "noopener,noreferrer");
                }}
                className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 shadow-md border border-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
                title={`Visit ${domain} directly`}
              >
                <ExternalLink className="w-3 h-3 text-white" />
                <span className="text-white">Visit</span>
              </button>

              {/* Bottom pill: View Post & Discussion on FondPeace */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg group-hover:bg-blue-500 transition-colors">
                <MessageCircle className="w-3 h-3 text-white" />
                <span>Discussion & Details</span>
              </div>
            </div>
          )}

          <div className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-1.5 text-xs text-[var(--text-secondary)] font-medium mb-1.5">
              <div className="flex items-center gap-1.5 truncate">
                <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{preview.siteName || domain}</span>
              </div>
              <span className="text-[11px] text-blue-500 font-bold shrink-0 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Read Post <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            {preview.title && (
              <h4 className="font-bold text-sm sm:text-base text-[var(--text-primary)] line-clamp-2 leading-snug group-hover:text-blue-500 transition-colors mb-1">
                {preview.title}
              </h4>
            )}

            {preview.description && (
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                {preview.description}
              </p>
            )}
          </div>
        </Link>
      </div>
    );
  }

  // CASE 2: Inside Single Post Page (/post/[id])
  // The user is ALREADY inside the post on FondPeace!
  // Here we display the rich media preview + a dedicated "Visit Link" / "Watch on YouTube" action button.
  return (
    <div className="my-3 block rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-subtle)] shadow-md">
      {preview.image && (
        <div className="relative w-full aspect-video overflow-hidden bg-black flex items-center justify-center">
          <img
            src={preview.image}
            alt={preview.title || domain}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.parentElement.style.display = "none";
            }}
          />
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md border border-white/10">
            <Globe className="w-3 h-3 text-blue-400" />
            <span className="text-white truncate max-w-[150px]">{preview.siteName || domain}</span>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium mb-1.5">
          <Globe className="w-3.5 h-3.5 text-blue-500" />
          <span className="truncate">{preview.siteName || domain}</span>
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

        {/* Action Button: Opens the external link in a new tab */}
        <a
          href={preview.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 no-underline cursor-pointer"
        >
          {isYouTube ? (
            <>
              <Play className="w-4 h-4 fill-white text-white" />
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
  );
}
