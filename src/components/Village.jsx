'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { formatPostTime } from '@/components/DateFormate';
import Skeleton from '@/components/Skeleton';
import toast from 'react-hot-toast';

function PostsManager() {
  const [posts, setPosts] = useState([]);
  const videoRefs = useRef([]);
  const [userId, setUserId] = useState(null);

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      const { data } = await axios.get("https://backendk-z915.onrender.com/post/mango/getall");
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  // Extract UserId from token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // user not logged in

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // decode JWT payload
      setUserId(payload.UserId || payload.userId || payload.id);
    } catch {
      // invalid token format
      setUserId(null);
    }
  }, []);

  // Intersection observer for videos
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

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle share button
  const handleShare = (post) => {
    const postURL = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(postURL)
      .then(() => toast.success("Link copied to clipboard!", { duration: 1500 }))
      .catch(() => toast.error("Failed to copy link."));
  };

  // Check if current user liked a post
  const isLikedByUser = (post) => {
    if (!post.likes || !userId) return false;
    return post.likes.includes(userId);
  };

  // Handle like/unlike
  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to like posts.");
      return;
    }

    try {
      const res = await axios.post(
        `https://backendk-z915.onrender.com/post/like/${postId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local post's likes from response
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: res.data.likes } : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error.response?.data || error.message);
      toast.error("Failed to like post.");
    }
  };

  return (
    <div className="w-full px-4 py-6 space-y-6">
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <div key={post._id} className="border rounded-xl p-4 shadow-sm bg-white">
            {/* User Info */}
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

            {/* Post Title */}
            {post?.title && (
              <p className="text-base text-gray-800 mb-3 px-1">{post.title}</p>
            )}

            {/* Media Preview */}
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

            {/* Post Actions */}
            <div className="flex justify-around text-sm text-gray-600 mt-4">
              <p
                className={`cursor-pointer hover:text-blue-600 select-none ${
                  isLikedByUser(post) ? "text-blue-600 font-semibold" : ""
                }`}
                onClick={() => handleLike(post._id)}
              >
                ❤️ Like ({post.likes?.length || 0})
              </p>
              <p className="cursor-pointer hover:text-blue-600">Comment</p>
              <p className="cursor-pointer hover:text-blue-600">Save</p>
              <p className="cursor-pointer hover:text-blue-600" onClick={() => handleShare(post)}>
                Share
              </p>
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
