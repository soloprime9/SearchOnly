"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import jwt from "jsonwebtoken";

export default function SinglePostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [comment, setComment] = useState("");
  const videoRef = useRef(null);

  const API_BASE = "https://backend-k.vercel.app";

  // 🔹 Fetch logged in user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.UserId) setUserId(decoded.UserId);
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  // 🔹 Fetch single post + related posts
  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE}/post/single/${id}`);
        setPost(data.post);             // ✅ main post
        setRelatedPosts(data.related);  // ✅ related posts
      } catch (err) {
        console.error("Failed to load post", err);
        setPost(null);
        setRelatedPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // 🔹 Like/Dislike
  const handleLikePost = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to like");
    try {
      const res = await axios.post(
        `${API_BASE}/post/like/${post._id}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      setPost(res.data);
    } catch {
      alert("Failed to toggle like");
    }
  };

  // 🔹 Add comment
  const handleComment = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userId) return alert("Not authenticated");
    if (!comment.trim()) return alert("Comment cannot be empty");

    try {
      const res = await axios.post(
        `${API_BASE}/post/comment/${post._id}`,
        { CommentText: comment, userId },
        { headers: { "x-auth-token": token } }
      );
      setComment("");
      setPost((prev) => ({ ...prev, comments: res.data.comments }));
    } catch {
      alert("Failed to post comment");
    }
  };

  // 🔹 Prevent right-click
  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);
    return () => document.removeEventListener("contextmenu", disableRightClick);
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!post) return <div className="p-6 text-center">Post not found</div>;

  const isVideo = post.mediaType?.startsWith("video");
  const hasLiked = post.likes?.some((id) => id.toString() === userId?.toString());

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Main Post */}
      <div className="bg-white shadow rounded-lg p-4">
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

        <p className="text-gray-800 mb-4">{post.title}</p>

        {post.media && (
          <>
            {isVideo ? (
              <video
                ref={videoRef}
                src={post.media}
                controls
                className="w-full max-w-[600px] aspect-square rounded-lg mb-4 object-cover mx-auto"
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <img
                src={post.media}
                alt="media"
                className="w-full max-w-[600px] aspect-square rounded-lg mb-4 object-cover mx-auto"
                onContextMenu={(e) => e.preventDefault()}
              />
            )}
          </>
        )}

        {/* Likes & Comments */}
        <div className="flex justify-between items-center mb-4 text-gray-600">
          <button
            onClick={handleLikePost}
            className={`text-sm font-medium ${
              hasLiked ? "text-red-600" : "text-gray-600"
            }`}
          >
            {hasLiked ? "💔 Dislike" : "❤️ Like"} ({post.likes?.length || 0})
          </button>
          <span className="text-sm">💬 {post.comments?.length || 0} Comments</span>
        </div>

        {/* Add Comment */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleComment}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
          >
            Post Comment
          </button>
        </div>

        {/* Show Comments */}
        <div className="mt-4 space-y-2">
          {post.comments?.map((cmt, i) => (
            <div key={i} className="bg-gray-100 p-3 rounded-md">
              <p className="font-semibold text-gray-800">
                {cmt.userId?.username || "User"}
              </p>
              <p className="text-gray-700">{cmt.CommentText}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
            Related Posts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedPosts.map((rel) => (
              <div
                key={rel._id}
                onClick={() => router.push(`/post/${rel._id}`)}
                className="cursor-pointer bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                {rel.mediaType?.startsWith("video") ? (
                  <video
                    src={rel.media}
                    muted
                    className="w-full h-48 object-cover"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                ) : (
                  <img
                    src={rel.media}
                    alt={rel.title}
                    className="w-full h-48 object-cover"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                )}
                <div className="p-3">
                  <p className="font-semibold text-gray-900 line-clamp-2">
                    {rel.title}
                  </p>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>❤️ {rel.likes?.length || 0}</span>
                    <span>💬 {rel.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

