"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import jwt from "jsonwebtoken";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import { triggerHeartBurst } from "@/utils/confetti";
import { toast } from "@/utils/toast";
import PollCard from "./PollCard";
import LinkPreviewCard from "./LinkPreviewCard";
import PostActionsMenu from "./PostActionsMenu";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShareAlt,
  FaEye,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { Pin, Sparkles, Repeat2, Bookmark, Quote, ShieldCheck, MapPin, Film, Image as ImageIcon } from "lucide-react";

/* ================= UTILS ================= */
const safeArray = (v) => (Array.isArray(v) ? v : []);
const API_BASE = getApiBase();

function renderFormattedCaption(text) {
  if (!text) return null;
  const tokenRegex = /(https?:\/\/[^\s]+|#[\w\u0590-\u05ff]+|@\w+)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("#")) {
      return (
        <a
          key={i}
          href={`/searchbro?q=${encodeURIComponent(part.replace(/^#+/, ""))}`}
          className="text-blue-500 dark:text-blue-400 font-bold hover:underline inline mr-1"
        >
          {part}
        </a>
      );
    }
    if (part.startsWith("@")) {
      const handle = part.slice(1);
      return (
        <Link
          key={i}
          href={`/profile/${handle}`}
          className="text-indigo-500 dark:text-indigo-400 font-bold hover:underline inline mr-1"
        >
          {part}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function getCleanCaptionText(rawTitle, preview) {
  if (!rawTitle) return "";
  let t = rawTitle.trim();
  if (preview?.url) {
    const previewUrl = preview.url.trim();
    const normT = t.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
    const normUrl = previewUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
    if (normT === normUrl) return "";
    t = t.replace(new RegExp(`https?://\\S+`, "gi"), (match) => {
      const normMatch = match.replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
      return normMatch === normUrl ? "" : match;
    }).trim();
  }
  return t;
}

export default function SinglePostInteractions({ initialPost }) {
  const [post, setPost] = useState({
    ...initialPost,
    likes: safeArray(initialPost?.likes),
    comments: safeArray(initialPost?.comments),
  });

  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(true);
  const [userId, setUserId] = useState(null);
  const [activeReply, setActiveReply] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [repostCount, setRepostCount] = useState(initialPost?.repostsCount || 0);
  const router = useRouter();

  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const singleVideoRef = useRef(null);

  useEffect(() => {
    try {
      const storedMute = localStorage.getItem("fondpeace_global_muted");
      if (storedMute !== null) {
        setIsGlobalMuted(storedMute === "true");
      }
    } catch (_) {}

    const handleGlobalMuteSync = (e) => {
      if (typeof e.detail?.isMuted === "boolean") {
        setIsGlobalMuted(e.detail.isMuted);
        if (singleVideoRef.current) {
          singleVideoRef.current.muted = e.detail.isMuted;
        }
      }
    };
    window.addEventListener("fondpeace_mute_changed", handleGlobalMuteSync);
    return () => window.removeEventListener("fondpeace_mute_changed", handleGlobalMuteSync);
  }, []);

  const toggleGlobalMute = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextMuted = !isGlobalMuted;
    setIsGlobalMuted(nextMuted);
    try {
      localStorage.setItem("fondpeace_global_muted", String(nextMuted));
    } catch (_) {}
    if (singleVideoRef.current) {
      singleVideoRef.current.muted = nextMuted;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("fondpeace_mute_changed", { detail: { isMuted: nextMuted } })
      );
    }
    playTap();
    toast.success(nextMuted ? "Sound muted 🔇" : "Sound unmuted 🔊", {
      duration: 1500,
      id: "single-mute-toast"
    });
  };

  const handleRepost = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return toast.error("Please log in to repost");

    playPop();
    setRepostCount((prev) => prev + 1);
    toast.success("Reposted to your followers! 🔁");

    try {
      await axios.post(
        `${API_BASE}/post/repost/${post._id}`,
        {},
        { headers: getAuthHeaders() }
      );
    } catch (_) {}
  };

  const handleBookmark = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return toast.error("Please log in to save bookmark");

    playChime();
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    toast.success(nextState ? "Saved to your bookmarks! 🔖" : "Removed from bookmarks");

    try {
      await axios.post(
        `${API_BASE}/post/bookmark/${post._id}`,
        {},
        { headers: getAuthHeaders() }
      );
    } catch (_) {
      setIsBookmarked(!nextState);
      toast.error("Failed to update bookmark");
    }
  };

  /* ================= AUTH ================= */
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    try {
      const decoded = jwt.decode(token);
      if (decoded?.UserId) setUserId(String(decoded.UserId));
      else if (decoded?.id) setUserId(String(decoded.id));
      else if (decoded?._id) setUserId(String(decoded._id));
    } catch {
      /* noop */
    }
  }, []);

  /* ================= TRACK POST VIEW ================= */
  useEffect(() => {
    const trackView = async () => {
      try {
        const postId = post?._id || window.location.pathname.split("/").pop();
        if (!postId) return;

        await fetch(`${API_BASE}/analytics/view/${postId}`, {
          method: "POST",
        });
      } catch (err) {
        console.error("Error tracking post view:", err);
      }
    };

    trackView();
  }, [post?._id]);

  /* ================= HELPERS ================= */
  const hasLikedPost = () =>
    !!userId &&
    safeArray(post.likes).some((id) => String(id?._id || id) === String(userId));

  const hasLikedComment = (likes) =>
    !!userId &&
    safeArray(likes).some((id) => String(id?._id || id) === String(userId));

  const hasLikedReply = (likes) =>
    !!userId &&
    safeArray(likes).some((id) => String(id?._id || id) === String(userId));

  /* ================= POST LIKE ================= */
  const handleLike = async (e) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return toast.error("Please log in to like this post");

    playPop();

    // Trigger heart burst particle animation at click location
    if (e && e.clientX && e.clientY) {
      triggerHeartBurst(e.clientX, e.clientY);
    } else {
      triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2);
    }

    // ⚡ Optimistic UI Update: Toggle like immediately (0ms perceived latency)
    const currentLikes = safeArray(post.likes);
    const wasLiked = currentLikes.some((id) => String(id?._id || id) === String(userId));
    const nextLikes = wasLiked
      ? currentLikes.filter((id) => String(id?._id || id) !== String(userId))
      : [...currentLikes, userId];

    setPost((p) => ({ ...p, likes: nextLikes }));

    try {
      const res = await axios.post(
        `${API_BASE}/post/like/${post._id}`,
        {},
        { headers: getAuthHeaders() }
      );

      if (res.data?.likes) {
        setPost((p) => ({
          ...p,
          likes: safeArray(res.data.likes),
        }));
      }
    } catch (err) {
      setPost((p) => ({ ...p, likes: currentLikes }));
      toast.error(err.response?.data?.message || "Failed to update like");
    }
  };

  /* ================= COMMENT (⚡ 0ms Optimistic Update) ================= */
  const handleComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return toast.error("Please log in to comment");

    playPop();
    setComment("");

    const tempComment = {
      _id: `temp_${Date.now()}`,
      CommentText: trimmed,
      userId: { _id: userId, username: "You", profilePicture: "/Fondpeace.jpg" },
      likes: [],
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setPost((p) => ({
      ...p,
      comments: [...safeArray(p.comments), tempComment],
    }));
    toast.success("Comment posted! 💬");

    try {
      const res = await axios.post(
        `${API_BASE}/post/comment/${post._id}`,
        { CommentText: trimmed, userId },
        { headers: getAuthHeaders() }
      );

      if (res.data?.comments) {
        setPost((p) => ({
          ...p,
          comments: safeArray(res.data.comments),
        }));
      }
    } catch (err) {
      setPost((p) => ({
        ...p,
        comments: safeArray(p.comments).filter((c) => c._id !== tempComment._id),
      }));
      toast.error(err.response?.data?.message || "Failed to post comment");
    }
  };

  /* ================= COMMENT LIKE (⚡ 0ms Optimistic Update) ================= */
  const handleCommentLike = async (commentId) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return toast.error("Please log in");

    playPop();

    const previousComments = post.comments;
    const targetComment = safeArray(post.comments).find((c) => c._id === commentId);
    const wasLiked = targetComment && safeArray(targetComment.likes).some((id) => String(id?._id || id) === String(userId));

    setPost((p) => ({
      ...p,
      comments: safeArray(p.comments).map((c) => {
        if (c._id !== commentId) return c;
        const currentLikes = safeArray(c.likes);
        const nextLikes = wasLiked
          ? currentLikes.filter((id) => String(id?._id || id) !== String(userId))
          : [...currentLikes, userId];
        return { ...c, likes: nextLikes };
      }),
    }));

    try {
      const res = await axios.post(
        `${API_BASE}/post/comment/like/${post._id}/${commentId}`,
        {},
        { headers: getAuthHeaders() }
      );

      if (res.data?.comments) {
        setPost((p) => ({ ...p, comments: safeArray(res.data.comments) }));
      }
    } catch (err) {
      setPost((p) => ({ ...p, comments: previousComments }));
      toast.error("Failed to like comment");
    }
  };

  /* ================= REPLY ================= */
  const submitReply = async (commentId) => {
    const text = replyText[commentId];
    if (!text || !text.trim()) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return toast.error("Please log in to reply");

    playTap();
    try {
      const res = await axios.post(
        `${API_BASE}/post/comment/reply/${post._id}/${commentId}`,
        { replyText: text, userId },
        { headers: getAuthHeaders() }
      );

      setPost((p) => ({
        ...p,
        comments: p.comments.map((c) =>
          c._id === commentId
            ? { ...c, replies: safeArray(res.data.replies) }
            : c
        ),
      }));

      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      setActiveReply(null);
      playChime();
      toast.success("Reply added");
    } catch (err) {
      toast.error("Failed to reply");
    }
  };

  /* ================= REPLY LIKE ================= */
  const handleReplyLike = async (commentId, replyId) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return toast.error("Please log in");

    playPop();
    try {
      const res = await axios.post(
        `${API_BASE}/post/comment/reply/like/${post._id}/${commentId}/${replyId}`,
        {},
        { headers: getAuthHeaders() }
      );

      setPost((p) => ({
        ...p,
        comments: p.comments.map((c) =>
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
                              (id) => String(id?._id || id) !== String(userId)
                            ),
                      }
                    : r
                ),
              }
            : c
        ),
      }));
    } catch {
      /* noop */
    }
  };

  /* ================= SHARE ================= */
  const handleShare = async () => {
    playTap();
    try {
      const url = `${window.location.origin}/post/${post._id}`;
      if (navigator.share) {
        await navigator.share({
          title: post.title || "FondPeace Post",
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(`${post.title}\n${url}`);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      const url = `${window.location.origin}/post/${post._id}`;
      await navigator.clipboard.writeText(`${post.title}\n${url}`);
      toast.success("Link copied to clipboard!");
    }
  };

  const title = post.title || "";
  const cleanCaption = post.linkPreview ? getCleanCaptionText(title, post.linkPreview) : title;
  const rawAuthorPic = post.userId?.profilePicture || post.userId?.profilePic || post.userId?.avatar;
  const hasAuthorPic = rawAuthorPic && rawAuthorPic !== "/Fondpeace.jpg" && rawAuthorPic.trim() !== "";
  const authorInitial = (post.userId?.username?.[0] || post.userId?.name?.[0] || "U").toUpperCase();

  const isVideo = Boolean(
    post.mediaType?.startsWith("video") ||
    post.mtype?.startsWith("video") ||
    (typeof post.media === "string" && (
      post.media.endsWith(".mp4") ||
      post.media.endsWith(".webm") ||
      post.media.includes("/video/")
    ))
  );

  const captionHashtags = (post.title || "").match(/#[\w\u0590-\u05ff]+/g) || [];
  const allPostTags = Array.from(
    new Set([
      ...(Array.isArray(post.tags) ? post.tags : []).map((t) => (t.startsWith("#") ? t : `#${t}`)),
      ...captionHashtags,
    ])
  );

  /* ================= UI: EXACT MATCH TO HOMEPAGE (Village.jsx) ================= */
  return (
    <article className="bg-[var(--bg-surface)] w-full mb-5 rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all">
      {/* 1. Pinned indicator */}
      {post.isPinned && (
        <div className="flex items-center gap-1.5 px-3.5 py-1 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border-b border-purple-500/15 text-[11px] font-bold text-purple-600 dark:text-purple-400">
          <Pin size={11} className="rotate-45 fill-purple-500 text-purple-500" />
          <span>Pinned by Creator</span>
        </div>
      )}

      {/* 2. HEADER - Clean, Story Ring, Verified Badge, Actions */}
      <div className="flex items-center justify-between p-3.5 h-[58px]">
        <div className="flex items-center gap-2.5">
          <Link href={`/profile/${post.userId?.username}`} className="relative group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600">
              <div className="bg-[var(--bg-surface)] p-[1.5px] rounded-full w-full h-full flex items-center justify-center overflow-hidden">
                {hasAuthorPic ? (
                  <img
                    src={rawAuthorPic}
                    alt={post.userId?.username || "creator"}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(post.userId?.username || "creator")}`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xs select-none">
                    {authorInitial}
                  </div>
                )}
              </div>
            </div>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Link href={`/profile/${post.userId?.username}`} className="text-sm font-bold text-[var(--text-primary)] leading-none hover:underline">
                {post.userId?.username || "Creator"}
              </Link>
              {post.userId?.isVerified && (
                <ShieldCheck size={14} className="text-blue-500 fill-blue-500/20 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5 font-medium">
              <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</span>
              {post.location && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-rose-500 font-semibold">{post.location}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <PostActionsMenu
            post={post}
            currentUserId={userId}
            isBookmarked={isBookmarked}
            onToggleBookmark={handleBookmark}
            onPinToggled={(isPinned) => setPost((p) => ({ ...p, isPinned }))}
          />
        </div>
      </div>

      {/* 3. MEDIA / EMBEDDED CONTENT SECTION - Exactly matching Village.jsx */}
      {post.media && !post.media.includes("youtube.com") && !post.media.includes("youtu.be") ? (
        <div className="relative w-full bg-black flex items-center justify-center overflow-hidden max-h-[560px] rounded-xl my-1 group">
          {isVideo ? (
            <>
              <video
                ref={singleVideoRef}
                src={post.media}
                controls
                autoPlay
                playsInline
                muted={isGlobalMuted}
                preload="metadata"
                onVolumeChange={(e) => {
                  const muted = e.target.muted;
                  if (muted !== isGlobalMuted) {
                    setIsGlobalMuted(muted);
                    try {
                      localStorage.setItem("fondpeace_global_muted", String(muted));
                    } catch (_) {}
                    window.dispatchEvent(
                      new CustomEvent("fondpeace_mute_changed", { detail: { isMuted: muted } })
                    );
                  }
                }}
                className="w-full max-h-[560px] object-contain block mx-auto shadow-2xl"
              />
              <button
                onClick={toggleGlobalMute}
                aria-label={isGlobalMuted ? "Unmute video" : "Mute video"}
                className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-90 border border-white/10 shadow-lg cursor-pointer"
                title={isGlobalMuted ? "Sound is muted (Click to unmute)" : "Sound is on (Click to mute)"}
              >
                {isGlobalMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
              </button>
            </>
          ) : (
            <img
              src={post.media}
              alt={post.title || "media"}
              className="w-full max-h-[560px] object-contain block mx-auto"
            />
          )}
        </div>
      ) : (post.linkPreview || (typeof post.media === "string" && (post.media.includes("youtube.com") || post.media.includes("youtu.be"))) || (typeof post.thumbnail === "string" && (post.thumbnail.includes("youtube.com") || post.thumbnail.includes("ytimg.com")))) ? (
        <div className="px-3 sm:px-4 my-1">
          <LinkPreviewCard 
            preview={{
              ...(post.linkPreview || {}),
              url: post.linkPreview?.url || (typeof post.media === "string" ? post.media : "") || "",
              image: post.linkPreview?.image || post.thumbnail || "",
              media: post.media || "",
              title: post.title || post.linkPreview?.title || ""
            }} 
            postId={post._id} 
            inFeed={false} 
            isGlobalMuted={isGlobalMuted}
            onToggleMute={toggleGlobalMute}
          />
        </div>
      ) : post.poll ? (
        <div className="px-3 sm:px-4 my-1">
          <PollCard
            postId={post._id}
            pollData={post.poll}
            currentUserId={userId}
            onVoteSuccess={(updatedPoll) => setPost((p) => ({ ...p, poll: updatedPoll }))}
          />
        </div>
      ) : (
        /* Modern Discussion / Thought Card (When no image or video is attached) */
        <div className="relative mx-3 my-1 p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-lg overflow-hidden border border-white/10">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <Quote className="absolute top-4 right-4 text-white/10 w-12 h-12 pointer-events-none rotate-12" />
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/20">
              <Sparkles size={11} className="text-blue-400" />
              {post.category || "Community Discussion"}
            </span>
          </div>
          <div className="text-base sm:text-lg font-medium leading-relaxed text-slate-100 whitespace-pre-wrap">
            {renderFormattedCaption(post.title)}
          </div>
        </div>
      )}

      {/* 4. INTERACTION & CONTENT AREA */}
      <div className="px-4 pt-3.5 pb-4">
        {/* Action Icons Bar */}
        <div className="flex items-center justify-between py-1 mb-2.5 border-b border-white/[0.05]">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95 group cursor-pointer"
              title="Like"
            >
              {hasLikedPost() ? (
                <FaHeart className="text-rose-500 text-[18px] drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
              ) : (
                <FaRegHeart className="text-[18px] group-hover:scale-110 transition-transform" />
              )}
              <span className={`text-xs font-semibold ${hasLikedPost() ? "text-rose-400 font-bold" : "text-gray-400"}`}>
                {safeArray(post.likes).length}
              </span>
            </button>

            <button
              onClick={() => { playPop(); setShowComments((p) => !p); }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all active:scale-95 group cursor-pointer"
              title="Comments"
            >
              <FaCommentDots className="text-[18px] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-gray-400">{safeArray(post.comments).length}</span>
            </button>

            <button
              onClick={handleRepost}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-95 group cursor-pointer"
              title="Repost"
            >
              <Repeat2 className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-gray-400">{repostCount}</span>
            </button>

            <button
              onClick={() => {
                playTap();
                const quote = `"${post.title}"\n\n— by @${post.userId?.username || 'Creator'} via FondPeace\nhttps://www.fondpeace.com/post/${post._id}`;
                navigator.clipboard.writeText(quote);
                toast.success("Quote copied with attribution! 📋");
              }}
              className="p-1.5 rounded-xl text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all active:scale-95 cursor-pointer"
              title="Copy Quote"
            >
              <Quote className="w-[17px] h-[17px]" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-xl transition-all active:scale-95 cursor-pointer ${isBookmarked ? "text-blue-400 bg-blue-500/10" : "text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"}`}
              title={isBookmarked ? "Saved" : "Save Bookmark"}
            >
              <Bookmark size={17} className={isBookmarked ? "fill-blue-500" : ""} />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-xl text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all active:scale-95 cursor-pointer"
              title="Share Post"
            >
              <FaShareAlt className="text-[16px]" />
            </button>

            <div className="flex items-center gap-1 text-gray-500 px-2 py-0.5 rounded-lg text-[11px] font-semibold">
              <FaEye size={12} className="opacity-70" />
              <span>{post.views || 0}</span>
            </div>
          </div>
        </div>

        {/* 5. Caption & Formatted Text */}
        {(post.media || post.linkPreview || post.poll) && cleanCaption && (
          <div className="text-sm text-[var(--text-primary)] leading-relaxed mb-3">
            <span className="font-bold mr-2 text-[var(--text-primary)] hover:underline cursor-pointer">
              {post.userId?.username}
            </span>
            <span className="whitespace-pre-wrap text-[var(--text-primary)]">
              {renderFormattedCaption(cleanCaption)}
            </span>
          </div>
        )}

        {/* 6. Clickable Topic Tags */}
        {allPostTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 pb-3">
            {allPostTags.map((t, idx) => (
              <a
                key={idx}
                href={`/searchbro?q=${encodeURIComponent(t.replace(/^#+/, ""))}`}
                className="text-xs text-blue-500 hover:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-medium transition-colors"
              >
                {t}
              </a>
            ))}
          </div>
        )}

        {/* 7. Full Discussion & Comments Section */}
        {showComments && (
          <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              Discussion ({safeArray(post.comments).length})
            </h3>
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
                placeholder="Add to the discussion..."
                className="flex-1 border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] px-3.5 py-2.5 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleComment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer"
              >
                Post
              </button>
            </div>

            {safeArray(post.comments).map((cmt) => (
              <div
                key={cmt._id}
                className="bg-[var(--bg-subtle)] p-3.5 rounded-2xl border border-[var(--border-subtle)]"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-xs text-[var(--text-primary)]">
                    @{cmt.userId?.username || "user"}
                  </p>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {cmt.createdAt ? new Date(cmt.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-primary)] mt-1 leading-relaxed">
                  {cmt.CommentText}
                </p>

                <div className="flex items-center gap-4 mt-2.5">
                  <button
                    onClick={() => handleCommentLike(cmt._id)}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    {hasLikedComment(cmt.likes) ? (
                      <FaHeart className="text-rose-600" />
                    ) : (
                      <FaRegHeart />
                    )}
                    <span>{safeArray(cmt.likes).length}</span>
                  </button>

                  <button
                    onClick={() => {
                      playTap();
                      setActiveReply(activeReply === cmt._id ? null : cmt._id);
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Reply
                  </button>
                </div>

                {activeReply === cmt._id && (
                  <div className="flex gap-2 mt-3 pl-2 border-l-2 border-blue-500">
                    <input
                      value={replyText[cmt._id] || ""}
                      onChange={(e) =>
                        setReplyText({
                          ...replyText,
                          [cmt._id]: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          submitReply(cmt._id);
                        }
                      }}
                      placeholder="Write a reply..."
                      className="flex-1 border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs outline-none"
                    />
                    <button
                      onClick={() => submitReply(cmt._id)}
                      className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Reply
                    </button>
                  </div>
                )}

                {/* Nested Replies */}
                {safeArray(cmt.replies).length > 0 && (
                  <div className="ml-4 mt-3 space-y-2 border-l-2 border-black/[0.06] dark:border-white/[0.08] pl-3">
                    {safeArray(cmt.replies).map((rep) => (
                      <div
                        key={rep._id}
                        className="bg-white dark:bg-gray-950 p-2.5 rounded-xl border border-black/[0.04] dark:border-white/[0.06]"
                      >
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          @{rep.userId?.username || "user"}
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                          {rep.replyText}
                        </p>

                        <button
                          onClick={() => handleReplyLike(cmt._id, rep._id)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-rose-500 mt-1 cursor-pointer"
                        >
                          {hasLikedReply(rep.likes) ? (
                            <FaHeart className="text-rose-600" />
                          ) : (
                            <FaRegHeart />
                          )}
                          <span>{safeArray(rep.likes).length}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
