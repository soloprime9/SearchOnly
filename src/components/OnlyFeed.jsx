'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import jwt from 'jsonwebtoken';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [commentInput, setCommentInput] = useState({}); // { postId: text }
  const [commentBoxOpen, setCommentBoxOpen] = useState({}); // { postId: bool }
  const [userId, setUserId] = useState(null);

  // Check token on mount & get userId from decoded token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      setUserId(decoded.id || decoded.UserId || decoded.userId); // Adjust if your token uses another key for user id
    } catch (err) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }, []);

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      const res = await axios.get('https://backend-k.vercel.app/post/mango/getall');
      setPosts(res.data.reverse());
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle Like toggle
  const handleLikePost = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    try {
      await axios.post(
        `https://backend-k.vercel.app/post/like/${postId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Refresh posts after like toggle
      fetchPosts();
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  // Handle Comment post
  const handleCommentPost = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const text = commentInput[postId];
    if (!text || !text.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      await axios.post(
        `https://backend-k.vercel.app/post/comment/${postId}`,
        { CommentText: text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCommentInput((prev) => ({ ...prev, [postId]: '' }));
      setCommentBoxOpen((prev) => ({ ...prev, [postId]: false }));
      fetchPosts();
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  // Toggle comment input box visibility
  const toggleCommentBox = (postId) => {
    setCommentBoxOpen((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Check if current user liked post
  const isPostLikedByUser = (post) => {
    if (!post.likes) return false;
    return post.likes.includes(userId);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      {posts.length === 0 ? (
        <p>Loading posts...</p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            className="border rounded-lg p-4 mb-6 bg-white shadow-md"
          >
            {/* User Info */}
            <div className="flex items-center mb-3">
              <img
                src={post.userId?.profilePic || '/1.jpg'}
                alt="User Profile"
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
              <div>
                <Link
                  href={`/profile/${post.userId?.username}`}
                  className="font-semibold text-lg"
                >
                  {post.userId?.username || 'Unknown User'}
                </Link>
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Post Title */}
            {post.title && <p className="mb-3">{post.title}</p>}

            {/* Media */}
            {post.media && (
              <div className="mb-3">
                {post.media.endsWith('.mp4') ? (
                  <video
                    src={post.media}
                    controls
                    className="w-full rounded"
                    muted
                  />
                ) : (
                  <img
                    src={post.media}
                    alt="Post Media"
                    className="w-full rounded object-contain"
                  />
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mb-3">
              <button
                onClick={() => handleLikePost(post._id)}
                className={`px-3 py-1 rounded font-semibold ${
                  isPostLikedByUser(post)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                ❤️ Like ({post.likes?.length || 0})
              </button>

              <button
                onClick={() => toggleCommentBox(post._id)}
                className="px-3 py-1 rounded bg-green-600 text-white font-semibold"
              >
                💬 Comment ({post.comments?.length || 0})
              </button>
            </div>

            {/* Comment box */}
            {commentBoxOpen[post._id] && (
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInput[post._id] || ''}
                  onChange={(e) =>
                    setCommentInput((prev) => ({
                      ...prev,
                      [post._id]: e.target.value,
                    }))
                  }
                  className="w-full border p-2 rounded mb-2"
                />
                <button
                  onClick={() => handleCommentPost(post._id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded font-semibold"
                >
                  Post Comment
                </button>

                {/* Display comments */}
                <ul className="mt-3 space-y-2 max-h-48 overflow-auto">
                  {post.comments?.map((c) => (
                    <li
                      key={c._id}
                      className="border-b border-gray-200 pb-1 text-sm"
                    >
                      <strong>{c.UserId?.username || 'Anonymous'}:</strong>{' '}
                      {c.CommentText}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Feed;
