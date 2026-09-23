"use client";

import React, { useState } from "react";
import axios from "axios";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import { playChime, playPop } from "@/utils/soundEffects";
import { toast } from "@/utils/toast";
import { Repeat, MessageSquarePlus, X, Send, Sparkles } from "lucide-react";

export default function RepostModal({ isOpen, onClose, post, onRepostSuccess }) {
  const [isQuoteMode, setIsQuoteMode] = useState(false);
  const [quoteComment, setQuoteComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !post) return null;

  const originalAuthor = post?.userId?.username || "creator";

  const handleRepost = async (withComment = false) => {
    const headers = getAuthHeaders();
    if (!headers["x-auth-token"] && !headers["Authorization"]) {
      toast.error("Please log in to repost");
      return;
    }

    setSubmitting(true);
    playPop();

    try {
      const apiBase = getApiBase();
      const payload = withComment ? { comment: quoteComment.trim() } : {};
      const res = await axios.post(`${apiBase}/post/repost/${post._id}`, payload, {
        headers,
      });

      if (res.status === 201 || res.status === 200) {
        playChime();
        toast.success(withComment ? "Quote post published! 🚀" : "Reposted to your feed! 🔁");
        if (onRepostSuccess && res.data?.repost) {
          onRepostSuccess(res.data.repost);
        }
        setIsQuoteMode(false);
        setQuoteComment("");
        onClose();
      }
    } catch (err) {
      console.error("Repost failed:", err);
      toast.error(err.response?.data?.message || "Failed to repost");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <X size={18} />
        </button>

        {!isQuoteMode ? (
          /* Selection View */
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Repeat size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  Share to your audience
                </h3>
                <p className="text-xs text-gray-500">Repost @{originalAuthor}&apos;s post</p>
              </div>
            </div>

            {/* Post Snippet Preview */}
            <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 text-xs text-gray-600 dark:text-gray-300">
              <span className="font-bold text-gray-900 dark:text-white">@{originalAuthor}: </span>
              <span className="line-clamp-2">{post.title || "Shared media"}</span>
            </div>

            {/* Options */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleRepost(false)}
                disabled={submitting}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 font-bold text-xs transition-all border border-emerald-200/60 dark:border-emerald-900/40"
              >
                <div className="flex items-center gap-2.5">
                  <Repeat size={16} />
                  <span>Instant Repost</span>
                </div>
                <span className="text-[11px] font-normal text-emerald-600/80">Direct to Feed</span>
              </button>

              <button
                onClick={() => {
                  playPop();
                  setIsQuoteMode(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-zinc-900 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-850 font-bold text-xs transition-all border border-gray-200/70 dark:border-zinc-800"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquarePlus size={16} />
                  <span>Quote with Thoughts</span>
                </div>
                <span className="text-[11px] font-normal text-gray-400">Add comment</span>
              </button>
            </div>
          </div>
        ) : (
          /* Quote Post View */
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                Quote Post
              </h3>
              <button
                onClick={() => setIsQuoteMode(false)}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                ← Back
              </button>
            </div>

            {/* Input */}
            <textarea
              rows={3}
              placeholder="Add your thoughts or hot take..."
              value={quoteComment}
              onChange={(e) => setQuoteComment(e.target.value)}
              maxLength={280}
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-3 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none leading-relaxed"
            />

            {/* Original Post Embed Card */}
            <div className="p-3 bg-gray-50/70 dark:bg-zinc-900/60 rounded-2xl border border-gray-100 dark:border-zinc-800 text-xs">
              <span className="font-bold text-gray-900 dark:text-white">@{originalAuthor}</span>
              <p className="text-gray-500 line-clamp-2 mt-0.5">{post.title}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-gray-400">{quoteComment.length}/280</span>
              <button
                onClick={() => handleRepost(true)}
                disabled={submitting || !quoteComment.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:shadow-lg disabled:opacity-40 transition-all active:scale-95"
              >
                {submitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Post Quote</span>
                    <Send size={12} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
