'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import jwt from 'jsonwebtoken';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentBoxesOpen, setCommentBoxesOpen] = useState({});
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.replace('/login');

    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        return window.location.replace('/login');
      }
      setUserId(decoded.UserId || decoded.id || decoded.userId);
    } catch {
      localStorage.removeItem('token');
      return window.location.replace('/login');
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('https://backend-k.vercel.app/post/mango/getall');
      setPosts(res.data.reverse());
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.replace('/login');

    try {
      await axios.post(
        `https://backend-k.vercel.app/post/like/${postId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Optimistically update the UI
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            const alreadyLiked = post.likes.includes(userId);
            const updatedLikes = alreadyLiked
              ? post.likes.filter((id) => id !== userId)
              : [...post.likes, userId];

            return { ...post, likes: updatedLikes };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const toggleCommentBox = (postId) => {
    setCommentBoxesOpen((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleCommentInputChange = (postId, text) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: text,
    }));
  };

  const handleSubmitComment = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.replace('/login');

    const commentText = commentInputs[postId]?.trim();
    if (!commentText) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      await axios.post(
        `https://backend-k.vercel.app/post/comment/${postId}`,
        { CommentText: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      setCommentBoxesOpen((prev) => ({ ...prev, [postId]: false }));
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const isLikedByUser = (post) => {
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
            className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200"
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
                    alt="Post media"
                    className="w-full rounded object-contain"
                  />
                )}
              </div>
            )}

            {/* Like & Comment Buttons */}
            <div className="flex gap-4 mb-3">
              <button
                onClick={() => handleLike(post._id)}
                className={`px-3 py-1 rounded font-semibold ${
                  isLikedByUser(post)
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

            {/* Comment input box */}
            {commentBoxesOpen[post._id] && (
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post._id] || ''}
                  onChange={(e) =>
                    handleCommentInputChange(post._id, e.target.value)
                  }
                  className="w-full border p-2 rounded mb-2"
                />
                <button
                  onClick={() => handleSubmitComment(post._id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded font-semibold"
                >
                  Post Comment
                </button>

                {/* Show comments */}
                <ul className="mt-3 max-h-48 overflow-auto space-y-2">
                  {post.comments?.map((c) => (
                    <li key={c._id} className="border-b border-gray-200 pb-1 text-sm">
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
    
