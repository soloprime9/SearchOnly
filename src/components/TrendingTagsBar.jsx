"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { getApiBase } from "@/utils/apiConfig";
import { playTap } from "@/utils/soundEffects";
import { Flame, Hash, TrendingUp } from "lucide-react";

export default function TrendingTagsBar({ onTagSelect, currentTag }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTrending = async () => {
      try {
        const apiBase = getApiBase();
        const res = await axios.get(`${apiBase}/post/trending-tags`);
        if (isMounted && res.data?.success && Array.isArray(res.data?.trending)) {
          setTags(res.data.trending);
        }
      } catch (err) {
        console.error("Error fetching trending tags:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTrending();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="w-16 h-7 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />
        <div className="w-24 h-7 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />
        <div className="w-20 h-7 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />
      </div>
    );
  }

  const displayTags = (tags && tags.length > 0) ? tags : [
    { name: "Discussions", postsCount: 142 },
    { name: "CreatorEconomy", postsCount: 98 },
    { name: "ShortsViral", postsCount: 86 },
    { name: "FutureTrends", postsCount: 64 },
    { name: "StartupLife", postsCount: 51 },
    { name: "Design2026", postsCount: 39 },
  ];

  return (
    <div className="py-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300">
          <Flame className="w-3.5 h-3.5 fill-white text-white" />
          <span>Trending Topics</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {displayTags.map((tag, idx) => {
          const tagName = tag.name || tag.hashtag?.replace(/^#/, "");
          const isSelected = currentTag === tagName;

          return (
            <Link
              key={idx}
              href={`/topic/${tagName}`}
              onClick={() => {
                playTap();
                if (onTagSelect) onTagSelect(tagName);
              }}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95 ${
                isSelected
                  ? "bg-white text-black border-white shadow-sm font-bold"
                  : "bg-white/[0.04] text-zinc-300 border-white/[0.08] hover:border-white/25 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <Hash className="w-3 h-3 opacity-60" />
              <span>{tagName}</span>
              {tag.postsCount > 0 && (
                <span
                  className={`text-[9.5px] px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? "bg-black/20 text-black font-bold"
                      : "bg-white/[0.08] text-zinc-400"
                  }`}
                >
                  {tag.postsCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
