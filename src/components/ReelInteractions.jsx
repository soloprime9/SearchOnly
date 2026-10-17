"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";
import Link from "next/link";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShareAlt,
  FaTimes,
  FaBookmark,
  FaRegBookmark,
  FaWhatsapp,
  FaTwitter,
} from "react-icons/fa";
import { Plus, Repeat2, Check, Bookmark, Share2, Copy } from "lucide-react";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import { triggerHeartBurst } from "@/utils/confetti";
import { getApiBase } from "@/utils/apiConfig";

const API_BASE = getApiBase();
const safeArray = (v) => (Array.isArray(v) ? v : []);

function formatCount(num) {
  if (Array.isArray(num)) return formatCount(num.length);
  const n = Number(num);
  if (isNaN(n) || n <= 0) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

const QUICK_EMOJIS = ["❤️", "🔥", "😂", "👏", "💯", "✨", "🙌", "😍"];

export default function ReelInteractions({ post, updatePost }) {
  const [data, setData] = useState({
    ...post,
    likes: safeArray(post?.likes),
    comments: safeArray(post?.comments),
  });

  const [userId, setUserId] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [comment, setComment] = useState("");
  const [replyTextMap, setReplyTextMap] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [isFollowingCreator, setIsFollowingCreator] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [repostCount, setRepostCount] = useState(post?.repostsCount || 0);
  const [hasReposted, setHasReposted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync with parent updates
  useEffect(() => {
    setData({
      ...post,
      likes: safeArray(post?.likes),
      comments: safeArray(post?.comments),
    });
    setRepostCount(post?.repostsCount || 0);
  }, [post]);

  // Decode logged user from token
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    try {
      const decoded = jwt.decode(token);
      if (decoded?.UserId || decoded?.id) {
        setUserId(String(decoded.UserId || decoded.id));
      }
    } catch (_) {}
  }, []);

  // Real-time live synchronization for Likes, Comments, and Follows
  useEffect(() => {
    if (typeof window === "undefined" || !data._id) return;
    let socket = null;
    try {
      socket = io(API_BASE, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socket.on("post_like_update", (payload) => {
        if (payload && String(payload.postId) === String(data._id)) {
          setData((prev) => {
            const nextLikes = Array.isArray(payload.likes) ? payload.likes : prev.likes;
            const updated = { ...prev, likes: nextLikes };
            if (updatePost) updatePost(updated);
            return updated;
          });
        }
      });

      socket.on("post_comment_update", (payload) => {
        if (payload && String(payload.postId) === String(data._id) && payload.comment) {
          setData((prev) => {
            const prevComments = safeArray(prev.comments);
            const exists = prevComments.some(
              (c) => String(c._id) === String(payload.comment._id)
            );
            if (exists) return prev;
            const updated = {
              ...prev,
              comments: [...prevComments, payload.comment],
            };
            if (updatePost) updatePost(updated);
            return updated;
          });
        }
      });

      socket.on("user_follow_update", (payload) => {
        const currentCreatorId = String(data.userId?._id || data.userId || "");
        if (payload && String(payload.targetUserId) === currentCreatorId) {
          if (userId && payload.followerUserId === userId) {
            setIsFollowingCreator(Boolean(payload.isFollowing));
          }
        }
      });
    } catch (err) {
      console.error("Socket connection error in ReelInteractions:", err);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [data._id, userId, updatePost]);

  const syncParent = useCallback(
    (updated) => {
      setData(updated);
      if (updatePost) updatePost(updated);
    },
    [updatePost]
  );

  const hasLiked = (likes) =>
    userId && safeArray(likes).some((id) => String(id?._id || id) === userId);

  // ===== LIKE POST (⚡ 0ms Optimistic Update) =====
  const handleLike = async (e) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please login to like this short");
      return;
    }

    playPop();
    const currentLikes = safeArray(data.likes);
    const alreadyLiked = hasLiked(currentLikes);
    const activeUserId = userId || "me";

    if (!alreadyLiked) {
      if (e && e.clientX && e.clientY) {
        triggerHeartBurst(e.clientX, e.clientY);
      } else {
        triggerHeartBurst();
      }
    }

    // ⚡ Optimistic toggle (0ms perceived latency)
    const nextLikes = alreadyLiked
      ? currentLikes.filter((id) => String(id?._id || id) !== activeUserId)
      : [...currentLikes, activeUserId];

    syncParent({ ...data, likes: nextLikes });

    try {
      const res = await axios.post(
        `${API_BASE}/post/like/${data._id}`,
        {},
        { headers: { "x-auth-token": token } }
      );

      if (res.data?.likes) {
        syncParent({
          ...data,
          likes: safeArray(res.data.likes),
        });
      }
    } catch (_) {
      syncParent({ ...data, likes: currentLikes });
      toast.error("Could not update like");
    }
  };

  // ===== TOGGLE BOOKMARK (⚡ 0ms Optimistic Update) =====
  const handleBookmark = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please login to save bookmarks");
      return;
    }

    playChime();
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    toast.success(nextBookmarked ? "Saved to Bookmarks! 🔖" : "Removed from Bookmarks");

    try {
      await axios.post(
        `${API_BASE}/post/bookmark/${data._id}`,
        {},
        { headers: { "x-auth-token": token } }
      );
    } catch (_) {
      setIsBookmarked(!nextBookmarked);
      toast.error("Failed to update bookmark");
    }
  };

  // ===== FOLLOW CREATOR (⚡ 0ms Optimistic Update) =====
  const handleFollowCreator = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const creatorId = data.userId?._id || data.userId;
    if (!token || !creatorId) {
      toast.error("Please login to follow creators");
      return;
    }

    playPop();
    const prevFollowing = isFollowingCreator;
    setIsFollowingCreator(true);
    toast.success(`Following @${data.userId?.username || "creator"}! ✨`);

    try {
      const res = await axios.post(
        `${API_BASE}/user/follow/${creatorId}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      if (res.data?.isFollowing !== undefined) {
        setIsFollowingCreator(res.data.isFollowing);
      }
    } catch (_) {
      setIsFollowingCreator(prevFollowing);
      toast.error("Failed to follow creator");
    }
  };

  // ===== REPOST =====
  const handleRepost = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please login to post comments");
      return;
    }

    playTap();
    try {
      const res = await axios.post(
        `${API_BASE}/post/comment/${data._id}`,
        { CommentText: comment, userId },
        { headers: { "x-auth-token": token } }
      );

      syncParent({
        ...data,
        comments: safeArray(res.data.comments),
      });
      setComment("");
      toast.success("Comment posted!");
    } catch (_) {
      toast.error("Failed to post comment");
    }
  };

  // ===== ADD REPLY =====
  const handleReply = async (commentId) => {
    const text = replyTextMap[commentId]?.trim();
    if (!text) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please login to reply");
      return;
    }

    playTap();
    try {
      const res = await axios.post(
        `${API_BASE}/post/comment/reply/${data._id}/${commentId}`,
        { replyText: text, userId },
        { headers: { "x-auth-token": token } }
      );

      if (res.data?.comments) {
        syncParent({
          ...data,
          comments: safeArray(res.data.comments),
        });
      }
      setReplyTextMap((prev) => ({ ...prev, [commentId]: "" }));
      setActiveReplyId(null);
      toast.success("Reply added!");
    } catch (_) {
      toast.error("Failed to reply");
    }
  };

  // ===== SHARE HANDLER =====
  const handleShare = async () => {
    playTap();
    const url = `${typeof window !== "undefined" ? window.location.origin : "https://www.fondpeace.com"}/shorts/${data._id}`;
    const shareData = {
      title: data.title || "FondPeace Short",
      text: `Watch this short on FondPeace: ${data.title || ""}`,
      url,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (_) {}
    }

    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    playPop();
    const url = `${window.location.origin}/shorts/${data._id}`;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Link copied to clipboard! 📋");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : "https://www.fondpeace.com"}/shorts/${data._id}`;

  return (
    <>
      {/* ── Vertical Floating Actions Column ── */}
      <div className="absolute right-3 sm:right-4 bottom-24 flex flex-col items-center gap-4 text-white z-30 select-none">
        {/* Creator Avatar with Quick Follow Plus Badge */}
        {data.userId && (
          <div className="relative mb-1">
            <Link
              href={`/profile/${data.userId?.username || ""}`}
              onClick={(e) => e.stopPropagation()}
              className="block w-11 h-11 rounded-full border-2 border-white overflow-hidden shadow-xl hover:scale-105 transition-transform bg-zinc-900"
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
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg active:scale-75 transition-all cursor-pointer ring-2 ring-black"
                title="Follow Creator"
              >
                <Plus size={11} className="stroke-[3]" />
              </button>
            )}
            {isFollowingCreator && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-black pointer-events-none">
                <Check size={10} className="stroke-[3]" />
              </div>
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
          title="Like"
        >
          <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center group-hover:bg-black/65 transition-colors border border-white/10 shadow-lg">
            {hasLiked(data.likes) ? (
              <FaHeart className="text-red-500 text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] scale-110" />
            ) : (
              <FaRegHeart className="text-2xl text-white drop-shadow-md group-hover:text-red-400 transition-colors" />
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
          title="Comments"
        >
          <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center group-hover:bg-black/65 transition-colors border border-white/10 shadow-lg">
            <FaCommentDots className="text-2xl text-white drop-shadow-md group-hover:text-blue-400 transition-colors" />
          </div>
          <p className="text-[11px] font-bold mt-1 text-white drop-shadow-md">
            {formatCount(safeArray(data.comments).length)}
          </p>
        </button>

        {/* Bookmark / Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleBookmark();
          }}
          className="flex flex-col items-center group active:scale-125 transition-transform cursor-pointer"
          title={isBookmarked ? "Saved" : "Save Bookmark"}
        >
          <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center group-hover:bg-black/65 transition-colors border border-white/10 shadow-lg">
            {isBookmarked ? (
              <FaBookmark className="text-amber-400 text-xl drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            ) : (
              <FaRegBookmark className="text-xl text-white drop-shadow-md group-hover:text-amber-300 transition-colors" />
            )}
          </div>
          <p className="text-[11px] font-bold mt-1 text-white drop-shadow-md">
            {isBookmarked ? "Saved" : "Save"}
          </p>
        </button>

        {/* Repost Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRepost();
          }}
          className="flex flex-col items-center group active:scale-125 transition-transform cursor-pointer"
          title="Repost"
        >
          <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center group-hover:bg-black/65 transition-colors border border-white/10 shadow-lg">
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
          title="Share"
        >
          <div className="w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center group-hover:bg-black/65 transition-colors border border-white/10 shadow-lg">
            <FaShareAlt className="text-xl text-white drop-shadow-md group-hover:text-cyan-400 transition-colors" />
          </div>
          <p className="text-[11px] font-bold mt-1 text-white drop-shadow-md">Share</p>
        </button>

        {/* Rotating Vinyl Record Animation */}
        <div className="relative mt-1 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-900 via-black to-zinc-800 border-2 border-zinc-700/80 p-1 flex items-center justify-center animate-[spin_4s_linear_infinite] shadow-xl">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-[7px] text-white font-bold">
              ♪
            </div>
          </div>
          <div className="flex items-center gap-0.5 mt-1.5">
            <span className="w-0.5 h-2 bg-white/80 rounded-full animate-pulse" />
            <span className="w-0.5 h-3 bg-cyan-400 rounded-full animate-pulse delay-75" />
            <span className="w-0.5 h-1.5 bg-rose-400 rounded-full animate-pulse delay-150" />
            <span className="w-0.5 h-2.5 bg-indigo-400 rounded-full animate-pulse delay-100" />
          </div>
        </div>
      </div>

      {/* ── Comments Slide-Up Bottom Drawer ── */}
      {showComments && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-end justify-center animate-in fade-in duration-200"
          onClick={() => setShowComments(false)}
        >
          <div
            className="bg-[#0f121d] text-white w-full max-w-[480px] h-[75vh] max-h-[85vh] rounded-t-3xl p-4 sm:p-5 pb-24 sm:pb-6 flex flex-col relative border-t border-x border-white/15 shadow-2xl animate-in slide-in-from-bottom duration-300 z-[1001]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with drag indicator */}
            <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Comments</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {safeArray(data.comments).length}
                </span>
              </h2>
              <button
                onClick={() => setShowComments(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 custom-scrollbar">
              {safeArray(data.comments).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 py-10">
                  <p className="text-sm font-semibold">No comments yet</p>
                  <p className="text-xs text-zinc-500 mt-1">Be the first to share your perspective!</p>
                </div>
              ) : (
                safeArray(data.comments).map((cmt) => (
                  <div key={cmt._id || Math.random()} className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/10">
                          <img
                            src={cmt.userId?.profilePicture || cmt.userId?.profilePic || cmt.userId?.avatar || "/Fondpeace.jpg"}
                            alt={cmt.userId?.username || "user"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/Fondpeace.jpg";
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-zinc-100">
                            {cmt.userId?.name || cmt.userId?.username || "FondPeace User"}
                          </span>
                          <span className="text-[11px] text-blue-400">
                            @{cmt.userId?.username || "user"}
                          </span>
                          {cmt.userId?.isVerified && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Verified" />
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveReplyId(activeReplyId === cmt._id ? null : cmt._id)}
                        className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">{cmt.CommentText}</p>

                    {/* Replies */}
                    {safeArray(cmt.replies).length > 0 && (
                      <div className="pl-3 mt-2 border-l-2 border-white/10 space-y-1.5">
                        {safeArray(cmt.replies).map((rep) => (
                          <div key={rep._id || Math.random()} className="text-xs">
                            <span className="font-bold text-indigo-400">@{rep.userId?.username || "user"}: </span>
                            <span className="text-zinc-300">{rep.replyText}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Reply Composer */}
                    {activeReplyId === cmt._id && (
                      <div className="flex gap-1.5 mt-2 pt-2 border-t border-white/10">
                        <input
                          type="text"
                          value={replyTextMap[cmt._id] || ""}
                          onChange={(e) =>
                            setReplyTextMap((p) => ({ ...p, [cmt._id]: e.target.value }))
                          }
                          placeholder={`Reply to @${cmt.userId?.username || "user"}...`}
                          className="flex-1 bg-white/[0.08] text-white text-xs px-2.5 py-1.5 rounded-lg outline-none border border-white/10"
                        />
                        <button
                          onClick={() => handleReply(cmt._id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quick Reactions Bar */}
            <div className="flex items-center justify-between gap-1 pt-2 pb-2 overflow-x-auto no-scrollbar">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setComment((prev) => prev + emoji)}
                  className="text-base p-1.5 rounded-lg hover:bg-white/10 transition active:scale-90 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Comment Composer Input (Elevated above floating dock) */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10 mb-6 sm:mb-1">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleComment();
                }}
                placeholder="Add a comment..."
                className="flex-1 bg-white/[0.08] border border-white/15 text-white placeholder-gray-400 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleComment}
                disabled={!comment.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Share Bottom Sheet Modal ── */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-[#0f121d] text-white w-full max-w-[440px] rounded-t-3xl p-5 border-t border-x border-white/15 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-sm">Share this Short</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-full bg-white/10 text-gray-300 hover:text-white"
              >
                <FaTimes size={13} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this short on FondPeace: ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition text-xs font-semibold"
              >
                <FaWhatsapp size={22} className="text-emerald-400" />
                <span>WhatsApp</span>
              </a>

              {/* Twitter / X */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this short on @FondPeace:`)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 transition text-xs font-semibold"
              >
                <FaTwitter size={20} className="text-cyan-400" />
                <span>Twitter / X</span>
              </a>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 transition text-xs font-semibold cursor-pointer"
              >
                {copiedLink ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
                <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-between text-xs text-zinc-300">
              <span className="truncate pr-2 select-all">{shareUrl}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shrink-0 transition"
              >
                {copiedLink ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
