// Converted React Web JSX Component
// Assumes you use localStorage instead of AsyncStorage and an HTML5 video tag

import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [commentTextMap, setCommentTextMap] = useState({});
  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState({});
  const videoRefs = useRef([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('UserId');

    if (!storedToken || !storedUserId) {
      alert('Authentication Error: Please login again.');
      return;
    }

    setToken(storedToken);
    setUserId(storedUserId);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("https://backend-k.vercel.app/post/mango/getall");
      setPosts(data);
    } catch (err) {
      alert('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    if (!token) return alert('User not authenticated');
    try {
      await axios.post(`https://backend-k.vercel.app/post/like/${postId}`, {}, {
        headers: { 'x-auth-token': token }
      });
      fetchPosts();
    } catch (err) {
      alert('Failed to like post');
    }
  };

  const handleComment = async (postId) => {
    const commentText = commentTextMap[postId];
    if (!token || !userId || !commentText?.trim()) {
      alert('Comment cannot be empty or unauthenticated');
      return;
    }
    try {
      await axios.post(
        `https://backend-k.vercel.app/post/comment/${postId}`,
        { CommentText: commentText, userId },
        { headers: { 'x-auth-token': token } }
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

  const renderPost = useCallback((post, index) => {
    const isExpanded = expandedPosts[post._id];
    const isVideo = post.mediaType?.startsWith('video');
    const commentText = commentTextMap[post._id] || '';
    const commentsVisible = commentBoxOpen[post._id];
    const titleText = isExpanded ? post.title : post.title?.slice(0, 100) + (post.title?.length > 100 ? '...' : '');

    return (
      <div key={post._id} className="post">
        <div className="post-header">
          <img src={post?.userId?.profilePic || "https://www.fondpeace.com/og-image.jpg"} alt="avatar" className="avatar" />
          <span>{post?.userId?.username || 'Unknown User'}</span>
        </div>

        {post.title && (
          <p>
            {titleText}
            {post.title.length > 100 && (
              <span className="see-more" onClick={() => toggleExpanded(post._id)}>
                {isExpanded ? ' See less' : ' See more'}
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
              className="media"
            />
          ) : (
            <img src={post.media} alt="media" className="media" />
          )
        )}

        <div className="actions">
          <button onClick={() => handleLikePost(post._id)}>Like ({post.likes?.length || 0})</button>
          <button onClick={() => toggleCommentBox(post._id)}>Comment</button>
        </div>

        {commentsVisible && (
          <div className="comments">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentTextMap((prev) => ({ ...prev, [post._id]: e.target.value }))}
            />
            <button onClick={() => handleComment(post._id)}>Post Comment</button>
            <div className="comment-list">
              {post.comments?.map((comment, i) => (
                <div key={i} className="comment-item">
                  <img src={comment?.userId?.profilePic || 'https://www.fondpeace.com/og-image.jpg'} alt="avatar" className="comment-avatar" />
                  <div>
                    <strong>{comment?.userId?.username || 'User'}</strong>
                    <p>{comment?.CommentText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }, [commentTextMap, commentBoxOpen, expandedPosts]);

  if (loading) return <div className="loading">Loading feed...</div>;

  return (
    <div className="feed">
      {posts.map((post, index) => renderPost(post, index))}
    </div>
  );
  }
            
