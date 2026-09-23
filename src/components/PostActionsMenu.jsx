"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import { toast } from "@/utils/toast";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import CreatorAnalyticsModal from "./CreatorAnalyticsModal";
import ReportModal from "./ReportModal";
import {
  MoreHorizontal,
  Pin,
  PinOff,
  BarChart2,
  Copy,
  VolumeX,
  UserX,
  Flag,
  Bookmark,
  Sparkles,
  Download,
} from "lucide-react";

export default function PostActionsMenu({
  post,
  currentUserId,
  isBookmarked = false,
  onToggleBookmark,
  onOpenStoryCard,
  onPinToggled,
  onMuted,
}) {
  const [open, setOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isPinned, setIsPinned] = useState(post?.isPinned || false);
  const menuRef = useRef(null);

  useEffect(() => {
    setIsPinned(post?.isPinned || false);
  }, [post?.isPinned]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const authorId = post?.userId?._id || post?.userId;
  const isCreator = currentUserId && String(authorId) === String(currentUserId);

  const handleTogglePin = async () => {
    setOpen(false);
    playPop();
    try {
      const apiBase = getApiBase();
      const res = await axios.post(
        `${apiBase}/post/pin/${post._id}`,
        {},
        { headers: getAuthHeaders() }
      );
      if (res.data?.success) {
        setIsPinned(res.data.isPinned);
        playChime();
        toast.success(res.data.isPinned ? "Post pinned to top of your profile" : "Post unpinned");
        if (onPinToggled) onPinToggled(res.data.isPinned);
      } else {
        toast.error(res.data?.message || "Failed to toggle pin");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error toggling pin");
    }
  };

  const handleCopyLink = async () => {
    setOpen(false);
    playTap();
    try {
      const shareUrl = `${window.location.origin}/post/${post._id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleDownloadMedia = async () => {
    setOpen(false);
    playTap();
    if (!post?.media) return;
    try {
      toast.success("Starting download...");
      const response = await fetch(post.media);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const isVideo = post.mediaType?.startsWith("video") || post.media.includes(".mp4");
      a.download = `FondPeace_${post._id}${isVideo ? ".mp4" : ".jpg"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      playChime();
      toast.success("Media downloaded successfully! 📥");
    } catch {
      window.open(post.media, "_blank");
      toast.success("Opening media in new tab");
    }
  };

  const handleMuteUser = async () => {
    setOpen(false);
    if (!authorId) return;
    playPop();
    try {
      const apiBase = getApiBase();
      const res = await axios.post(
        `${apiBase}/user/mute/${authorId}`,
        {},
        { headers: getAuthHeaders() }
      );
      if (res.data?.success) {
        toast.success(res.data.message || (res.data.isMuted ? "User muted" : "User unmuted"));
        if (onMuted) onMuted(res.data.isMuted);
      } else {
        toast.error(res.data?.message || "Action failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error muting user");
    }
  };

  const handleBlockUser = async () => {
    setOpen(false);
    if (!authorId) return;
    if (!confirm("Are you sure you want to block this user? You will no longer see their posts.")) return;
    playPop();
    try {
      const apiBase = getApiBase();
      const res = await axios.post(
        `${apiBase}/user/block/${authorId}`,
        {},
        { headers: getAuthHeaders() }
      );
      if (res.data?.success) {
        toast.success("User blocked");
      } else {
        toast.error(res.data?.message || "Action failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error blocking user");
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* 3-Dots Trigger Button */}
      <button
        onClick={() => {
          playTap();
          setOpen((prev) => !prev);
        }}
        aria-label="Post actions"
        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-9 z-40 w-52 rounded-2xl bg-white dark:bg-gray-950 border border-black/[0.08] dark:border-white/[0.12] shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Creator Options */}
          {isCreator ? (
            <>
              <button
                onClick={handleTogglePin}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors"
              >
                {isPinned ? (
                  <>
                    <PinOff className="w-4 h-4 text-gray-500" />
                    <span>Unpin from Profile</span>
                  </>
                ) : (
                  <>
                    <Pin className="w-4 h-4 text-blue-500" />
                    <span>Pin to Profile</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  playPop();
                  setShowAnalytics(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors"
              >
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                <span>View Analytics</span>
              </button>
            </>
          ) : null}

          {/* General Options */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] rounded-xl transition-colors"
          >
            <Copy className="w-4 h-4 text-gray-500" />
            <span>Copy Post Link</span>
          </button>

          {onToggleBookmark && (
            <button
              onClick={() => {
                setOpen(false);
                onToggleBookmark();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] rounded-xl transition-colors"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? "text-amber-500 fill-amber-500" : "text-gray-500"}`} />
              <span>{isBookmarked ? "Remove from Saved" : "Save Post"}</span>
            </button>
          )}

          {onOpenStoryCard && (
            <button
              onClick={() => {
                setOpen(false);
                onOpenStoryCard();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-colors font-semibold"
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Export Story Card 📸</span>
            </button>
          )}

          {post?.media && (
            <button
              onClick={handleDownloadMedia}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] rounded-xl transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Download Media 📥</span>
            </button>
          )}

          {/* Viewer Moderation Options */}
          {!isCreator && authorId && (
            <>
              <div className="my-1 border-t border-black/[0.05] dark:border-white/[0.06]" />

              <button
                onClick={handleMuteUser}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-xl transition-colors"
              >
                <VolumeX className="w-4 h-4" />
                <span>Mute @{post?.userId?.username || "creator"}</span>
              </button>

              <button
                onClick={handleBlockUser}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
              >
                <UserX className="w-4 h-4" />
                <span>Block User</span>
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  playPop();
                  setShowReport(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
              >
                <Flag className="w-4 h-4" />
                <span>Report Content</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <CreatorAnalyticsModal
          postId={post._id}
          isOpen={showAnalytics}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {/* Report Modal */}
      {showReport && (
        <ReportModal
          postId={post._id}
          isOpen={showReport}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
