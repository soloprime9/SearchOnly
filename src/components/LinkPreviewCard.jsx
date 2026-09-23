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
      className="my-3 block rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all duration-200 group no-underline text-inherit shadow-sm hover:shadow-md"
    >
      {preview.image && (
        <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={preview.image}
            alt={preview.title || domain}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.parentElement.style.display = "none";
            }}
          />
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <span>Visit</span>
          </div>
        </div>
      )}

      <div className="p-3.5 sm:p-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium mb-1.5">
          <Globe className="w-3.5 h-3.5 text-blue-500" />
          <span className="truncate">{preview.siteName || domain}</span>
        </div>

        {preview.title && (
          <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
            {preview.title}
          </h4>
        )}

        {preview.description && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
}
