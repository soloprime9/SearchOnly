'use client';

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  ArrowUpRight, 
  X, 
  Compass,
  Users,
  Film,
  FileText,
  ShieldCheck,
  Send
} from "lucide-react";
import { playTap, playPop, playChime } from "@/utils/soundEffects";
import { getApiBase } from "@/utils/apiConfig";
import { isPlayableShortPost } from "@/utils/postMediaUtils";

const REAL_TOPICS = [
  "Shorts",
  "Technology",
  "AI",
  "Stories",
  "Community",
  "Discussion",
  "Viral",
  "Ideas"
];

function SearchGoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [resultsPeople, setResultsPeople] = useState([]);
  const [resultsPosts, setResultsPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'creators' | 'shorts' | 'discussions'
  const [trending, setTrending] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (searchTerm) => {
    const trimmed = (searchTerm || "").trim();
    if (!trimmed) {
      setResultsPeople([]);
      setResultsPosts([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const apiBase = getApiBase();
      const res = await axios.get(
        `${apiBase}/post/search/unified?q=${encodeURIComponent(trimmed)}&type=all&limit=30`
      );

      if (res.data?.success) {
        setResultsPeople(res.data.people || []);
        setResultsPosts(res.data.posts || []);
      } else {
        setResultsPeople([]);
        setResultsPosts([]);
      }
      playChime();
    } catch (err) {
      console.error("Search error:", err);
      setError("Unable to complete search at this moment. Please try again.");
      playPop();
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trending posts from real feed (Mango/Feed) on mount
  useEffect(() => {
    loadTrendingFromBackend();
  }, []);

  // Auto-search if initial query in URL
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  async function loadTrendingFromBackend() {
    try {
      const apiBase = getApiBase();
      const res = await axios.get(`${apiBase}/post/mango/getall?page=1&limit=9`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.posts || []);
      if (data && data.length > 0) {
        setTrending(data);
      }
    } catch (e) {
      console.error("Trending Error", e);
    }
  }

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    playTap();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
    performSearch(trimmed);
  };

  const handleTopicClick = (topic) => {
    setQuery(topic);
    playTap();
    router.push(`/search?q=${encodeURIComponent(topic)}`, { scroll: false });
    performSearch(topic);
  };

  const handleClear = () => {
    setQuery("");
    setResultsPeople([]);
    setResultsPosts([]);
    setHasSearched(false);
    router.push("/search", { scroll: false });
  };

  const videoPosts = resultsPosts.filter((p) => isPlayableShortPost(p));
  const regularPosts = resultsPosts.filter((p) => !isPlayableShortPost(p));

  const totalResultsCount = resultsPeople.length + resultsPosts.length;

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
              <span>FondPeace Search</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-primary)]">
              Search <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">FondPeace</span>
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2 max-w-xl mx-auto">
              Find creators, short reels, discussions, and topics across the community.
            </p>
          </div>

          {/* Glowing Search Input Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative z-10 flex items-center bg-[var(--bg-surface)] backdrop-blur-2xl border border-[var(--border-subtle)] rounded-2xl sm:rounded-full p-1.5 sm:p-2 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/15 transition-all"
          >
            <div className="pl-3.5 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              className="flex-1 px-3 py-2.5 sm:py-3 text-sm sm:text-base bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
              placeholder="Search creators by username, topics, shorts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 mr-1 text-gray-400 hover:text-[var(--text-primary)] transition-colors rounded-full"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 sm:px-7 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base font-bold rounded-xl sm:rounded-full shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 active:scale-95 shrink-0 cursor-pointer"
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

          {/* Real Category Chips */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-semibold text-[var(--text-secondary)] shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Popular:
            </span>
            {REAL_TOPICS.map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleTopicClick(topic)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-subtle-hover)] hover:text-blue-500 transition-all shrink-0 whitespace-nowrap shadow-sm cursor-pointer"
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
              Searching creators & discussions...
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* SEARCH RESULTS TABS */}
        {hasSearched && !loading && (
          <div className="mt-8">
            <div className="flex items-center gap-1.5 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-[var(--bg-subtle)]"
                }`}
              >
                All Results ({totalResultsCount})
              </button>

              {resultsPeople.length > 0 && (
                <button
                  onClick={() => setActiveTab("creators")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "creators"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <Users size={14} />
                  <span>Creators ({resultsPeople.length})</span>
                </button>
              )}

              {videoPosts.length > 0 && (
                <button
                  onClick={() => setActiveTab("shorts")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "shorts"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <Film size={14} />
                  <span>Shorts & Videos ({videoPosts.length})</span>
                </button>
              )}

              {regularPosts.length > 0 && (
                <button
                  onClick={() => setActiveTab("discussions")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "discussions"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <FileText size={14} />
                  <span>Discussions ({regularPosts.length})</span>
                </button>
              )}
            </div>

            {totalResultsCount === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-base font-semibold">No results found for "{query}"</p>
                <p className="text-xs text-gray-400 mt-1">Try searching for a different keyword or username</p>
              </div>
            )}

            {/* CREATORS SECTION */}
            {(activeTab === "all" || activeTab === "creators") && resultsPeople.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users size={15} className="text-blue-500" />
                  <span>Creators</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resultsPeople.map((user) => (
                    <div
                      key={user._id}
                      className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-blue-500/40 transition-all flex items-center justify-between gap-3 shadow-xs"
                    >
                      <Link
                        href={`/profile/${user.username}`}
                        className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-90"
                      >
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                          {user.profilePicture && user.profilePicture !== "/Fondpeace.jpg" ? (
                            <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            user.username?.[0]?.toUpperCase() || "U"
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">
                              {user.name || user.username}
                            </h4>
                            {user.isVerified && <ShieldCheck size={14} className="text-blue-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] truncate">@{user.username}</p>
                          {user.followersCount !== undefined && (
                            <p className="text-[10px] text-gray-400 mt-0.5">{user.followersCount} followers</p>
                          )}
                        </div>
                      </Link>
                      <Link
                        href={`/messages?userId=${user._id}&name=${encodeURIComponent(user.username || "")}`}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-sm shadow-blue-500/20"
                      >
                        <Send size={11} />
                        <span>Message</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* POSTS SECTION */}
            {(activeTab === "all" || activeTab === "shorts" || activeTab === "discussions") && (
              <div className="mt-8 space-y-4">
                {(activeTab === "shorts"
                  ? videoPosts
                  : activeTab === "discussions"
                  ? regularPosts
                  : resultsPosts
                ).map((post) => {
                  const isVideo = isPlayableShortPost(post);
                  const postLink = isVideo ? `/shorts/${post._id}` : `/post/${post._id}`;
                  const thumb = post.thumbnail || post.media || post.linkPreview?.image || "/Fondpeace.jpg";

                  return (
                    <Link
                      key={post._id}
                      href={postLink}
                      className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-blue-500/40 hover:-translate-y-0.5 transition-all shadow-xs flex flex-col sm:flex-row gap-3.5 group"
                    >
                      {(post.media || post.thumbnail || post.linkPreview?.image) && (
                        <div className="relative w-full sm:w-44 aspect-video sm:aspect-[4/3] rounded-xl overflow-hidden bg-black shrink-0">
                          <img
                            src={thumb}
                            alt={post.title || "Post thumbnail"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { e.currentTarget.src = "/Fondpeace.jpg"; }}
                          />
                          {isVideo && (
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md">
                                <Play size={14} className="ml-0.5 fill-black" />
                              </div>
                              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-white text-[9px] font-bold">
                                Video
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-[var(--text-secondary)]">
                              @{post.userId?.username || "Creator"}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-[11px] text-gray-400">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            {post.category && (
                              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                                {post.category}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm sm:text-base text-[var(--text-primary)] group-hover:text-blue-500 transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] mt-3 pt-2.5 border-t border-[var(--border-subtle)]">
                          <span className="flex items-center gap-1 text-rose-500">
                            <Heart size={13} className="fill-current" />
                            <span>{post.likes?.length || 0}</span>
                          </span>
                          <span className="flex items-center gap-1 text-blue-500">
                            <MessageCircle size={13} />
                            <span>{post.comments?.length || 0}</span>
                          </span>
                          <span className="flex items-center gap-1 text-emerald-500">
                            <Eye size={13} />
                            <span>{post.views || 0}</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TRENDING ON FONDPEACE (Shown when not searching) */}
        {!hasSearched && trending.length > 0 && (
          <section className="mt-10 sm:mt-14">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
                    Trending on FondPeace
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">Active discussions & reels</p>
                </div>
              </div>
              <Link
                href="/shorts"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Watch Shorts</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.map((post) => {
                const thumb = post.thumbnail || post.media || post.linkPreview?.image || "/Fondpeace.jpg";
                const isVideo = isPlayableShortPost(post);
                const postLink = isVideo ? `/shorts/${post._id}` : `/post/${post._id}`;

                return (
                  <Link
                    key={post._id}
                    href={postLink}
                    className="group flex flex-col bg-[var(--bg-surface)] backdrop-blur-xl rounded-2xl border border-[var(--border-subtle)] hover:border-blue-500/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
                  >
                    <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
                      <img
                        src={thumb}
                        alt={post.title || "Trending post"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.currentTarget.src = "/Fondpeace.jpg"; }}
                      />
                      {isVideo && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-900 shadow-md group-hover:scale-110 transition-transform">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                            Video
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <p className="font-bold text-sm text-[var(--text-primary)] line-clamp-2 group-hover:text-blue-500 transition-colors leading-snug">
                        {post.title}
                      </p>

                      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mt-3 pt-3 border-t border-[var(--border-subtle)]">
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
                            {post.views || 0}
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
      </div>
    </div>
  );
}

export default function SearchGo() {
  return (
    <Suspense fallback={<div className="w-full text-center py-10 text-gray-400">Loading search...</div>}>
      <SearchGoContent />
    </Suspense>
  );
}
