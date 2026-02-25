"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShareAlt,
  FaEye,
  FaTimes,
} from "react-icons/fa";

const API_BASE = "https://backend-k.vercel.app";
const safeArray = (v) => (Array.isArray(v) ? v : []);

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

  // Sync with parent updates
  useEffect(() => {
    setData({
      ...post,
      likes: safeArray(post?.likes),
      comments: safeArray(post?.comments),
    });
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
  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.post(
      `${API_BASE}/post/like/${data._id}`,
      {},
      { headers: { "x-auth-token": token } }
    );

    syncParent({
      ...data,
      likes: safeArray(res.data.likes),
    });
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
    const url = `${window.location.origin}/shorts/${data._id}`;
    await navigator.clipboard.writeText(url);
  };

  return (
    <>
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 text-white">

        <button onClick={handleLike}>
          {hasLiked(data.likes) ? (
            <FaHeart className="text-red-500 text-3xl" />
          ) : (
            <FaRegHeart className="text-3xl" />
          )}
          <p className="text-xs mt-1">{safeArray(data.likes).length}</p>
        </button>

        <button onClick={() => setShowComments(true)}>
          <FaCommentDots className="text-3xl" />
          <p className="text-xs mt-1">{safeArray(data.comments).length}</p>
        </button>

        <div className="flex flex-col items-center">
          <FaEye className="text-3xl" />
          <p className="text-xs mt-1">{data.views || 0}</p>
        </div>

        <button onClick={handleShare}>
          <FaShareAlt className="text-3xl" />
        </button>
      </div>

      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:max-w-md h-[75vh] rounded-t-2xl md:rounded-2xl p-4 overflow-y-auto relative">
            <button
              onClick={() => setShowComments(false)}
              className="absolute top-4 right-4"
            >
              <FaTimes />
            </button>

            <h2 className="text-lg font-semibold mb-4">Comments</h2>

            <div className="flex gap-2 mb-4">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border px-3 py-2 rounded-lg"
              />
              <button
                onClick={handleComment}
                className="bg-black text-white px-4 rounded-lg"
              >
                Post
              </button>
            </div>

            {safeArray(data.comments).map((cmt) => (
              <div key={cmt._id} className="mb-4 border-b pb-3">
                <p className="font-semibold text-sm">
                  {cmt.userId?.username || "User"}
                </p>
                <p className="text-sm">{cmt.CommentText}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
