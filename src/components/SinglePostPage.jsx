"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";

export default function SinglePostInteractions({ initialPost }) {
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState("");
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

  // ❤️ LIKE
  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please login to like");

      const res = await axios.post(
        `${API_BASE}/post/like/${post._id}`,
        {},
        { headers: { "x-auth-token": token } }
      );

      setPost((prev) => ({
        ...prev,
        likes: res.data.likes,
      }));
    } catch {
      alert("Failed to update like");
    }
  };

  // 💬 COMMENT
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
    } catch {
      alert("Failed to post comment");
    }
  };

  // 🕒 TIME AGO HELPER
  const timeAgo = (createdAt) => {
    const seconds = Math.floor((new Date() - new Date(createdAt)) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (let key in intervals) {
      const interval = Math.floor(seconds / intervals[key]);
      if (interval >= 1) return `${interval} ${key}${interval > 1 ? "s" : ""} ago`;
    }

    return "Just now";
  };

  // 🔗 SHARE POST (USES IMAGE IF AVAILABLE)
  const handleShare = () => {
    const shareData = {
      title: post.title,
      url: window.location.href,
    };

    // If post has an image, add it
    if (post.thumbnail) {
      shareData.files = [
        new File([], post.thumbnail, { type: "image/jpeg" })
      ];
    }

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="mt-6">

      {/* LIKE + SHARE */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleLike}
          className={`text-sm font-bold ${hasLiked ? "text-red-600" : "text-gray-700"}`}
        >
          {hasLiked ? "💔 Dislike" : "❤️ Like"} ({post.likes.length})
        </button>

        <button onClick={handleShare} className="text-blue-600 font-medium text-sm">
          Share
        </button>
      </div>

      {/* COMMENT COUNT */}
      <div className="text-gray-700 font-medium mb-2">
        💬 {post.comments.length} Comments
      </div>

      {/* COMMENT INPUT */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
        <button
          onClick={handleComment}
          className="bg-blue-600 text-white px-4 rounded-md"
        >
          Post
        </button>
      </div>

      {/* SHOW COMMENTS */}
      <div className="space-y-2">
        {post.comments.map((cmt, i) => (
          <div key={i} className="bg-gray-100 p-3 rounded-md">
            <p className="font-semibold text-gray-800">
              {cmt.userId?.username || "User"}
            </p>
            <p className="text-gray-700">{cmt.CommentText}</p>

            {/* TIME AGO */}
            <span className="text-xs text-gray-500">
              {cmt.createdAt ? timeAgo(cmt.createdAt) : ""}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
