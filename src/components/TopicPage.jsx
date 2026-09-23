"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Play, Eye, Heart, Hash, Sparkles, Film, Image as ImageIcon } from "lucide-react";
import { getApiBase } from "@/utils/apiConfig";

export default function TopicPage({ topic }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="text-center py-16 px-4 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl rounded-3xl border border-black/5 dark:border-white/10 mt-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3">
          <Hash className="w-6 h-6" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
          No posts found for #{topic}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
          Be the first creator to start this conversation or explore other trending topics.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-full shadow-md shadow-blue-500/25 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Create Post</span>
        </Link>
      </div>
    );
  }

  /* ---------------- CONTENT GRID ---------------- */
  return (
    <section className="mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {posts.map((p) => {
          const isVideo = p.mediaType?.startsWith("video") || p.media?.endsWith(".mp4");
          const thumb = p.thumbnail || p.media || "/Fondpeace.jpg";

          return (
            <Link
              key={p._id}
              href={isVideo ? `/short/${p._id}` : `/post/${p._id}`}
              className="group relative flex flex-col bg-white/80 dark:bg-zinc-950/60 backdrop-blur-xl rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:border-blue-500/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
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
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
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

              {/* TITLE */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {p.title}
                </h2>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
