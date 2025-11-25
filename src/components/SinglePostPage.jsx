"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";
import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaEye } from "react-icons/fa";

export default function SinglePostInteractions({ initialPost }) {
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [userId, setUserId] = useState(null);

  const API_BASE = "https://backend-k.vercel.app";

  // GET USER ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.UserId) setUserId(decoded.UserId);
    }
  }, []);

  const hasLiked = post.likes.some((id) => id.toString() === userId?.toString());

  // LIKE
  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please login");

      const res = await axios.post(
        `${API_BASE}/post/like/${post._id}`,
        {},
        { headers: { "x-auth-token": token } }
      );

      setPost((prev) => ({
        ...prev,
        likes: res.data.likes,
      }));
    } catch {}
  };

  // COMMENT
  const handleComment = async () => {
    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please login");

      const res = await axios.post(
        `${API_BASE}/post/comment/${post._id}`,
        { CommentText: comment, userId },
        { headers: { "x-auth-token": token } }
      );

      setPost((prev) => ({
        ...prev,
        comments: res.data.comments,
      }));

      setComment("");
    } catch {}
  };

  const handleShare = async () => {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${post.title}\n${shareUrl}`;

  // ✔ 1. Modern Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title: post.title,
        text: post.title,
        url: shareUrl,
      });
      return;
    } catch (err) {
      // user cancelled — ignore
    }
  }

  // ✔ 2. Clipboard Copy Fallback (Works on all browsers)
  try {
    await navigator.clipboard.writeText(shareText);
    alert("Link + Title Copied!");
  } catch (err) {
    // ✔ Final fallback for older devices
    const temp = document.createElement("textarea");
    temp.value = shareText;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);

    alert("Copied!");
  }
};



  return (
    <div className="mt-6">

      {/* INLINE INTERACTION BAR */}
      <div className="flex items-center justify-between py-2 px-3 bg-gray-100 rounded-lg">

        

        {/* LIKE */}
        <button onClick={handleLike} className="flex items-center gap-1 text-sm text-gray-700">
          {hasLiked ? (
            <FaHeart className="text-red-600 text-lg" />
          ) : (
            <FaRegHeart className="text-lg" />
          )}
          <span>{post.likes.length}</span>
        </button>

        {/* COMMENT */}
        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-1 text-sm text-gray-700"
        >
          <FaCommentDots className="text-lg" />
          <span>{post.comments.length}</span>
        </button>

        {/* VIEWS */}
        <div className="flex items-center gap-1 text-gray-700 text-sm">
          <FaEye className="text-gray-600" />
          <span>{post.views || 0}</span>
        </div>

        {/* SHARE */}
        <button onClick={handleShare} className="text-gray-700 text-lg">
          <FaShareAlt />
        </button>
      </div>

      {/* COMMENTS SECTION TOGGLE */}
      {showComments && (
        <div className="mt-4">

          {/* Comment Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md"
            />
            <button
              onClick={handleComment}
              className="bg-blue-600 text-white px-4 rounded-md"
            >
              Post
            </button>
          </div>

          {/* Show Comments */}
          <div className="space-y-2">
            {post.comments.map((cmt, i) => (
              <div key={i} className="bg-gray-100 p-3 rounded-md">
                <p className="font-semibold text-gray-800">
                  {cmt.userId?.username || "User"}
                </p>
                <p className="text-gray-700">{cmt.CommentText}</p>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
