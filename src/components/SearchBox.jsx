"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiBase } from "@/utils/apiConfig";
import { playPop, playTap } from "@/utils/soundEffects";
import TrendingTagsBar from "./TrendingTagsBar";
import {
  Search,
  X,
  User,
  Hash,
  FileText,
  TrendingUp,
  ArrowRight,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";

export default function SearchFull({ onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [fullResults, setFullResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced autocomplete suggestion fetcher
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions(null);
      setFullResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const apiBase = getApiBase();
        // 1. Fetch lightweight autocomplete suggestions
        const suggestRes = await axios.get(
          `${apiBase}/post/search/suggest?q=${encodeURIComponent(trimmed)}`
        );
        if (suggestRes.data?.success && suggestRes.data?.suggestions) {
          setSuggestions(suggestRes.data.suggestions);
          setShowDropdown(true);
        }

        // 2. Also fetch existing search results for inline feed rendering
        try {
          const fullRes = await axios.get(
            `${apiBase}/post/single/search?q=${encodeURIComponent(trimmed)}`
          );
          if (Array.isArray(fullRes.data)) {
            setFullResults(fullRes.data);
          }
        } catch {
          /* noop */
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      setShowDropdown(false);
      playTap();
      const slug = query
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      router.push(`/topic/${slug}`);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions(null);
    setShowDropdown(false);
    setFullResults([]);
    playPop();
  };

  const hasSuggestions =
    suggestions &&
    ((suggestions.users && suggestions.users.length > 0) ||
      (suggestions.tags && suggestions.tags.length > 0) ||
      (suggestions.titles && suggestions.titles.length > 0));

  return (
    <div className="p-4 max-w-3xl mx-auto" ref={searchContainerRef}>
      {/* 🔍 Search Input Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim() && hasSuggestions) setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search topics, creators, hashtags, or articles..."
            className="w-full pl-11 pr-10 py-3.5 bg-gray-100 dark:bg-gray-900 border border-black/[0.05] dark:border-white/[0.08] rounded-2xl outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs"
          />
          {query ? (
            <button
              onClick={handleClear}
              className="absolute right-3.5 p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : loading ? (
            <div className="absolute right-3.5 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : null}
        </div>

        {/* 🚀 Live Autocomplete Floating Dropdown */}
        {showDropdown && hasSuggestions && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-gray-950 rounded-2xl border border-black/[0.08] dark:border-white/[0.1] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Creators Section */}
            {suggestions.users && suggestions.users.length > 0 && (
              <div className="p-2 border-b border-black/[0.05] dark:border-white/[0.06]">
                <span className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Creators
                </span>
                <div className="mt-1 space-y-1">
                  {suggestions.users.slice(0, 3).map((u, i) => (
                    <Link
                      key={i}
                      href={`/profile/${u.username}`}
                      onClick={() => {
                        setShowDropdown(false);
                        playTap();
                      }}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
                    >
                      <img
                        src={u.avatar || u.profilePic || "/Fondpeace.jpg"}
                        alt={u.username}
                        className="w-8 h-8 rounded-full object-cover bg-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = "/Fondpeace.jpg";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          @{u.username}
                        </p>
                        {u.bio && (
                          <p className="text-[11px] text-gray-500 truncate">{u.bio}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtags Section */}
            {suggestions.tags && suggestions.tags.length > 0 && (
              <div className="p-2 border-b border-black/[0.05] dark:border-white/[0.06]">
                <span className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Hashtags
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5 px-2">
                  {suggestions.tags.slice(0, 6).map((tag, i) => {
                    const cleanTag = tag.replace(/^#/, "");
                    return (
                      <Link
                        key={i}
                        href={`/topic/${cleanTag}`}
                        onClick={() => {
                          setShowDropdown(false);
                          playTap();
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <Hash className="w-3 h-3" />
                        <span>{cleanTag}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Titles Section */}
            {suggestions.titles && suggestions.titles.length > 0 && (
              <div className="p-2">
                <span className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Related Posts
                </span>
                <div className="mt-1 space-y-0.5">
                  {suggestions.titles.slice(0, 4).map((title, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setQuery(title);
                        setShowDropdown(false);
                        const slug = title
                          .toLowerCase()
                          .trim()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "");
                        router.push(`/topic/${slug}`);
                      }}
                      className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-gray-700 dark:text-gray-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer View All Link */}
            <div className="p-2.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.06] text-center">
              <Link
                href={`/topic/${query
                  .toLowerCase()
                  .trim()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}`}
                onClick={() => setShowDropdown(false)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1"
              >
                <span>View all results for &quot;{query}&quot;</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 🔥 Live Trending Tags Bar */}
      <div className="mt-2">
        <TrendingTagsBar />
      </div>

      {/* 📌 Search Results List */}
      <div className="mt-4 flex flex-col gap-3">
        {fullResults.map((p) => (
          <Link key={p._id} href={`/short/${p._id}`}>
            <div className="flex gap-3.5 bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group">
              <img
                src={p.thumbnail || p.media || "/Fondpeace.jpg"}
                alt={p.title}
                className="w-20 h-20 object-cover rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0 group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.currentTarget.src = "/Fondpeace.jpg";
                }}
              />

              <div className="flex flex-col justify-center min-w-0">
                <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {p.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500" />
                    {Array.isArray(p.likes) ? p.likes.length : p.likes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-emerald-500" />
                    {Array.isArray(p.comments) ? p.comments.length : p.comments || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-blue-500" />
                    {p.views || 0}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
