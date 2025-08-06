'use client';
import axios from "axios";
import { useEffect, useState } from "react";
import jwt from 'jsonwebtoken';
import { Link } from "react-router-dom";
import Image from "next/image";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [CommentText, setCommentText] = useState("");
  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  const [UserId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("Token is not available");
      return (window.location.href = "/login");
    }

    try {
      const decoded = jwt.decode(token);
      console.log("Decoded token data:", decoded);
      if (!decoded || !decoded.exp) {
        console.log("Token or Exp Missing");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      if (decoded.exp * 1000 < Date.now()) {
        console.log("Now Going to Redirect on Login Page");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      setUserId(decoded.id);
    } catch (err) {
      console.log("Invalid Token:", err);
      localStorage.removeItem("token");
      return (window.location.href = "/login");
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get("https://backend-k.vercel.app/post/mango/getall");
      setPosts(data);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLikePost = async (postId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`https://backend-k.vercel.app/post/like/${postId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleComment = async (postId) => {
    const token = localStorage.getItem("token");
    if (!CommentText.trim()) return alert("Comment cannot be empty");

    try {
      await axios.post(
        `https://backend-k.vercel.app/post/comment/${postId}`,
        { CommentText, UserId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCommentText("");
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const toggleCommentBox = (postId) => {
    setCommentBoxOpen((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="m-2 flex justify-center">
      <div className="sm:w-full">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="md:w-80 md:h-100 border-2 rounded-md border-blue-200 p-2 mb-2">
              <div className="flex items-center mb-2">
                <img src={post?.UserId?.profilePic || "/1.jpg"} alt="User" className="w-10 h-10 rounded-full mr-3" />
                <h2 className="text-xl font-semibold">
                  <a href={`/profile/${post?.userId?.username}`}>{post?.userId?.username || "Unknown User"}</a>
                </h2>
              </div>
              <div className="rounded-md overflow-hidden border-t-2">
                {post.media ? (
                  post.media.endsWith(".mp4") ? (
                    <video src={post.media} className="w-full h-64 object-cover" controls muted />
                  ) : (
                    <img src={post.media} alt="Post" className="w-full h-64 object-cover" />
                  )
                ) : (
                  <div></div>
                )}
              </div>
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => handleLikePost(post._id)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                >
                  ❤️ Like ({post.likes?.length || 0})
                </button>
                <button
                  onClick={() => toggleCommentBox(post._id)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
                >
                  💬 Comment
                </button>
              </div>
              {commentBoxOpen[post._id] && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={CommentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-2 border rounded mb-2"
                  />
                  <button
                    onClick={() => handleComment(post._id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                  >
                    Post Comment
                  </button>
                  <ul className="mt-2">
                    {post.comments.map((comment) => (
                      <li key={comment._id} className="border-b py-1">
                        <strong>{comment.UserId?.username || "Anonymous"}:</strong> {comment.CommentText}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div role="status" className="flex justify-center">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
