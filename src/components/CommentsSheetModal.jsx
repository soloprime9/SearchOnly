"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import { toast } from "@/utils/toast";
import { playPop, playChime } from "@/utils/soundEffects";
import {
  X,
  Heart,
  Send,
  CornerDownRight,
  MessageCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Flame,
  Laugh,
  ThumbsUp,
  PartyPopper,
} from "lucide-react";

// Safe array helper
const safeArray = (v) => (Array.isArray(v) ? v : []);

// Format relative time helper
function formatTimeAgo(dateString) {
  if (!dateString) return "now";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSec = Math.max(0, Math.floor((now - past) / 1000));
  if (diffInSec < 60) return "just now";
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CommentsSheetModal({
  isOpen,
  onClose,
  postId,
  post,
  currentUserId,
  onCommentCountChange,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputVal, setInputVal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, username }
  const [expandedReplies, setExpandedReplies] = useState({}); // { [commentId]: boolean }
  const commentsEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch comments when modal opens
  useEffect(() => {
    if (!isOpen || !postId) return;

    let isMounted = true;
    setLoading(true);
    setReplyingTo(null);

    const fetchComments = async () => {
      try {
        const apiBase = getApiBase();
        const res = await axios.get(`${apiBase}/post/comment/${postId}`);
        if (isMounted) {
          const list = safeArray(res.data);
          setComments(list);
          if (onCommentCountChange) onCommentCountChange(list.length);
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
        // Fallback to post.comments if network fails
        if (isMounted && post?.comments) {
          setComments(safeArray(post.comments));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComments();

    // Lock body scroll on mobile
    document.body.style.overflow = "hidden";

    return () => {
      isMounted = false;
      document.body.style.overflow = "unset";
    };
  }, [isOpen, postId]);

  // Focus input when replying
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const postAuthorId = post?.userId?._id || post?.userId;

  // Toggle Comment Like
  const handleLikeComment = async (commentId) => {
    playPop();
    const headers = getAuthHeaders();
    if (!headers["x-auth-token"] && !headers["Authorization"]) {
      toast.error("Please log in to like comments");
      return;
    }

    // Optimistic toggle
    setComments((prev) =>
      prev.map((c) => {
        if (c._id !== commentId) return c;
        const currentLikes = safeArray(c.likes);
        const hasLiked = currentLikes.some((id) => String(id) === String(currentUserId));
        const updatedLikes = hasLiked
          ? currentLikes.filter((id) => String(id) !== String(currentUserId))
          : [...currentLikes, currentUserId || "temp_user"];
        return { ...c, likes: updatedLikes };
      })
    );

    try {
      const apiBase = getApiBase();
      await axios.post(
        `${apiBase}/post/comment/${postId}/like/${commentId}`,
        {},
        { headers }
      );
    } catch (err) {
      console.error("Failed to like comment:", err);
    }
  };

  // Toggle Reply Like
  const handleLikeReply = async (commentId, replyId) => {
    playPop();
    const headers = getAuthHeaders();
    if (!headers["x-auth-token"] && !headers["Authorization"]) {
      toast.error("Please log in to like replies");
      return;
    }

    setComments((prev) =>
      prev.map((c) => {
        if (c._id !== commentId) return c;
        const updatedReplies = safeArray(c.replies).map((r) => {
          if (r._id !== replyId) return r;
          const currentLikes = safeArray(r.likes);
          const hasLiked = currentLikes.some((id) => String(id) === String(currentUserId));
          const updatedLikes = hasLiked
            ? currentLikes.filter((id) => String(id) !== String(currentUserId))
            : [...currentLikes, currentUserId || "temp_user"];
          return { ...r, likes: updatedLikes };
        });
        return { ...c, replies: updatedReplies };
      })
    );

    try {
      const apiBase = getApiBase();
      await axios.post(
        `${apiBase}/post/comment/${postId}/like-reply/${commentId}/${replyId}`,
        {},
        { headers }
      );
    } catch (err) {
      console.error("Failed to like reply:", err);
    }
  };

  // Submit comment or nested reply
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const text = inputVal.trim();
    if (!text || submitting) return;

    const headers = getAuthHeaders();
    if (!headers["x-auth-token"] && !headers["Authorization"]) {
      toast.error("Please log in to comment");
      return;
    }

    setSubmitting(true);
    const apiBase = getApiBase();

    try {
      if (replyingTo) {
        // Submit Nested Reply
        const { commentId } = replyingTo;
        const res = await axios.post(
          `${apiBase}/post/comment/${postId}/reply/${commentId}`,
          { replyText: text },
          { headers }
        );

        playChime();
        toast.success("Reply posted!");

        // Update local state with latest replies from backend
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? { ...c, replies: safeArray(res.data) }
              : c
          )
        );

        // Auto-expand replies for this comment
        setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
        setReplyingTo(null);
        setInputVal("");
      } else {
        // Submit New Top-Level Comment
        const res = await axios.post(
          `${apiBase}/post/comment/${postId}`,
          { CommentText: text },
          { headers }
        );

        playChime();
        toast.success("Comment posted!");

        // If backend returned post or comment array
        const updatedList = Array.isArray(res.data)
          ? res.data
          : res.data?.comments || [
              ...comments,
              {
                _id: "temp_" + Date.now(),
                CommentText: text,
                userId: { username: "you", isVerified: false },
                likes: [],
                createdAt: new Date().toISOString(),
                replies: [],
              },
            ];

        setComments(updatedList);
        if (onCommentCountChange) onCommentCountChange(updatedList.length);
        setInputVal("");

        // Scroll to newly added comment
        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    } catch (err) {
      console.error("Error submitting comment/reply:", err);
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Emoji Click
  const handleEmojiClick = (emoji) => {
    setInputVal((prev) => prev + emoji);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sheet / Drawer Container */}
      <div
        className="relative w-full md:max-w-lg bg-white dark:bg-zinc-950 rounded-t-3xl md:rounded-3xl shadow-2xl border-t md:border border-gray-100 dark:border-zinc-800 flex flex-col h-[85vh] md:h-[680px] max-h-[90vh] z-10 overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull / Drag Indicator */}
        <div className="md:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight">
              Comments
            </h3>
            <span className="text-xs font-black bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/50">
              {comments.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comments Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400 font-medium tracking-wide">Loading community comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 text-center px-4 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-zinc-900 flex items-center justify-center text-blue-500">
                <MessageCircle size={28} />
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">No comments yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Start the conversation! Be the first to share your thoughts.</p>
              </div>
            </div>
          ) : (
            comments.map((cmt) => {
              const commenterId = cmt?.userId?._id || cmt?.userId;
              const isAuthor = postAuthorId && String(commenterId) === String(postAuthorId);
              const username = cmt?.userId?.username || "fondpeace_user";
              const avatar = cmt?.userId?.profilePicture;
              const hasLiked = safeArray(cmt?.likes).some(
                (id) => String(id) === String(currentUserId)
              );
              const replies = safeArray(cmt?.replies);
              const isRepliesOpen = expandedReplies[cmt._id];

              return (
                <div key={cmt._id || Math.random()} className="space-y-2 group">
                  {/* Top-level Comment Item */}
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={username}
                        className="w-9 h-9 rounded-full object-cover border border-gray-100 dark:border-zinc-800 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                        {username.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-gray-900 dark:text-gray-100 hover:underline cursor-pointer">
                          @{username}
                        </span>

                        {cmt?.userId?.isVerified && (
                          <ShieldCheck size={13} className="text-blue-500 fill-blue-500/20" />
                        )}

                        {isAuthor && (
                          <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                            Author
                          </span>
                        )}

                        <span className="text-[10px] text-gray-400 ml-1">
                          {formatTimeAgo(cmt?.createdAt)}
                        </span>
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 leading-relaxed break-words whitespace-pre-wrap font-normal">
                        {cmt?.CommentText}
                      </p>

                      {/* Comment Actions (Reply, Likes) */}
                      <div className="flex items-center gap-4 mt-1.5 text-[11px] text-gray-400 font-semibold">
                        <button
                          onClick={() => {
                            setReplyingTo({ commentId: cmt._id, username });
                            setInputVal(`@${username} `);
                          }}
                          className="hover:text-blue-500 transition-colors flex items-center gap-1"
                        >
                          <CornerDownRight size={12} />
                          Reply
                        </button>
                      </div>
                    </div>

                    {/* Like Button */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <button
                        onClick={() => handleLikeComment(cmt._id)}
                        className="p-1 rounded-full text-gray-400 hover:text-red-500 transition-colors active:scale-125"
                      >
                        <Heart
                          size={15}
                          className={
                            hasLiked ? "text-red-500 fill-red-500" : "text-gray-400"
                          }
                        />
                      </button>
                      {safeArray(cmt?.likes).length > 0 && (
                        <span className="text-[10px] text-gray-400 font-bold">
                          {cmt.likes.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Replies Section */}
                  {replies.length > 0 && (
                    <div className="pl-12 space-y-2">
                      <button
                        onClick={() =>
                          setExpandedReplies((prev) => ({
                            ...prev,
                            [cmt._id]: !prev[cmt._id],
                          }))
                        }
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        {isRepliesOpen ? (
                          <>
                            <ChevronUp size={13} />
                            Hide {replies.length} {replies.length === 1 ? "reply" : "replies"}
                          </>
                        ) : (
                          <>
                            <ChevronDown size={13} />
                            View {replies.length} {replies.length === 1 ? "reply" : "replies"}
                          </>
                        )}
                      </button>

                      {isRepliesOpen && (
                        <div className="space-y-2.5 pt-1 border-l-2 border-gray-100 dark:border-zinc-800 pl-3">
                          {replies.map((reply) => {
                            const rUser = reply?.userId?.username || "user";
                            const rAvatar = reply?.userId?.profilePicture;
                            const rHasLiked = safeArray(reply?.likes).some(
                              (id) => String(id) === String(currentUserId)
                            );
                            const rIsAuthor =
                              postAuthorId &&
                              String(reply?.userId?._id || reply?.userId) === String(postAuthorId);

                            return (
                              <div
                                key={reply._id || Math.random()}
                                className="flex items-start gap-2.5"
                              >
                                {rAvatar ? (
                                  <img
                                    src={rAvatar}
                                    alt={rUser}
                                    className="w-6 h-6 rounded-full object-cover border border-gray-100 dark:border-zinc-800"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                                    {rUser.charAt(0).toUpperCase()}
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-[11px] text-gray-900 dark:text-gray-100 hover:underline cursor-pointer">
                                      @{rUser}
                                    </span>
                                    {rIsAuthor && (
                                      <span className="bg-purple-100 text-purple-600 text-[8px] font-black px-1 rounded uppercase">
                                        Author
                                      </span>
                                    )}
                                    <span className="text-[9px] text-gray-400">
                                      {formatTimeAgo(reply?.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-700 dark:text-gray-300 mt-0.5 break-words">
                                    {reply?.replyText}
                                  </p>
                                </div>

                                <button
                                  onClick={() => handleLikeReply(cmt._id, reply._id)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Heart
                                    size={13}
                                    className={
                                      rHasLiked ? "text-red-500 fill-red-500" : "text-gray-400"
                                    }
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Footer / Comment Composer */}
        <div className="border-t border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/50 p-3 space-y-2">
          {/* Quick Emoji Reaction Strip */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {["❤️", "🔥", "👏", "😂", "🙌", "💯", "✨", "😍"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="text-base hover:scale-125 transition-transform px-1 py-0.5 rounded-md hover:bg-white dark:hover:bg-zinc-800"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Replying banner */}
          {replyingTo && (
            <div className="flex items-center justify-between text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/50">
              <span className="truncate">
                Replying to <span className="font-bold">@{replyingTo.username}</span>
              </span>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setInputVal("");
                }}
                className="hover:underline font-bold text-red-500 text-[11px] ml-2"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={
                replyingTo
                  ? `Reply to @${replyingTo.username}...`
                  : "Add a comment for the community..."
              }
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-full px-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm"
              maxLength={400}
            />

            <button
              type="submit"
              disabled={!inputVal.trim() || submitting}
              className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-bold transition-all shadow-md active:scale-95 disabled:hover:bg-blue-600"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={15} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
