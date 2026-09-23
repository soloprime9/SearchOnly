"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import { Play, Eye, ChevronLeft, ChevronRight, Film, Sparkles } from "lucide-react";
import { playTap, playPop } from "@/utils/soundEffects";
import { getApiBase } from "@/utils/apiConfig";

function formatCount(num) {
  const n = Number(num) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function formatDuration(sec) {
  const s = Math.round(Number(sec) || 0);
  if (!s) return "0:30";
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem < 10 ? "0" : ""}${rem}`;
}

export default function TrendingShortsRail() {
  const scrollRef = useRef(null);
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstShortId, setFirstShortId] = useState("");

  useEffect(() => {
    const API_BASE = getApiBase();
    let isMounted = true;

    axios
      .get(`${API_BASE}/post/shorts?page=1&limit=8`)
      .then((res) => {
        if (!isMounted) return;
        const videoList = res.data?.videos;
        if (Array.isArray(videoList) && videoList.length > 0) {
          const mapped = videoList.map((v) => ({
            id: v._id,
            title: v.title || "Trending Short",
            creator: v.userId?.username || "creator",
            views: formatCount(v.views || 0),
            duration: formatDuration(v.duration || 45),
            tag: v.category || "Video",
            image: v.thumbnail || "/Fondpeace.jpg",
            media: v.media,
            href: `/short/${v._id}`,
          }));
          setShorts(mapped);
          if (mapped[0]?.id) {
            setFirstShortId(mapped[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleScroll = (direction) => {
    playTap();
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!loading && shorts.length === 0) return null;

  return (
    <div className="w-full mb-6 select-none">
      {/* Header with Navigation Controls */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
            <Film size={13} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>Trending Shorts</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-black dark:bg-white text-white dark:text-black">
                Hot
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight size={14} />
          </button>
          <Link
            href={`/short/${firstShortId}`}
            onClick={() => playTap()}
            className="text-xs font-bold text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition ml-1 hover:underline"
          >
            Watch All →
          </Link>
        </div>
      </div>

      {/* 9:16 Portrait Cards Horizontal Stream */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 scroll-smooth"
      >
        {shorts.map((short) => (
          <Link
            key={short.id}
            href={short.href}
            onClick={() => playPop()}
            className="relative shrink-0 w-[150px] sm:w-[170px] h-[240px] sm:h-[260px] rounded-2xl overflow-hidden bg-zinc-900 border border-black/10 dark:border-white/[0.12] hover:border-black/30 dark:hover:border-white/40 shadow-md group transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Background Thumbnail Image */}
            <img
              src={short.image}
              alt={short.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
              onError={(e) => {
                e.currentTarget.src = "/Fondpeace.jpg";
              }}
            />

            {/* Gradient Overlays for Readability & Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

            {/* Top Category Badge & Duration */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20">
                {short.tag}
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-300 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded">
                {short.duration}
              </span>
            </div>

            {/* Center Play Button Icon Overlay (appears on hover) */}
            <div className="absolute inset-0 flex items-center justify-center z-10 opacity-70 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-200">
                <Play size={16} className="fill-current ml-0.5" />
              </div>
            </div>

            {/* Bottom Info: Title & Creator */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 space-y-1">
              <p className="text-[11.5px] font-bold text-white line-clamp-2 leading-tight drop-shadow-md group-hover:underline">
                {short.title}
              </p>

              <div className="flex items-center justify-between text-[10px] text-zinc-300 pt-0.5">
                <div className="flex items-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold truncate">@{short.creator}</span>
                </div>
                <span className="flex items-center gap-0.5 shrink-0 text-zinc-400 font-medium">
                  <Eye size={10} />
                  {short.views}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
