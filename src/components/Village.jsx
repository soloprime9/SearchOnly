// React JSX Feed Component with Tailwind CSS and Authentication Fix
import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [commentTextMap, setCommentTextMap] = useState({});
  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState({});
  const videoRefs = useRef([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('Token is not available');
      return (window.location.href = '/login');
    }

    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
        console.log('Invalid or expired token');
        localStorage.removeItem('token');
        return (window.location.href = '/login');
      }
    } catch (err) {
      console.log('Token decode error:', err);
      localStorage.removeItem('token');
      return (window.location.href = '/login');
    }

    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('https://backend-k.vercel.app/post/mango/getall');
      setPosts(data);
    } catch (err) {
      alert('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return alert('User not authenticated');

    try {
      await axios.post(
        `https://backend-k.vercel.app/post/like/${postId}`,
        {},
        { headers: { 'x-auth-token': storedToken } }
      );
      fetchPosts();
    } catch (err) {
      alert('Failed to like post');
    }
  };

  const handleComment = async (postId) => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('UserId');
    const commentText = commentTextMap[postId]?.trim();

    if (!storedToken || !storedUserId) {
      return alert('User not authenticated');
    }

    if (!commentText) {
      return alert('Comment cannot be empty');
    }

    try {
      await axios.post(
        `https://backend-k.vercel.app/post/comment/${postId}`,
        { CommentText: commentText, userId: storedUserId },
        { headers: { 'x-auth-token': storedToken } }
      );
      setCommentTextMap((prev) => ({ ...prev, [postId]: '' }));
      setCommentBoxOpen((prev) => ({ ...prev, [postId]: false }));
      fetchPosts();
    } catch (err) {
      alert('Failed to post comment');
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
      const isVideo = post.mediaType?.startsWith('video');
      const commentText = commentTextMap[post._id] || '';
      const commentsVisible = commentBoxOpen[post._id];
      const titleText = isExpanded
        ? post.title
        : post.title?.slice(0, 100) + (post.title?.length > 100 ? '...' : '');

      return (
        <div key={post._id} className="bg-white shadow-md rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={post?.userId?.profilePic || 'https://www.fondpeace.com/og-image.jpg'}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-semibold text-gray-800">
              {post?.userId?.username || 'Unknown User'}
            </span>
          </div>

          {post.title && (
            <p className="text-gray-700 mb-3">
              {titleText}
              {post.title.length > 100 && (
                <span
                  className="text-blue-600 cursor-pointer ml-2"
                  onClick={() => toggleExpanded(post._id)}
                >
                  {isExpanded ? 'See less' : 'See more'}
                </span>
              )}
            </p>
          )}

          {post.media && (
            isVideo ? (
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
            )
          )}

          <div className="flex gap-4 text-sm text-gray-600 mb-3">
            <button onClick={() => handleLikePost(post._id)} className="hover:text-blue-600">
              ❤️ Like ({post.likes?.length || 0})
            </button>
            <button onClick={() => toggleCommentBox(post._id)} className="hover:text-blue-600">
              💬 Comment
            </button>
          </div>

          {commentsVisible && (
            <div className="mt-3">
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) =>
                  setCommentTextMap((prev) => ({ ...prev, [post._id]: e.target.value }))
                }
              />
              <button
                onClick={() => handleComment(post._id)}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Post Comment
              </button>

              <div className="mt-4 space-y-3">
                {post.comments?.map((comment, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <img
                      src={comment?.userId?.profilePic || 'https://www.fondpeace.com/og-image.jpg'}
                      alt="comment-avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-sm">
                        {comment?.userId?.username || 'User'}
                      </p>
                      <p className="text-gray-700 text-sm">{comment?.CommentText}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    },
    [commentTextMap, commentBoxOpen, expandedPosts]
  );

  if (loading) return <div className="text-center p-6">Loading feed...</div>;

  return <div className="max-w-2xl mx-auto p-4">{posts.map((post, index) => renderPost(post, index))}</div>;
        }
                      
