"use client";

import React from "react";
import { ExternalLink, Globe } from "lucide-react";

export default function LinkPreviewCard({ preview }) {
  if (!preview || !preview.url) return null;

  const domain = preview.domain || (() => {
    try {
      return new URL(preview.url).hostname.replace(/^www\./, "");
    } catch {
      return "external link";
    }
  })();

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="my-2.5 block rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-hover)] hover:border-blue-500/40 transition-all duration-200 group no-underline text-inherit shadow-md hover:shadow-xl"
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
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 shadow-md border border-white/10">
            <ExternalLink className="w-3 h-3 text-white" />
            <span className="text-white">Visit</span>
          </div>
        </div>
      )}

      <div className="p-3.5 sm:p-4">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium mb-1.5">
          <Globe className="w-3.5 h-3.5 text-blue-500" />
          <span className="truncate">{preview.siteName || domain}</span>
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
    </a>
  );
}
