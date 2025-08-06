'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const commentRefs = useRef({});

  const fetchPosts = async () => {
    try {
      const res = await axios.get('https://backend-k.vercel.app/posts');
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      await axios.put(`https://backend-k.vercel.app/posts/${postId}/like`);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleComment = async (postId) => {
    const comment = commentRefs.current[postId]?.value.trim();
    if (!comment) return;
    try {
      await axios.post(`https://backend-k.vercel.app/posts/${postId}/comment`, {
        text: comment,
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, { text: comment }] }
            : post
        )
      );
      commentRefs.current[postId].value = '';
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  if (loading) return <p>Loading posts...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      {posts.map((post) => (
        <div key={post._id} className="border rounded-lg p-4 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
          <p className="mb-2">{post.content}</p>
          {post.media && (
            post.media.endsWith('.mp4') ? (
              <video
                className="rounded-lg w-full my-2"
                src={post.media}
                controls
              />
            ) : (
              <img className="rounded-lg w-full my-2" src={post.media} alt="Post media" />
            )
          )}

          <div className="flex items-center space-x-4 mt-2">
            <button
              className="text-red-600 font-bold text-lg"
              onClick={() => handleLike(post._id)}
            >
              ♥
            </button>
            <span>{post.likes} likes</span>
            <span className="ml-auto">⋮</span>
          </div>

          <div className="mt-4">
            <input
              ref={(el) => (commentRefs.current[post._id] = el)}
              type="text"
              placeholder="Add a comment..."
              className="w-full p-2 border rounded mb-2"
            />
            <button
              onClick={() => handleComment(post._id)}
              className="bg-blue-500 text-white px-4 py-1 rounded"
            >
              Comment
            </button>
          </div>

          <div className="mt-2">
            {post.comments?.map((c, index) => (
              <p key={index} className="text-sm text-gray-700">
                {c.text}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Posts;
            
