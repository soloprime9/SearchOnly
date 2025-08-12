'use client';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import jwt from "jsonwebtoken";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [commentTextMap, setCommentTextMap] = useState({});
  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [userId, setUserId] = useState(null);
  const videoRefs = useRef([]);
  const router = useRouter();
  const API_BASE = "https://backend-k.vercel.app";

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/post/mango/getall`);
      setPosts(data);
    } catch {
      alert("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    const startRedirectTimer = () => {
      const timer = setTimeout(() => {
        window.location.href = "/login";
      }, 60 * 1000);
      return timer;
    };

    let timer;

    fetchPosts();

    if (!token) {
      timer = startRedirectTimer();
      return () => clearTimeout(timer);
    }

    try {
      const decoded = jwt.decode(token);

      if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        timer = startRedirectTimer();
        return () => clearTimeout(timer);
      }

      setUserId(decoded.UserId);
    } catch {
      localStorage.removeItem("token");
      timer = startRedirectTimer();
      return () => clearTimeout(timer);
    }
  }, []);

  // IntersectionObserver for autoplay on 50% visibility
  useEffect(() => {
    if (!posts.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [posts]);

  const hasLikedPost = (post) =>
    post.likes?.some((id) => id.toString() === userId?.toString());

  const handleLikePost = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to like");

    try {
      const res = await axios.post(
        `${API_BASE}/post/like/${postId}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? res.data : p))
      );
    } catch {
      alert("Failed to toggle like");
    }
  };

  const handleComment = async (postId) => {
    const token = localStorage.getItem("token");
    const comment = commentTextMap[postId]?.trim();
    if (!token || !userId) return alert("Not authenticated");
    if (!comment) return alert("Comment cannot be empty");

    try {
      const res = await axios.post(
        `${API_BASE}/post/comment/${postId}`,
        { CommentText: comment, userId },
        { headers: { "x-auth-token": token } }
      );
      setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: res.data.comments }
            : p
        )
      );
    } catch {
      alert("Failed to post comment");
    }
  };

  const toggleCommentBox = (postId) => {
    setCommentBoxOpen((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleExpanded = (postId) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Instagram/Twitter style click handling on video container
  const handleVideoClick = (e, postId) => {
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.closest("input") ||
      (e.target.tagName === "VIDEO" && e.target.controls)
    ) {
      // Ignore clicks on buttons, links, inputs, or video controls
      return;
    }
    router.push(`/short/${postId}`);
  };

  const renderPost = useCallback(
    (post, index) => {
      const isExpanded = expandedPosts[post._id];
      const isVideo = post.mediaType?.startsWith("video");
      const commentText = commentTextMap[post._id] || "";
      const commentsVisible = commentBoxOpen[post._id];
      const title = post.title || "";
      const titleText = isExpanded
        ? title
        : title.slice(0, 100) + (title.length > 100 ? "..." : "");

      return (
        <div key={post._id} className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={"https://www.fondpeace.com/og-image.jpg"}
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="font-semibold text-gray-900">
              {post.userId?.username || "Unknown"}
            </span>
          </div>

          <p className="text-gray-800 mb-4">
            {titleText}
            {title.length > 100 && (
              <span
                className="text-blue-600 ml-2 cursor-pointer"
                onClick={() => toggleExpanded(post._id)}
              >
                {isExpanded ? " See less" : " See more"}
              </span>
            )}
          </p>

          {post.media && (
            <>
              {isVideo ? (
                <div
                  className="relative w-full max-w-[600px] aspect-square rounded-lg mb-4 overflow-hidden cursor-pointer mx-auto shadow-md"
                  onClick={(e) => handleVideoClick(e, post._id)}
                >
                  <video
                    ref={(ref) => (videoRefs.current[index] = ref)}
                    src={post.media}
                    autoPlay
                    loop
                    playsInline
                    
                    controls
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ) : (
                <img
                  src={post.media}
                  alt="media"
                  className="w-full max-w-[600px] aspect-square rounded-lg mb-4 object-cover shadow-md mx-auto"
                />
              )}
            </>
          )}

          <div className="flex justify-between items-center mb-4 text-gray-600">

            <button
              onClick={() => handleLikePost(post._id)}
              className={`text-sm font-medium ${
                hasLikedPost(post) ? "text-red-600" : "text-gray-600"
              }`}
            >
              {hasLikedPost(post) ? "💔 Dislike" : "❤️ Like"} (
              {post.likes?.length || 0})
            </button>
            <button
              onClick={() => toggleCommentBox(post._id)}
              className="text-sm text-gray-600"
            >
              💬 Comment ({post.comments?.length || 0})
            </button>
          </div>

          {commentsVisible && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) =>
                  setCommentTextMap((prev) => ({
                    ...prev,
                    [post._id]: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleComment(post._id)}
                className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
              >
                Post Comment
              </button>

              <div className="mt-4 space-y-2">
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
    },
    [commentTextMap, commentBoxOpen, expandedPosts, userId]
  );

  if (loading) return <div className="text-center p-6">Loading feed...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {posts.map((post, idx) => renderPost(post, idx))}
    </div>
  );
          }
