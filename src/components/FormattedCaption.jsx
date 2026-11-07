"use client";

import React from "react";
import Link from "next/link";
import { playTap } from "@/utils/soundEffects";

/**
 * Universal FormattedCaption component for FondPeace.
 * Automatically converts:
 * - #hashtags into clickable Links to /topic/{slug}
 * - @mentions into clickable Links to /profile/{username}
 * - URLs into safe, clean external links
 */
export default function FormattedCaption({
  text = "",
  className = "",
  onHashtagClick,
  linkClass = "hover:underline transition-colors",
}) {
  if (!text || typeof text !== "string") return null;

  // Regex matches URLs, #hashtags (with alphanumeric/underscore), and @mentions
  const tokenRegex = /(https?:\/\/[^\s]+|#[a-zA-Z0-9_\u0590-\u05ff]+|@[a-zA-Z0-9_]+)/g;
  const parts = text.split(tokenRegex);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;

        // 1. #Hashtag Autolink -> /topic/{slug}
        if (part.startsWith("#") && part.length > 1) {
          const rawTag = part.slice(1);
          const slug = encodeURIComponent(rawTag.toLowerCase());

          if (onHashtagClick) {
            return (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playTap();
                  onHashtagClick(rawTag);
                }}
                className={`text-sky-400 font-bold ${linkClass} inline cursor-pointer`}
              >
                {part}
              </button>
            );
          }

          return (
            <Link
              key={i}
              href={`/topic/${slug}`}
              onClick={(e) => {
                e.stopPropagation();
                playTap();
              }}
              className={`text-sky-400 font-bold ${linkClass} inline cursor-pointer`}
            >
              {part}
            </Link>
          );
        }

        // 2. @Mention Autolink -> /profile/{username}
        if (part.startsWith("@") && part.length > 1) {
          const handle = part.slice(1);
          return (
            <Link
              key={i}
              href={`/profile/${handle}`}
              onClick={(e) => {
                e.stopPropagation();
                playTap();
              }}
              className={`text-indigo-400 font-bold ${linkClass} inline cursor-pointer`}
            >
              {part}
            </Link>
          );
        }

        // 3. URLs
        if (part.startsWith("http://") || part.startsWith("https://")) {
          let displayUrl = part;
          try {
            const u = new URL(part);
            displayUrl =
              u.hostname.replace(/^www\./, "") +
              (u.pathname.length > 1 ? u.pathname.slice(0, 18) + "…" : "");
          } catch (_) {}

          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={(e) => e.stopPropagation()}
              className={`text-blue-400 hover:text-blue-300 font-medium ${linkClass} inline break-all`}
            >
              {displayUrl}
            </a>
          );
        }

        // 4. Regular Text (Preserves spacing)
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}

