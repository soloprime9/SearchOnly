"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import { toast } from "@/utils/toast";
import { Bookmark, X, Trash2, ExternalLink, Inbox } from "lucide-react";

export default function SavedPostsDrawer({ isOpen, onClose }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    setLoading(true);
    try {
      const apiBase = getApiBase();
      const res = await axios.get(`${apiBase}/post/user/bookmarks`, {
        headers: getAuthHeaders(),
      });
      if (Array.isArray(res.data?.bookmarks)) {
        setBookmarks(res.data.bookmarks);
      }
    } catch (err) {
      console.error("Error loading bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBookmarks();
    }
  }, [isOpen]);

  const handleRemoveBookmark = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    playPop();

    try {
      const apiBase = getApiBase();
      await axios.post(
        `${apiBase}/post/bookmark/${postId}`,
        {},
        { headers: getAuthHeaders() }
      );
      setBookmarks((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Removed from bookmarks");
    } catch {
      toast.error("Failed to remove bookmark");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0c101c] border-l border-white/[0.1] shadow-2xl flex flex-col text-white">
          {/* Header */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Bookmark className="w-5 h-5 fill-amber-400/20" />
              </div>
              <div>
                <h2 className="font-bold text-base text-white leading-tight">
                  Saved Bookmarks
                </h2>
                <span className="text-xs text-gray-400">
                  {bookmarks.length} {bookmarks.length === 1 ? "post saved" : "posts saved"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playPop();
                onClose();
              }}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-400">Loading saved posts...</span>
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center text-gray-500 mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm text-gray-200">
                  No bookmarks yet
                </h4>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  Save posts by clicking the bookmark icon to read or watch them later anytime.
                </p>
              </div>
            ) : (
              bookmarks.map((post) => {
                const isVideo = post.mediaType?.startsWith("video");
                const path = isVideo ? `/short/${post._id}` : `/post/${post._id}`;

                return (
                  <Link
                    key={post._id}
                    href={path}
                    onClick={() => {
                      playTap();
                      onClose();
                    }}
                    className="flex gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all group relative"
                  >
                    {/* Media thumbnail */}
                    {post.media ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 relative">
                        {isVideo ? (
                          <video
                            src={post.media}
                            className="w-full h-full object-cover"
                            preload="none"
                          />
                        ) : (
                          <img
                            src={post.media}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                        <Bookmark className="w-6 h-6 opacity-60" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 pr-6 flex flex-col justify-center">
                      <p className="text-xs text-gray-400 truncate mb-0.5">
                        @{post.userId?.username || "creator"}
                      </p>
                      <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                        {post.title || "Untitled Post"}
                      </h4>
                    </div>

                    {/* Unsave button */}
                    <button
                      onClick={(e) => handleRemoveBookmark(post._id, e)}
                      title="Remove from bookmarks"
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-70 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
