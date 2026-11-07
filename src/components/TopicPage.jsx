"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { 
  Play, 
  Eye, 
  Heart, 
  Hash, 
  Sparkles, 
  Film, 
  FileText, 
  Users, 
  Flame,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { getApiBase } from "@/utils/apiConfig";
import { isPlayableShortPost } from "@/utils/postMediaUtils";

const SUGGESTED_TOPICS = [
  "Viral",
  "Shorts",
  "Video",
  "Love",
  "Dance",
  "Comedy",
  "Episode",
  "Drama"
];

export default function TopicPage({ topic }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'videos' | 'discussions'

  useEffect(() => {
    if (!topic) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const apiBase = getApiBase();
        const res = await axios.get(
          `${apiBase}/post/single/search?q=${encodeURIComponent(topic)}`
        );
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Topic fetch error:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [topic]);

  const videoPosts = posts.filter((p) => isPlayableShortPost(p));
  const regularPosts = posts.filter((p) => !isPlayableShortPost(p));

  const filteredPosts = 
    activeFilter === "videos" 
      ? videoPosts 
      : activeFilter === "discussions" 
      ? regularPosts 
      : posts;

  /* ---------------- LOADING SKELETON ---------------- */
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] bg-zinc-200 dark:bg-zinc-900/60 border border-black/5 dark:border-white/5 animate-pulse rounded-2xl"
          />
        ))}
      </div>
    );
  }

  /* ---------------- EMPTY STATE ---------------- */
  if (!posts.length) {
    return (
      <div className="text-center py-12 px-4 bg-[var(--bg-surface)] backdrop-blur-xl rounded-3xl border border-[var(--border-subtle)] mt-6 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3">
          <Hash className="w-7 h-7" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
          No posts found for #{topic}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
          Be the first creator to start a post with #{topic}, or explore other trending topics across the community.
        </p>

        {/* Suggested active topics */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
          <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
            <TrendingUp size={12} className="text-blue-500" />
            Trending:
          </span>
          {SUGGESTED_TOPICS.map((tag) => (
            <Link
              key={tag}
              href={`/topic/${tag.toLowerCase()}`}
              className="px-3 py-1.5 rounded-full bg-[var(--bg-subtle)] hover:bg-blue-500/10 border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-blue-500 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-blue-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Post to #{topic}</span>
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-subtle)] hover:bg-[var(--bg-subtle-hover)] border border-[var(--border-subtle)] text-xs sm:text-sm font-semibold rounded-full transition-colors text-[var(--text-primary)]"
          >
            <span>Explore All Topics</span>
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- CONTENT VIEW WITH FILTER TABS ---------------- */
  return (
    <section className="mt-4">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === "all"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-blue-500/30"
          }`}
        >
          All ({posts.length})
        </button>

        {videoPosts.length > 0 && (
          <button
            onClick={() => setActiveFilter("videos")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === "videos"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-blue-500/30"
            }`}
          >
            <Film size={13} />
            <span>Shorts & Videos ({videoPosts.length})</span>
          </button>
        )}

        {regularPosts.length > 0 && (
          <button
            onClick={() => setActiveFilter("discussions")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === "discussions"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-blue-500/30"
            }`}
          >
            <FileText size={13} />
            <span>Discussions ({regularPosts.length})</span>
          </button>
        )}
      </div>

      {/* Grid of Results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredPosts.map((p) => {
          const isVideo = isPlayableShortPost(p);
          const postLink = isVideo ? `/shorts/${p._id}` : `/post/${p._id}`;
          const thumb = p.thumbnail || p.media || p.linkPreview?.image || "/Fondpeace.jpg";
          const author = p.userId;

          return (
            <Link
              key={p._id}
              href={postLink}
              className="group relative flex flex-col bg-[var(--bg-surface)] backdrop-blur-xl rounded-2xl border border-[var(--border-subtle)] hover:border-blue-500/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
            >
              {/* MEDIA CONTAINER */}
              <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden">
                <img
                  src={thumb}
                  alt={p.title || topic}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.src = "/Fondpeace.jpg"; }}
                />

                {/* VIDEO INDICATOR BADGE */}
                {isVideo && (
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-900 shadow-md group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                      <Film className="w-3 h-3 text-pink-400" />
                      <span>Video</span>
                    </span>
                  </div>
                )}

                {/* VIEWS BADGE */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>{p.views || 0}</span>
                </div>

                {/* LIKES BADGE */}
                {p.likes?.length > 0 && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    <span>{p.likes.length}</span>
                  </div>
                )}
              </div>

              {/* CARD DETAILS */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  {/* Creator Info */}
                  {author && (
                    <div className="flex items-center gap-1.5 mb-1.5 text-xs text-[var(--text-secondary)]">
                      <div className="w-4 h-4 rounded-full overflow-hidden bg-zinc-700 shrink-0">
                        {author.profilePicture && author.profilePicture !== "/Fondpeace.jpg" ? (
                          <img src={author.profilePicture} alt={author.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white bg-blue-600">
                            {author.username?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <span className="truncate font-medium text-[11px]">
                        @{author.username || "creator"}
                      </span>
                      {author.isVerified && <ShieldCheck size={11} className="text-blue-500 shrink-0" />}
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-blue-500 transition-colors">
                    {p.title}
                  </h2>
                </div>

                {/* Category tag */}
                {p.category && (
                  <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                    <span className="font-semibold uppercase tracking-wider">{p.category}</span>
                    <span className="text-[10px] text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
