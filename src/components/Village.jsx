'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { formatPostTime } from '@/components/DateFormate';
import Skeleton from '@/components/Skeleton';
import toast from 'react-hot-toast';

function PostsManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/api/post');
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load posts');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`/api/post/like/${postId}`);
      const updatedPost = res.data;
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: updatedPost.likes } : post
        )
      );
    } catch (err) {
      toast.error('Authentication required to like');
    }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId] || commentText[postId].trim() === '') {
      toast.error('Comment cannot be empty');
      return;
    }
    try {
      const res = await axios.post(`/api/comment/${postId}`, {
        comment: commentText[postId],
      });
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, res.data] }
            : post
        )
      );
    } catch (err) {
      toast.error('Authentication required to comment');
    }
  };

  if (loading) return <Skeleton />;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-2xl shadow-md border border-gray-200 p-4"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="text-lg font-semibold">{post.title}</div>
            <div className="text-sm text-gray-500">{formatPostTime(post.createdAt)}</div>
          </div>
          <p className="text-gray-700 mb-2">{post.description}</p>

          {post.media && (
            <div className="rounded-xl overflow-hidden border border-gray-300 mb-3">
              {post.media.endsWith('.mp4') ? (
                <video
                  controls
                  className="w-full h-auto max-h-[400px] object-cover"
                  src={post.media}
                />
              ) : (
                <img
                  src={post.media}
                  alt="media"
                  className="w-full h-auto object-cover"
                />
              )}
            </div>
          )}

          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => handleLike(post._id)}
              className="text-sm px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-100"
            >
              👍 {post.likes.length}
            </button>

            <div className="text-sm text-gray-600">💬 {post.comments.length} comments</div>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={commentText[post._id] || ''}
              onChange={(e) =>
                setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))
              }
              placeholder="Write a comment..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleComment(post._id)}
              className="bg-blue-500 text-white px-4 py-1 rounded-full hover:bg-blue-600"
            >
              Post
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {post.comments.map((cmt, index) => (
              <div
                key={index}
                className="bg-gray-100 p-2 rounded-lg text-sm text-gray-800"
              >
                {cmt.comment}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PostsManager;
