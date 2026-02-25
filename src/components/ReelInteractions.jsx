"use client";

import { useState, useEffect } from "react";
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

export default function ReelInteractions({ post }) {

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

  // ================= AUTH =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = jwt.decode(token);
    if (decoded?.UserId) setUserId(String(decoded.UserId));
  }, []);

  const hasLikedPost = () =>
    userId &&
    safeArray(data.likes).some((id) => String(id) === userId);

  const hasLikedComment = (likes) =>
    userId &&
    safeArray(likes).some((id) => String(id) === userId);

  const hasLikedReply = (likes) =>
    userId &&
    safeArray(likes).some((id) => String(id) === userId);

  // ================= LIKE POST =================
  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");

    const res = await axios.post(
      `${API_BASE}/post/like/${data._id}`,
      {},
      { headers: { "x-auth-token": token } }
    );

    setData((p) => ({
      ...p,
      likes: safeArray(res.data.likes),
    }));
  };

  // ================= ADD COMMENT =================
  const handleComment = async () => {
    if (!comment.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");

    const res = await axios.post(
      `${API_BASE}/post/comment/${data._id}`,
      { CommentText: comment },
      { headers: { "x-auth-token": token } }
    );

    setData((p) => ({
      ...p,
      comments: safeArray(res.data.comments),
    }));

    setComment("");
  };

  // ================= COMMENT LIKE =================
  const handleCommentLike = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.post(
      `${API_BASE}/post/comment/${data._id}/like/${commentId}`,
      {},
      { headers: { "x-auth-token": token } }
    );

    setData((p) => ({
      ...p,
      comments: p.comments.map((c) =>
        c._id === commentId
          ? {
              ...c,
              likes: res.data.liked
                ? [...safeArray(c.likes), userId]
                : safeArray(c.likes).filter(
                    (id) => String(id) !== userId
                  ),
            }
          : c
      ),
    }));
  };

  // ================= ADD REPLY =================
  const submitReply = async (commentId) => {
    if (!replyText[commentId]?.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.post(
      `${API_BASE}/post/comment/${data._id}/reply/${commentId}`,
      { replyText: replyText[commentId] },
      { headers: { "x-auth-token": token } }
    );

    setData((p) => ({
      ...p,
      comments: p.comments.map((c) =>
        c._id === commentId
          ? { ...c, replies: safeArray(res.data) }
          : c
      ),
    }));

    setReplyText((r) => ({ ...r, [commentId]: "" }));
    setActiveReply(null);
  };

  // ================= REPLY LIKE =================
  const handleReplyLike = async (commentId, replyId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.post(
      `${API_BASE}/post/comment/${data._id}/like-reply/${commentId}/${replyId}`,
      {},
      { headers: { "x-auth-token": token } }
    );

    setData((p) => ({
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
                            (id) => String(id) !== userId
                          ),
                    }
                  : r
              ),
            }
          : c
      ),
    }));
  };

  // ================= SHARE =================
  const handleShare = async () => {
    const url = `${window.location.origin}/shorts/${data._id}`;
    await navigator.clipboard.writeText(url);
    alert("Link copied");
  };

  // ================= UI =================
  return (
    <>
      {/* RIGHT SIDE BAR */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 text-white">

        <button onClick={handleLike}>
          {hasLikedPost() ? (
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

      {/* COMMENT MODAL */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-end md:items-center justify-center">

          <div className="bg-white w-full md:max-w-md h-[70vh] md:h-[80vh] rounded-t-2xl md:rounded-2xl p-4 overflow-y-auto relative">

            <button
              onClick={() => setShowComments(false)}
              className="absolute top-4 right-4 text-gray-600"
            >
              <FaTimes />
            </button>

            <h2 className="text-lg font-semibold mb-4">
              Comments
            </h2>

            {/* Add Comment */}
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

            {/* Comment List */}
            {safeArray(data.comments).map((cmt) => (
              <div key={cmt._id} className="mb-4 border-b pb-3">

                <p className="font-semibold text-sm">
                  {cmt.userId?.username || "User"}
                </p>
                <p className="text-sm">{cmt.CommentText}</p>

                <div className="flex gap-4 text-xs mt-2">

                  <button onClick={() => handleCommentLike(cmt._id)}>
                    {hasLikedComment(cmt.likes) ? (
                      <FaHeart className="text-red-500 inline" />
                    ) : (
                      <FaRegHeart className="inline" />
                    )}
                    {" "}
                    {safeArray(cmt.likes).length}
                  </button>

                  <button onClick={() => setActiveReply(cmt._id)}>
                    Reply
                  </button>

                </div>

                {/* Reply Input */}
                {activeReply === cmt._id && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={replyText[cmt._id] || ""}
                      onChange={(e) =>
                        setReplyText({
                          ...replyText,
                          [cmt._id]: e.target.value,
                        })
                      }
                      placeholder="Write reply..."
                      className="flex-1 border px-2 py-1 rounded"
                    />
                    <button
                      onClick={() => submitReply(cmt._id)}
                      className="bg-gray-800 text-white px-3 rounded"
                    >
                      Send
                    </button>
                  </div>
                )}

                {/* Replies */}
                <div className="ml-4 mt-2 space-y-2">
                  {safeArray(cmt.replies).map((rep) => (
                    <div key={rep._id} className="text-sm">

                      <p className="font-semibold">
                        {rep.userId?.username || "User"}
                      </p>

                      <p>{rep.replyText}</p>

                      <button
                        onClick={() =>
                          handleReplyLike(cmt._id, rep._id)
                        }
                        className="text-xs mt-1"
                      >
                        {hasLikedReply(rep.likes) ? (
                          <FaHeart className="text-red-500 inline" />
                        ) : (
                          <FaRegHeart className="inline" />
                        )}
                        {" "}
                        {safeArray(rep.likes).length}
                      </button>

                    </div>
                  ))}
                </div>

              </div>
            ))}

          </div>
        </div>
      )}
    </>
  );
}
