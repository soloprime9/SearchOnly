"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiBase } from "@/utils/apiConfig";
import { Hash, X, Sparkles, TrendingUp, Play } from "lucide-react";
import { playPop, playTap } from "@/utils/soundEffects";

export default function HashtagDrawer({ hashtag, isOpen, onClose, onSelectPost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !hashtag) return;

    let isMounted = true;
    setLoading(true);

    const fetchTagPosts = async () => {
      try {
        const apiBase = getApiBase();
        const cleanTag = hashtag.replace("#", "");
        // Query related / tag posts
        const res = await axios.get(`${apiBase}/post/mango/getall?tag=${cleanTag}&limit=20`);
        if (isMounted && Array.isArray(res.data)) {
          const matched = res.data.filter((p) =>
            p.tags?.some((t) => t?.toLowerCase() === cleanTag.toLowerCase()) ||
            p.title?.toLowerCase().includes(`#${cleanTag.toLowerCase()}`)
          );
          setPosts(matched.length > 0 ? matched : res.data.slice(0, 10));
        }
      } catch (err) {
        console.error("Error fetching tag posts:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTagPosts();

    return () => {
      isMounted = false;
    };
  }, [isOpen, hashtag]);

  if (!isOpen || !hashtag) return null;

  const tagDisplay = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-950 h-full shadow-2xl flex flex-col z-10 border-l border-gray-100 dark:border-zinc-800 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
              <Hash size={20} />
            </div>
            <div>
              <h3 className="font-black text-base text-gray-900 dark:text-white">
                {tagDisplay}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">Trending Topic Explorer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-850 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-2 text-gray-400">
              <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Finding posts with {tagDisplay}...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs">
              No posts found under this topic yet.
            </div>
          ) : (
            posts.map((p) => {
              const isVid = p.mediaType?.startsWith("video");
              return (
                <div
                  key={p._id}
                  onClick={() => {
                    playPop();
                    if (onSelectPost) onSelectPost(p);
                    onClose();
                  }}
                  className="flex gap-3 p-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer border border-gray-100 dark:border-zinc-850/80 group"
                >
                  {/* Media Thumbnail */}
                  {p.media ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0">
                      {isVid ? (
                        <>
                          <video
                            src={p.media}
                            muted
                            preload="none"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play size={12} className="text-white fill-white" />
                          </div>
                        </>
                      ) : (
                        <img
                          src={p.media}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <Sparkles size={16} />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-500 transition-colors">
                      {p.title || "Post"}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span>@{p.userId?.username || "creator"}</span>
                      <span>❤️ {p.likes?.length || 0}</span>
                      <span>💬 {p.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
