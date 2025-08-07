"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { formatPostTime } from "@/components/DateFormate";
import Skeleton from "@/components/Skeleton";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function PostsManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef([]);
  const router = useRouter();

  // Check login status and redirect after 1 minute if not logged in
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setTimeout(() => {
          router.push("/login");
        }, 60000);
      }
    };
    checkLogin();
  }, [router]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("https://backend-k.vercel.app/post/mango/getall");
      setPosts(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Please login first");
      const res = await axios.post(
        `https://backend-k.vercel.app/post/like/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? res.data : post))
      );
    } catch (error) {
      console.error(error);
      toast.error("Error while liking post");
    }
  };

  const handleComment = async (postId, commentText) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Please login first");
      const res = await axios.post(
        `https://backend-k.vercel.app/comment/${postId}`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, comments: res.data.comments } : post
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to comment");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6">
      {loading ? (
        <Skeleton />
      ) : (
        posts.map((post, index) => (
          <div
            key={post._id}
            className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-gray-100"
          >
            <div className="flex items-center mb-2">
              <img
                src={post.userProfile || "/default-avatar.png"}
                alt="user"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-800">{post.username}</h3>
                <p className="text-xs text-gray-500">
                  {formatPostTime(post.createdAt)}
                </p>
              </div>
              <span className="ml-auto text-xl text-gray-500 cursor-pointer">
                ...
              </span>
            </div>

            <p className="mb-3 text-sm text-gray-700 whitespace-pre-line">
              {post.caption}
            </p>

            {post.media && post.media.endsWith(".mp4") ? (
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={post.media}
                className="rounded-xl w-full max-h-[500px] object-cover"
                controls
                autoPlay
                muted
              />
            ) : post.media ? (
              <img
                src={post.media}
                alt="post-media"
                className="rounded-xl w-full max-h-[500px] object-cover"
              />
            ) : null}

            <div className="flex items-center mt-4 space-x-4">
              <button
                onClick={() => handleLike(post._id)}
                className={`text-sm font-medium ${
                  post.likes.includes(localStorage.getItem("userId"))
                    ? "text-red-500"
                    : "text-gray-600"
                }`}
              >
                ❤️ {post.likes.length} Like
              </button>
              <span className="text-sm text-gray-600">
                💬 {post.comments.length} Comments
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const comment = e.target.comment.value;
                if (!comment.trim()) return;
                handleComment(post._id, comment);
                e.target.reset();
              }}
              className="mt-3"
            >
              <input
                type="text"
                name="comment"
                placeholder="Write a comment..."
                className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </form>

            {post.comments.slice(0, 2).map((comment, idx) => (
              <div key={idx} className="mt-2 pl-3 border-l-2 border-gray-200">
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">
                    {comment.username}:
                  </span>{" "}
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default PostsManager;
