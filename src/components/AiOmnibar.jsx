"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { getApiBase } from "@/utils/apiConfig";
import { playPop, playTap } from "@/utils/soundEffects";
import {
  Search,
  Sparkles,
  Flame,
  Film,
  Wrench,
  ArrowRight,
  TrendingUp,
  User,
  Hash,
  X,
  Command,
} from "lucide-react";

export default function AiOmnibar() {
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState("ai"); // 'ai' | 'trending' | 'shorts' | 'tools'
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced autocomplete suggestions
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions(null);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const apiBase = getApiBase();
        const res = await axios.get(
          `${apiBase}/post/search/suggest?q=${encodeURIComponent(trimmed)}`
        );
        if (res.data?.success && res.data?.suggestions) {
          setSuggestions(res.data.suggestions);
          setShowDropdown(true);
        }
      } catch {
        /* noop */
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    playTap();
    setShowDropdown(false);

    if (activeChip === "shorts") {
      router.push(`/shorts?q=${encodeURIComponent(trimmed)}`);
    } else {
      const slug = trimmed
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      router.push(`/topic/${slug}`);
    }
  };

  const handleChipClick = (chipId, href) => {
    playTap();
    setActiveChip(chipId);
    if (href) {
      router.push(href);
    }
  };

  return (
    <div ref={containerRef} className="w-full mb-5 relative z-30">
      {/* ─── Glowing Omnibar Capsule ─── */}
      <div
        className={`relative rounded-2xl sm:rounded-3xl p-[1px] transition-all duration-300 ${
          isFocused
            ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_30px_rgba(59,130,246,0.35)]"
            : "bg-gradient-to-r from-blue-500/30 via-indigo-500/20 to-purple-500/30 hover:from-blue-500/50 hover:to-purple-500/50"
        }`}
      >
        <div className="bg-[#0b0e1a]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-2 sm:p-2.5">
          {/* Main Input Row */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 px-2 py-1">
            {/* Ambient Search Icon */}
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Search className="w-4 h-4 text-blue-400" />
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                if (suggestions) setShowDropdown(true);
              }}
              placeholder="Search FondPeace or ask AI anything..."
              className="flex-1 bg-transparent text-sm sm:text-[15px] font-medium text-white placeholder-gray-400 outline-none"
            />

            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSuggestions(null);
                  setShowDropdown(false);
                }}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Action / Search Button */}
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition active:scale-95 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>

          {/* ─── Category Quick Chips ─── */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-1 pt-2 border-t border-white/[0.06] overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleChipClick("ai", "/search")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeChip === "ai"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                  : "bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>AI Search</span>
            </button>

            <button
              type="button"
              onClick={() => handleChipClick("trending", "/search")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeChip === "trending"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Trending</span>
            </button>

            <button
              type="button"
              onClick={() => handleChipClick("shorts", "/shorts")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeChip === "shorts"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                  : "bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <Film className="w-3 h-3 text-rose-400" />
              <span>Shorts</span>
            </button>

            <button
              type="button"
              onClick={() => handleChipClick("tools", "/monetization")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeChip === "tools"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                  : "bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <Wrench className="w-3 h-3 text-purple-400" />
              <span>Creator Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Live Autocomplete Suggestion Dropdown ─── */}
      {showDropdown && suggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c101c]/95 backdrop-blur-2xl border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Topics Suggestions */}
          {suggestions.topics?.length > 0 && (
            <div className="p-2 border-b border-white/[0.06]">
              <div className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Hash className="w-3 h-3 text-blue-400" />
                <span>Trending Topics</span>
              </div>
              <div className="space-y-0.5">
                {suggestions.topics.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/topic/${item.slug || item.query}`}
                    onClick={() => {
                      playTap();
                      setShowDropdown(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-200 hover:bg-white/[0.08] hover:text-white transition group"
                  >
                    <span className="font-semibold">{item.query || item.title}</span>
                    <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Creators Suggestions */}
          {suggestions.users?.length > 0 && (
            <div className="p-2">
              <div className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-purple-400" />
                <span>Creators</span>
              </div>
              <div className="space-y-0.5">
                {suggestions.users.map((u, idx) => (
                  <Link
                    key={idx}
                    href={`/profile/${u.username}`}
                    onClick={() => {
                      playTap();
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-200 hover:bg-white/[0.08] hover:text-white transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {u.username?.[0] || "U"}
                    </div>
                    <span className="font-semibold">@{u.username}</span>
                    {u.name && <span className="text-gray-400 text-[11px]">({u.name})</span>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Submit Footer */}
          <div className="p-2 bg-black/40 border-t border-white/[0.06] text-center">
            <button
              onClick={handleSearchSubmit}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Press Enter or click to search all results for &quot;{query}&quot; →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
