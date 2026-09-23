"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "react-icons/fa";
import { Pin, Sparkles, Repeat2, Bookmark, Quote } from "lucide-react";

/* ================= UTILS ================= */
const safeArray = (v) => (Array.isArray(v) ? v : []);
const API_BASE = getApiBase();

export default function SinglePostInteractions({ initialPost }) {
  const [post, setPost] = useState({
    ...initialPost,
    likes: safeArray(initialPost?.likes),
    comments: safeArray(initialPost?.comments),
  });

  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeReply, setActiveReply] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [repostCount, setRepostCount] = useState(initialPost?.repostsCount || 0);
  const router = useRouter();

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
    } catch (_) {}
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

    try {
      const res = await axios.post(
        `${API_BASE}/post/like/${post._id}`,
        {},
        { headers: getAuthHeaders() }
      );

      setPost((p) => ({
        ...p,
        likes: safeArray(res.data.likes),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update like");
    }
  };

  /* ================= COMMENT ================= */
  const handleComment = async () => {
    if (!comment.trim()) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return toast.error("Please log in to comment");

    playTap();
    try {
      const res = await axios.post(
        `${API_BASE}/post/comment/${post._id}`,
        { CommentText: comment, userId },
        { headers: getAuthHeaders() }
      );

      setPost((p) => ({
        ...p,
        comments: safeArray(res.data.comments),
      }));
      setComment("");
      playChime();
      toast.success("Comment posted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    }
  };

  /* ================= COMMENT LIKE ================= */
  const handleCommentLike = async (commentId) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return toast.error("Please log in");

    playPop();
    try {
      const res = await axios.post(
        `${API_BASE}/post/comment/like/${post._id}/${commentId}`,
        {},
        { headers: getAuthHeaders() }
      );

      setPost((p) => ({
        ...p,
        comments: p.comments.map((c) =>
          c._id === commentId
            ? {
                ...c,
                likes: res.data.liked
                  ? [...safeArray(c.likes), userId]
                  : safeArray(c.likes).filter(
                      (id) => String(id?._id || id) !== String(userId)
                    ),
              }
            : c
        ),
      }));
    } catch (err) {
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

  /* ================= UI ================= */
  return (
    <div className="mt-4">
      {/* 📌 TOP POST BADGE & ACTIONS BAR */}
      <div className="flex items-center justify-between mb-3">
        <div>
          {post.isPinned && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20 shadow-xs animate-in fade-in">
              <Pin className="w-3.5 h-3.5 fill-blue-500" />
              <span>Pinned by creator</span>
            </div>
          )}
        </div>

        {/* 3-Dots Menu */}
        <PostActionsMenu
          post={post}
          currentUserId={userId}
          onPinToggled={(pinned) => setPost((p) => ({ ...p, isPinned: pinned }))}
          onMuted={() => toast.success("Author muted")}
        />
      </div>

      {/* 📊 INTERACTIVE POLL (If attached to post) */}
      {post.poll && (
        <PollCard
          postId={post._id}
          pollData={post.poll}
          currentUserId={userId}
          onVoteSuccess={(updatedPoll) =>
            setPost((p) => ({ ...p, poll: updatedPoll }))
          }
        />
      )}

      {/* 🔗 RICH LINK PREVIEW (If attached to post) */}
      {post.linkPreview && <LinkPreviewCard preview={post.linkPreview} />}

      {/* ⚡ ACTION BAR */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-black/[0.05] dark:border-white/[0.08] shadow-xs">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex gap-1.5 items-center text-sm font-semibold transition-transform active:scale-90 cursor-pointer ${
              hasLikedPost()
                ? "text-rose-600 dark:text-rose-400"
                : "text-gray-600 dark:text-gray-300 hover:text-rose-500"
            }`}
          >
            {hasLikedPost() ? (
              <FaHeart className="text-rose-600 text-lg" />
            ) : (
              <FaRegHeart className="text-lg" />
            )}
            <span>{safeArray(post.likes).length}</span>
          </button>

          {/* Comment toggle */}
          <button
            onClick={() => {
              playTap();
              setShowComments((p) => !p);
            }}
            className="flex gap-1.5 items-center text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors cursor-pointer"
          >
            <FaCommentDots className="text-lg" />
            <span>{safeArray(post.comments).length}</span>
          </button>

          {/* 1-Click Viral Repost */}
          <button
            onClick={handleRepost}
            className="flex gap-1.5 items-center text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-500 transition-colors cursor-pointer"
            title="Repost"
          >
            <Repeat2 className="w-5 h-5" />
            <span>{repostCount}</span>
          </button>

          {/* Copy Quote with Attribution */}
          <button
            onClick={() => {
              playTap();
              const quote = `"${post.title}"\n\n— by @${post.userId?.username || 'Creator'} via FondPeace\nhttps://www.fondpeace.com/post/${post._id}`;
              navigator.clipboard.writeText(quote);
              toast.success("Quote copied with attribution! 📋");
            }}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors cursor-pointer p-1"
            title="Copy Quote with Attribution"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors p-1 cursor-pointer"
            title="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "text-blue-500 fill-blue-500" : ""}`} />
          </button>

          {/* Views */}
          <div className="flex gap-1 items-center text-xs font-medium text-gray-500 bg-gray-200/50 dark:bg-zinc-800/50 px-2 py-0.5 rounded-full">
            <FaEye className="text-xs" />
            <span>{post.views || 0}</span>
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors p-1 cursor-pointer"
            aria-label="Share post"
          >
            <FaShareAlt className="text-sm" />
          </button>
        </div>
      </div>

      {/* Clickable Topic Tags Pills */}
      {(() => {
        const captionHashtags = (post.title || "").match(/#[\w\u0590-\u05ff]+/g) || [];
        const allPostTags = Array.from(
          new Set([
            ...(Array.isArray(post.tags) ? post.tags : []).map((t) => (t.startsWith("#") ? t : `#${t}`)),
            ...captionHashtags,
          ])
        );
        return allPostTags.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 px-1">
            {allPostTags.map((t, idx) => (
              <a
                key={idx}
                href={`/?tag=${t.replace(/^#+/, "")}`}
                className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/50 px-2.5 py-0.5 rounded-full transition-all"
              >
                <span>#{t.replace(/^#+/, "")}</span>
              </a>
            ))}
          </div>
        ) : null;
      })()}

      {/* 💬 COMMENTS SECTION */}
      {showComments && (
        <div className="mt-4 space-y-4">
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
              placeholder="Add a thoughtful comment..."
              className="flex-1 border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.02] dark:bg-white/[0.03] px-3.5 py-2.5 rounded-xl text-sm outline-none focus:border-blue-500"
            />
            <button
              onClick={handleComment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl text-sm font-bold shadow-sm hover:shadow transition-all"
            >
              Post
            </button>
          </div>

          {safeArray(post.comments).map((cmt) => (
            <div
              key={cmt._id}
              className="bg-gray-50 dark:bg-gray-900/60 p-3.5 rounded-2xl border border-black/[0.04] dark:border-white/[0.06]"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-xs text-gray-900 dark:text-white">
                  @{cmt.userId?.username || "user"}
                </p>
                <span className="text-[10px] text-gray-400">
                  {cmt.createdAt ? new Date(cmt.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 leading-relaxed">
                {cmt.CommentText}
              </p>

              <div className="flex items-center gap-4 mt-2.5">
                <button
                  onClick={() => handleCommentLike(cmt._id)}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-rose-500 transition-colors"
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
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
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
                    className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold"
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
                        className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-rose-500 mt-1"
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
  );
}
