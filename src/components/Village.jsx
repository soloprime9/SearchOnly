import React, { useCallback, useEffect, useRef, useState } from "react";
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

  const API_BASE = "https://backend-k.vercel.app";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "/login");

    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return (window.location.href = "/login");
      }
      setUserId(decoded.UserId);
      fetchPosts();
    } catch (err) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/post/mango/getall`);
      setPosts(data);
    } catch (err) {
      alert("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const hasLikedPost = (post) =>
    post.likes?.some((id) => id.toString() === userId?.toString());

  const handleLikePost = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to like");

    try {
      await axios.post(
        `${API_BASE}/post/like/${postId}`,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      fetchPosts(); // Refresh posts after like toggle
    } catch (err) {
      console.error("Like error:", err);
      alert("Failed to toggle like");
    }
  };

  const handleComment = async (postId) => {
    const token = localStorage.getItem("token");
    const comment = commentTextMap[postId]?.trim();

    if (!token || !userId) return alert("Not authenticated");
    if (!comment) return alert("Comment cannot be empty");

    try {
      await axios.post(
        `${API_BASE}/post/comment/${postId}`,
        { CommentText: comment, userId },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (err) {
      console.error("Comment error:", err);
      alert("Failed to post comment");
    }
  };

  const toggleCommentBox = (postId) => {
    setCommentBoxOpen((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleExpanded = (postId) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
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
          {/* User Info */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src={
                post?.userId?.profilePic ||
                "https://www.fondpeace.com/og-image.jpg"
              }
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-semibold text-gray-800">
              {post?.userId?.username || "Unknown"}
            </span>
          </div>

          {/* Title */}
          <p className="text-gray-700 mb-3">
            {titleText}
            {title.length > 100 && (
              <span
                className="text-blue-600 ml-2 cursor-pointer"
                onClick={() => toggleExpanded(post._id)}
              >
                {isExpanded ? "See less" : "See more"}
              </span>
            )}
          </p>

          {/* Media */}
          {post.media &&
            (isVideo ? (
              <video
                ref={(ref) => (videoRefs.current[index] = ref)}
                src={post.media}
                controls
                className="w-full rounded-lg mb-3"
              />
            ) : (
              <img
                src={post.media}
                alt="media"
                className="w-full rounded-lg mb-3 object-cover"
              />
            ))}

          {/* Like & Comment Actions */}
          <div className="flex gap-4 text-sm text-gray-700 mb-3">
            <button
              onClick={() => handleLikePost(post._id)}
              className="hover:text-red-500 transition"
            >
              {hasLikedPost(post) ? "💔 Dislike" : "❤️ Like"} (
              {post.likes?.length || 0})
            </button>
            <button
              onClick={() => toggleCommentBox(post._id)}
              className="hover:text-blue-500 transition"
            >
              💬 Comment ({post.comments?.length || 0})
            </button>
          </div>

          {/* Comment Box */}
          {commentsVisible && (
            <div className="mt-3">
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) =>
                  setCommentTextMap((prev) => ({
                    ...prev,
                    [post._id]: e.target.value,
                  }))
                }
              />
              <button
                onClick={() => handleComment(post._id)}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Post Comment
              </button>

              {/* Display Comments */}
              <div className="mt-4 space-y-3">
                {post.comments?.map((comment, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <img
                      src={
                        comment?.userId?.profilePic ||
                        "https://www.fondpeace.com/og-image.jpg"
                      }
                      alt="comment-avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-sm">
                        {comment?.userId?.username || "User"}
                      </p>
                      <p className="text-gray-700 text-sm">
                        {comment?.CommentText}
                      </p>
                    </div>
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
    <div className="max-w-2xl mx-auto p-4">
      {posts.map((post, index) => renderPost(post, index))}
    </div>
  );
}
