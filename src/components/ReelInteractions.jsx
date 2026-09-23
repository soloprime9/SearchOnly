"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShareAlt,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import { Plus, Repeat2, Check } from "lucide-react";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import { triggerHeartBurst } from "@/utils/confetti";

const API_BASE = "https://backend-k.vercel.app";
const safeArray = (v) => (Array.isArray(v) ? v : []);

function formatCount(num) {
  const n = Number(num) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export default function ReelInteractions({ post, updatePost }) {
  const [data, setData] = useState({
    ...post,
    likes: safeArray(post?.likes),
    comments: safeArray(post?.comments),
  });

  const [userId, setUserId] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [replyText, setReplyText] = useState({});
  const [activeReply, setActiveReply] = useState(null);
  const [isFollowingCreator, setIsFollowingCreator] = useState(false);
  const [repostCount, setRepostCount] = useState(post?.repostsCount || 0);
  const [hasReposted, setHasReposted] = useState(false);

  // Sync with parent updates
  useEffect(() => {
    setData({
      ...post,
      likes: safeArray(post?.likes),
      comments: safeArray(post?.comments),
    });
    setRepostCount(post?.repostsCount || 0);
  }, [post]);

  // Get logged user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = jwt.decode(token);
    if (decoded?.UserId) setUserId(String(decoded.UserId));
  }, []);

  const syncParent = useCallback(
    (updated) => {
      setData(updated);
      if (updatePost) updatePost(updated);
    },
    [updatePost]
  );

  const hasLiked = (likes) =>
    userId && safeArray(likes).some((id) => String(id) === userId);

  // ===== LIKE POST =====
  const handleLike = async (e) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to like this short");
      return;
    }

    playPop();
    const alreadyLiked = hasLiked(data.likes);
    if (!alreadyLiked && e && e.clientX && e.clientY) {
      triggerHeartBurst(e.clientX, e.clientY);
    } else if (!alreadyLiked) {
      triggerHeartBurst();
    }

    try {
      const res = await axios.post(
        `${API_BASE}/post/like/${data._id}`,
        {},
        { headers: { "x-auth-token": token } }
      );

      syncParent({
        ...data,
        likes: safeArray(res.data.likes),
      });
    } catch (_) {}
  };

  // ===== FOLLOW CREATOR =====
  const handleFollowCreator = async () => {
    const token = localStorage.getItem("token");
    const creatorId = data.userId?._id || data.userId;
    if (!token || !creatorId) {
      toast.error("Please login to follow");
      return;
    }

    playPop();
    setIsFollowingCreator(true);
    toast.success(`Following @${data.userId?.username || "creator"}! ✨`);

    try {
      await axios.post(
        `${API_BASE}/user/follow/${creatorId}`,
        {},
        { headers: { "x-auth-token": token } }
      );
    } catch (_) {}
  };

  // ===== REPOST =====
  const handleRepost = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to repost");
      return;
    }

    playPop();
    const nextReposted = !hasReposted;
    setHasReposted(nextReposted);
    setRepostCount((prev) => (nextReposted ? prev + 1 : Math.max(0, prev - 1)));
    toast.success(nextReposted ? "Reposted to your followers! 🔁" : "Removed repost");

    try {
      await axios.post(
        `${API_BASE}/post/repost/${data._id}`,
        {},
        { headers: { "x-auth-token": token } }
      );
    } catch (_) {}
  };

  // ===== ADD COMMENT =====
  const handleComment = async () => {
    if (!comment.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.post(
      `${API_BASE}/post/comment/${data._id}`,
      { CommentText: comment },
      { headers: { "x-auth-token": token } }
    );

    syncParent({
      ...data,
      comments: safeArray(res.data.comments),
    });

    setComment("");
  };

  // ===== LIKE COMMENT =====
  const handleCommentLike = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.post(
      `${API_BASE}/post/comment/${data._id}/like/${commentId}`,
      {},
      { headers: { "x-auth-token": token } }
    );

    const updated = {
      ...data,
      comments: data.comments.map((c) =>
        c._id === commentId
          ? {
              ...c,
              likes: res.data.liked
                ? [...safeArray(c.likes), userId]
                : safeArray(c.likes).filter((id) => String(id) !== userId),
            }
          : c
      ),
    };

    syncParent(updated);
  };

  // ===== ADD REPLY =====
  const submitReply = async (commentId) => {
    if (!replyText[commentId]?.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.post(
      `${API_BASE}/post/comment/${data._id}/reply/${commentId}`,
      { replyText: replyText[commentId] },
      { headers: { "x-auth-token": token } }
    );

    const updated = {
      ...data,
      comments: data.comments.map((c) =>
        c._id === commentId
          ? { ...c, replies: safeArray(res.data) }
          : c
      ),
    };

    syncParent(updated);
    setReplyText((r) => ({ ...r, [commentId]: "" }));
    setActiveReply(null);
  };

  // ===== LIKE REPLY =====
  const handleReplyLike = async (commentId, replyId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.post(
      `${API_BASE}/post/comment/${data._id}/like-reply/${commentId}/${replyId}`,
      {},
      { headers: { "x-auth-token": token } }
    );

    const updated = {
      ...data,
      comments: data.comments.map((c) =>
        c._id === commentId
          ? {
              ...c,
              replies: safeArray(c.replies).map((r) =>
                r._id === replyId
                  ? {
                      ...r,
                      likes: res.data.liked
                        ? [...safeArray(r.likes), userId]
                        : safeArray(r.likes).filter(
                            (id) => String(id) !== userId
                          ),
                    }
                  : r
              ),
            }
          : c
      ),
    };

    syncParent(updated);
  };

  const handleShare = async () => {
    playTap();
    const url = `${window.location.origin}/short/${data._id}`;
    await navigator.clipboard.writeText(url);
    toast.success("Short video link copied to clipboard! 📋");
  };

  return (
    <>
      <div className="absolute right-3.5 bottom-20 flex flex-col items-center gap-5 text-white z-30 select-none">
        {/* Creator Avatar with Follow Plus Badge */}
        {data.userId && (
          <div className="relative mb-1">
            <Link
              href={`/profile/${data.userId?.username || ""}`}
              onClick={(e) => e.stopPropagation()}
              className="block w-11 h-11 rounded-full border-2 border-white overflow-hidden shadow-lg hover:scale-105 transition-transform bg-zinc-900"
            >
              <img
                src={data.userId?.profilePicture || data.userId?.avatar || "/Fondpeace.jpg"}
                alt={data.userId?.username || "creator"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/Fondpeace.jpg";
                }}
              />
            </Link>
            {!isFollowingCreator && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollowCreator();
                }}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
                title="Follow Creator"
              >
                <Plus size={12} className="stroke-[3]" />
              </button>
            )}
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLike(e);
          }}
          className="flex flex-col items-center group active:scale-125 transition-transform cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-black/60 transition-colors border border-white/10">
            {hasLiked(data.likes) ? (
              <FaHeart className="text-red-500 text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            ) : (
              <FaRegHeart className="text-2xl text-white drop-shadow-md" />
            )}
          </div>
          <p className="text-[11px] font-bold mt-1 text-white drop-shadow-md">
            {formatCount(safeArray(data.likes).length)}
          </p>
        </button>

        {/* Comment Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            playTap();
            setShowComments(true);
          }}
          className="flex flex-col items-center group active:scale-125 transition-transform cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-black/60 transition-colors border border-white/10">
            <FaCommentDots className="text-2xl text-white drop-shadow-md" />
          </div>
          <p className="text-[11px] font-bold mt-1 text-white drop-shadow-md">
            {formatCount(safeArray(data.comments).length)}
          </p>
        </button>

        {/* 1-Click Viral Repost */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRepost();
          }}
          className="flex flex-col items-center group active:scale-125 transition-transform cursor-pointer"
          title="Repost to Followers"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-black/60 transition-colors border border-white/10">
            <Repeat2 size={22} className={hasReposted ? "text-emerald-400" : "text-white"} />
          </div>
          <p className="text-[11px] font-bold mt-1 text-white drop-shadow-md">
            {formatCount(repostCount)}
          </p>
        </button>

        {/* Share Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="flex flex-col items-center group active:scale-125 transition-transform cursor-pointer"
          title="Share Link"
        >
          <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-black/60 transition-colors border border-white/10">
            <FaShareAlt className="text-xl text-white drop-shadow-md" />
          </div>
          <p className="text-[11px] font-bold mt-1 text-white drop-shadow-md">Share</p>
        </button>

        {/* Rotating Vinyl Audio Disc with Soundwaves */}
        <div className="relative mt-2 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-900 via-black to-zinc-800 border-2 border-zinc-700/80 p-1 flex items-center justify-center animate-[spin_4s_linear_infinite] shadow-xl">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white font-bold">
              ♪
            </div>
          </div>
          {/* Animated soundwaves bars */}
          <div className="flex items-center gap-0.5 mt-1.5">
            <span className="w-0.5 h-2 bg-white/80 rounded-full animate-pulse" />
            <span className="w-0.5 h-3 bg-cyan-400 rounded-full animate-pulse delay-75" />
            <span className="w-0.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-150" />
            <span className="w-0.5 h-2.5 bg-indigo-400 rounded-full animate-pulse delay-100" />
          </div>
        </div>
      </div>

      {showComments && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center animate-in fade-in duration-200">
          <div className="bg-[#0e111a] text-white w-full md:max-w-md h-[75vh] rounded-t-3xl md:rounded-3xl p-5 overflow-y-auto relative border border-white/10 shadow-2xl">
            <button
              onClick={() => setShowComments(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>Comments</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {safeArray(data.comments).length}
              </span>
            </h2>

            <div className="flex gap-2 mb-5">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-white/[0.06] border border-white/10 text-white placeholder-gray-400 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleComment}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                Post
              </button>
            </div>

            <div className="space-y-3.5">
              {safeArray(data.comments).map((cmt) => (
                <div key={cmt._id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <p className="font-bold text-xs text-blue-400">
                    @{cmt.userId?.username || "creator"}
                  </p>
                  <p className="text-xs text-gray-200 mt-1 leading-relaxed">{cmt.CommentText}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
