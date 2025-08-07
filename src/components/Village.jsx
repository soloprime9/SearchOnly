'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import toast from 'react-hot-toast';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return (window.location.href = "/login");

    try {
      const decoded = jwt.decode(storedToken);
      if (!decoded?.exp || decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return (window.location.href = "/login");
      }
      setUserId(decoded.UserId);
      setToken(storedToken);
      fetchPosts(storedToken);
    } catch (err) {
      localStorage.removeItem("token");
      return (window.location.href = "/login");
    }
  }, []);

  const fetchPosts = async (token) => {
    try {
      const res = await axios.get("/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`/api/posts/like/${postId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts(token);
    } catch (err) {
      console.error("Like failed:", err);
      toast.error("Authentication failed. Please login.");
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      await axios.post(
        `/api/posts/comment/${postId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
      fetchPosts(token);
    } catch (err) {
      console.error("Comment failed:", err);
      toast.error("Authentication failed. Please login.");
    }
  };

  const hasLiked = (post) => post.likes?.includes(userId);

  return (
    <div className="max-w-2xl mx-auto p-4">
      {posts.map((post) => (
        <div key={post._id} className="bg-white shadow-md rounded-xl p-4 mb-6">
          <div className="mb-2 text-lg font-semibold">{post.username}</div>
          <div className="mb-3">{post.content}</div>

          {post.media && (
            post.media.endsWith(".mp4") ? (
              <video controls className="w-full rounded-lg mb-3">
                <source src={post.media} type="video/mp4" />
              </video>
            ) : (
              <img src={post.media} className="w-full rounded-lg mb-3" alt="media" />
            )
          )}

          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => handleLike(post._id)}
              className={`px-4 py-1 text-white rounded-full ${hasLiked(post) ? 'bg-red-500' : 'bg-gray-500'} hover:opacity-90`}
            >
              {hasLiked(post) ? "Dislike" : "Like"} ({post.likes?.length || 0})
            </button>
          </div>

          <div className="mb-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText[post._id] || ""}
              onChange={(e) =>
                setCommentText({ ...commentText, [post._id]: e.target.value })
              }
              className="w-full border px-3 py-2 rounded-lg mb-2"
            />
            <button
              onClick={() => handleComment(post._id)}
              className="bg-blue-500 text-white px-4 py-1 rounded-full hover:bg-blue-600"
            >
              Comment
            </button>
          </div>

          <div className="mt-4">
            {post.comments?.map((c, i) => (
              <div key={i} className="text-sm bg-gray-100 p-2 rounded mb-1">
                <strong>{c.username || "User"}:</strong> {c.text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
