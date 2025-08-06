'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import toast from 'react-hot-toast';
import { formatPostTime } from '@/components/DateFormate';
import Skeleton from '@/components/Skeleton';

function PostsManager() {
  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const videoRefs = useRef([]);

  // ✅ Token check and redirect
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("Token is not available");
     // return (window.location.href = "/login");
    }

    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
        console.log("Token invalid or expired");
        localStorage.removeItem("token");
       // window.location.href = "/login";
      }
    } catch (err) {
      console.log("Invalid Token:", err);
      localStorage.removeItem("token");
   //   window.location.href = "/login";
    }
  }, []);

  // ✅ Fetch posts
  const fetchPosts = async () => {
    try {
      const { data } = await axios.get("https://backend-k.vercel.app/post/mango/getall");
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ✅ Auto play/pause videos
  useEffect(() => {
    const observers = [];

    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(video);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [posts]);

  // ✅ Handle Like Toggle
  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.post(
        `https://backend-k.vercel.app/post/like/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Post like updated");
      fetchPosts(); // refresh posts after like/unlike
    } catch (err) {
      toast.error("Failed to update like");
      console.error(err);
    }
  };

  // ✅ Handle Comment Submission
  const handleComment = async (postId) => {
    const token = localStorage.getItem("token");
    const CommentText = commentInputs[postId];

    if (!CommentText || CommentText.trim() === "") {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      await axios.post(
        `https://backend-k.vercel.app/post/comment/${postId}`,
        { CommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Comment added");
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (error) {
      toast.error("Failed to comment");
      console.error(error);
    }
  };

  // ✅ Share Post
  const handleShare = (post) => {
    const postURL = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postURL)
      .then(() => toast.success("Link copied to clipboard!", { duration: 1500 }))
      .catch(() => toast.error("Failed to copy link."));
  };

  return (
    <div className="w-full px-4 py-6 space-y-6">
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <div key={post._id} className="border rounded-xl p-4 shadow-sm bg-white">
            {/* 🔵 User Info */}
            <div className="flex items-start gap-3 mb-3">
              <Link href={`/profile/${post?.userId?.username}`}>
                <img
                  src={"https://www.fondpeace.com/og-image.jpg"}
                  alt="profile"
                  className="w-10 h-10 rounded-full border object-cover"
                />
              </Link>
              <div className="flex flex-col">
                <Link href={`/profile/${post?.userId?.username}`}>
                  <span className="font-semibold text-md cursor-pointer">
                    {post?.userId?.username}
                  </span>
                </Link>
                <span className="text-sm text-gray-500">{formatPostTime(post.createdAt)}</span>
              </div>
              <span className="ml-auto text-xl text-gray-500 cursor-pointer">...</span>
            </div>

            {/* ✅ Post Title */}
            {post?.title && (
              <p className="text-base text-gray-800 mb-3 px-1">{post.title}</p>
            )}

            {/* 🔵 Media */}
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
              {post.media && post.mediaType ? (
                post.mediaType.startsWith("video") ? (
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={post.media}
                    className="w-full max-h-[400px] object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="metadata"
                    controls
                  />
                ) : post.mediaType.startsWith("image") ? (
                  <img
                    src={post.media}
                    alt="Post"
                    className="w-full max-h-[600px] object-contain"
                  />
                ) : (
                  <p className="p-4 text-center text-gray-500">Unsupported media type</p>
                )
              ) : (
                <p className="p-4 text-center text-gray-400">No media available</p>
              )}
            </div>

            {/* 🔵 Actions */}
            <div className="flex justify-around text-sm text-gray-600 mt-4">
              <p
                className="cursor-pointer hover:text-blue-600"
                onClick={() => handleLike(post._id)}
              >
                ❤️ {post.likes.length} Like
              </p>
              <p className="cursor-pointer hover:text-blue-600">💬 {post.comments.length} Comment</p>
              <p className="cursor-pointer hover:text-blue-600">🔖 Save</p>
              <p
                className="cursor-pointer hover:text-blue-600"
                onClick={() => handleShare(post)}
              >
                📤 Share
              </p>
            </div>

            {/* 🔵 Comment Input */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Add a comment..."
                className="w-full border px-3 py-2 rounded-md text-sm"
                value={commentInputs[post._id] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({
                    ...prev,
                    [post._id]: e.target.value,
                  }))
                }
              />
              <button
                onClick={() => handleComment(post._id)}
                className="mt-2 px-4 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                Post
              </button>
            </div>
          </div>
        ))
      ) : (
        <Skeleton />
      )}
    </div>
  );
}

export default PostsManager;
                  
