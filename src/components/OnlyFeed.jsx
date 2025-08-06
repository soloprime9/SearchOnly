"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";

function PostsManager() {
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const commentRefs = useRef({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("https://backend-k.vercel.app/post/mango/getall");
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(
        `https://backend-k.vercel.app/post/like/${postId}`,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      fetchPosts();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    try {
      await axios.post(
        `https://backend-k.vercel.app/post/comment/${postId}`,
        { text: commentText },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setCommentText("");
      setSelectedPostId(null);
      fetchPosts();
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white shadow-md rounded-lg p-4 mb-6 border border-gray-200"
        >
          <h2 className="text-xl font-bold mb-2">{post.title}</h2>
          <p className="text-gray-700 mb-4">{post.description}</p>

          {post.media && post.media.endsWith(".mp4") ? (
            <video
              src={post.media}
              className="w-full rounded-lg"
              controls
              muted
              playsInline
            />
          ) : post.media ? (
            <img
              src={post.media}
              alt="Post media"
              className="w-full rounded-lg"
            />
          ) : null}

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => handleLike(post._id)}
              className="text-sm px-3 py-1 bg-blue-500 text-white rounded-md"
            >
              ❤️ {post.likes?.length || 0} Like
            </button>

            <button
              onClick={() =>
                setSelectedPostId(
                  selectedPostId === post._id ? null : post._id
                )
              }
              className="text-sm px-3 py-1 bg-gray-300 rounded-md"
            >
              💬 {post.comments?.length || 0} Comment
            </button>
          </div>

          {selectedPostId === post._id && (
            <form
              onSubmit={(e) => handleCommentSubmit(e, post._id)}
              className="mt-3"
            >
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 mb-2"
              />
              <button
                type="submit"
                className="text-sm px-3 py-1 bg-green-500 text-white rounded-md"
              >
                Post
              </button>
            </form>
          )}

          {post.comments?.length > 0 && (
            <div className="mt-4">
              {post.comments.map((comment, index) => (
                <p
                  key={index}
                  className="text-sm text-gray-800 border-t border-gray-200 pt-2"
                >
                  {comment.text}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default PostsManager;
  
