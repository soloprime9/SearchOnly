'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { 
  Search, 
  Sparkles, 
  Flame, 
  Heart, 
  MessageCircle, 
  Eye, 
  Play, 
  Image as ImageIcon, 
  ArrowUpRight, 
  TrendingUp,
  X,
  Compass
} from "lucide-react";
import { playTap, playPop, playChime } from "@/utils/soundEffects";
import { getApiBase } from "@/utils/apiConfig";

const QUICK_TOPICS = [
  "Artificial Intelligence",
  "Technology",
  "Cricket",
  "Shorts & Reels",
  "Startups",
  "Bollywood",
  "Hollywood",
  "Gaming",
  "Crypto",
  "Space"
];

export default function SearchGo() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState("results");
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    loadTrendingFromBackend();
  }, []);

  async function loadTrendingFromBackend() {
    try {
      const apiBase = getApiBase();
      let ids = [
        "6923ef50849dda709966a7e0",
        "6923ee33849dda709966a7de",
        "6923eca2849dda709966a7dc",
        "6923eba7849dda709966a7da",
      ];
      ids = ids.sort(() => 0.5 - Math.random());

      let finalTrending = [];
      const pickedIds = new Set();

      for (const id of ids) {
        if (finalTrending.length >= 6) break;

        const res = await fetch(`${apiBase}/post/single/${id}`, { cache: "no-store" });
        if (!res.ok) continue;
        const data = await res.json();
        const related = data?.related || [];

        if (related.length > 0) {
          const eligible = related.filter((post) => post.media);
          if (eligible.length > 0) {
            const pick = eligible[Math.floor(Math.random() * eligible.length)];
            if (!pickedIds.has(pick._id)) {
              pickedIds.add(pick._id);
              finalTrending.push(pick);
            }
          }
        }
      }

      setTrending(finalTrending);
    } catch (e) {
      console.log("Trending Error", e);
    }
  }

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    playTap();

    try {
      const apiBase = getApiBase();
      const response = await axios.get(`${apiBase}/autoai/result?q=${encodeURIComponent(trimmed)}`);
      const searchData = response.data?.ScrapedData?.[0] || response.data;

      setResults(searchData?.results || []);
      setImages(searchData?.images || []);
      setActiveTab("results");
      playChime();
    } catch (err) {
      setError("Unable to complete search at this moment. Please try again.");
      playPop();
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic) => {
    setQuery(topic);
    playTap();
  };

  return (
    <div className="w-full py-6 sm:py-10 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Ambient Glows */}
        <div className="relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Hero Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3 shadow-sm">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Explore & Discovery Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950 dark:text-white">
              Discover <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Everything</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
              Search trending social discussions, creator videos, topics, and global news instantly.
            </p>
          </div>

          {/* Glowing Search Input Bar */}
          <form
            onSubmit={handleSearch}
            className="relative z-10 flex items-center bg-white dark:bg-zinc-950/80 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-full p-1.5 sm:p-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15 transition-all"
          >
            <div className="pl-3.5 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              className="flex-1 px-3 py-2.5 sm:py-3 text-sm sm:text-base bg-transparent text-gray-950 dark:text-white placeholder-gray-400 focus:outline-none"
              placeholder="Search posts, creators, AI updates, news..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setImages([]);
                }}
                className="p-1.5 mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 sm:px-7 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base font-bold rounded-xl sm:rounded-full shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 active:scale-95 shrink-0"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                <span>Search</span>
              )}
            </button>
          </form>

          {/* Quick Category Chips */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-semibold text-gray-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Popular:
            </span>
            {QUICK_TOPICS.map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleTopicClick(topic)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all shrink-0 whitespace-nowrap shadow-sm"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-12 text-center py-10">
            <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Gathering the freshest discussions & insights...
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* TRENDING ON FONDPEACE (Hero Grid) */}
        {/* -------------------------------------------------- */}
        {trending.length > 0 && results.length === 0 && !loading && (
          <section className="mt-10 sm:mt-14">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white tracking-tight">
                    Trending on FondPeace
                  </h2>
                  <p className="text-xs text-gray-400">Viral discussions and media right now</p>
                </div>
              </div>
              <Link
                href="/short/698c432d0a8059958d20a4f4"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Watch Shorts</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.map((post) => {
                const thumb = post.thumbnail || post.media || `/Fondpeace.jpg`;
                const isVideo = post.mediaType?.startsWith("video") || post.media?.endsWith(".mp4");

                return (
                  <Link
                    key={post._id}
                    href={isVideo ? `/short/${post._id}` : `/post/${post._id}`}
                    className="group flex flex-col bg-white dark:bg-zinc-950/60 backdrop-blur-xl rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:border-blue-500/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
                  >
                    {/* Media Thumbnail with Overlay Badge */}
                    <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
                      <img
                        src={thumb}
                        alt={post.title || "Trending post"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.currentTarget.src = "/Fondpeace.jpg"; }}
                      />
                      {isVideo && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-900 shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                            Video
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content & Metrics */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {post.title}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-rose-500">
                            <Heart className="w-3.5 h-3.5 fill-current" />
                            <span className="font-semibold text-gray-600 dark:text-gray-300">
                              {post.likes?.length || 0}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 text-blue-500">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="font-semibold text-gray-600 dark:text-gray-300">
                              {post.comments?.length || 0}
                            </span>
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-emerald-500">
                          <Eye className="w-3.5 h-3.5" />
                          <span className="font-semibold text-gray-600 dark:text-gray-300">
                            {post.views || 1}
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* -------------------------------------------------- */}
        {/* TABS (FOR LIVE SEARCH RESULTS) */}
        {/* -------------------------------------------------- */}
        {results.length > 0 && (
          <div className="flex items-center gap-2 mt-8 border-b border-black/[0.06] dark:border-white/[0.08] pb-1">
            <button
              onClick={() => setActiveTab("results")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === "results"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-gray-500 dark:text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              }`}
            >
              <span>Discussions & Web</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[11px]">
                {results.length}
              </span>
            </button>

            {images.length > 0 && (
              <button
                onClick={() => setActiveTab("images")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                  activeTab === "images"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-gray-500 dark:text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Images</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[11px]">
                  {images.length}
                </span>
              </button>
            )}
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* RESULTS TAB CONTENT */}
        {/* -------------------------------------------------- */}
        {activeTab === "results" && results.length > 0 && (
          <div className="mt-6 space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-950/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] hover:border-blue-500/30 transition-all shadow-sm group"
              >
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400 hover:underline group-hover:text-blue-500"
                >
                  <span>{result.title}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                  {result.snippet}
                </p>
                {result.link && (
                  <p className="text-[11px] text-gray-400 mt-2 truncate">
                    {result.link}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* IMAGES TAB CONTENT */}
        {/* -------------------------------------------------- */}
        {activeTab === "images" && images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:scale-105 transition-transform"
              >
                <img
                  src={img}
                  alt={`Result ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
