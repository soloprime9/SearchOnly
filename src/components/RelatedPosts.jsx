"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import jwt from "jsonwebtoken";
import toast from "react-hot-toast";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShareAlt,
  FaEye,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";

// Elegant Shimmer Skeleton Loader Component
const PostSkeleton = () => (
  <div className="w-full max-w-[550px] mx-auto mb-6 bg-white border border-slate-100 sm:rounded-2xl p-4 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-slate-200 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-200 rounded w-1/3" />
        <div className="h-2.5 bg-slate-200 rounded w-1/4" />
      </div>
    </div>
    <div className="w-full aspect-[4/5] bg-slate-200 rounded-xl mb-4" />
    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-slate-200 rounded w-1/2" />
  </div>
);

export default function RelatedPosts() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const observerRef = useRef(null);
  const viewObserver = useRef(null);
  const videoRefs = useRef({});
  const viewedPosts = useRef(new Set());

  const [commentTextMap, setCommentTextMap] = useState({});
  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [userId, setUserId] = useState(null);
  const [mutedMap, setMutedMap] = useState({});
  const [copiedPostId, setCopiedPostId] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://backend-k.vercel.app";

  // Decode User Authentication Status
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUserId(decoded.UserId);
      }
    } catch (e) {
      console.error("Token error");
    }
  }, []);

  // Fetch Page 1 Data
  useEffect(() => {
    if (!initialLoad) return;
    setLoading(true);
    setInitialLoad(false);

    axios
      .get(`${API_BASE}/post/related/mango/getall?page=1`)
      .then((res) => {
        const data = res.data;
        if (!Array.isArray(data) || data.length === 0) {
          setHasMore(false);
          setPosts([]);
        } else {
          setPosts(data);
          setHasMore(true);
          setPage(1);
        }
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load feed pipeline");
        setHasMore(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fetch Next Pages
  useEffect(() => {
    if (page === 1 || !hasMore || loading) return;
    setLoading(true);

    axios
      .get(`${API_BASE}/post/related/mango/getall?page=${page}`)
      .then((res) => {
        const data = res.data;
        if (!Array.isArray(data) || data.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prev) => [...prev, ...data]);
        }
      })
      .catch((error) => {
        console.error("Error fetching next page:", error);
        setHasMore(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page]);

  const increaseView = useCallback((postId) => {
    if (viewedPosts.current.has(postId)) return;
    viewedPosts.current.add(postId);
    axios.post(`${API_BASE}/analytics/view`, { postId }).catch(() => {});
  }, [API_BASE]);

  // View Tracker Observer - Syncs routing links, autoplays, and metadata document titles
  useEffect(() => {
    viewObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.dataset.postid;
            if (postId) {
              increaseView(postId);

              const post = posts.find((p) => p._id === postId);
              if (post) {
                const isVideo =
                  post.mediaType?.startsWith("video") ||
                  post.media?.match(/\.(mp4|mov|webm|mkv)$/i);
                const path = isVideo ? "shorts" : "post";

                // Silent Routing URL Switch
                window.history.replaceState(null, "", `/${path}/${postId}`);

                // CRITICAL FIX: Update document metadata dynamically when page content focus changes
                if (post.title) {
                  document.title = `${post.title}`;
                }
              }

              const video = videoRefs.current[postId];
              if (video) video.play().catch(() => {});
            }
          } else {
            const postId = entry.target.dataset.postid;
            const video = videoRefs.current[postId];
            if (video) video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    return () => viewObserver.current?.disconnect();
  }, [increaseView, posts]);

  useEffect(() => {
    const elements = document.querySelectorAll(".feed-post-item");
    elements.forEach((el) => {
      if (viewObserver.current) viewObserver.current.observe(el);
    });
    return () => {
      elements.forEach((el) => {
        if (viewObserver.current) viewObserver.current.unobserve(el);
      });
    };
  }, [posts]);

  const lastPostRef = useCallback(
    (node) => {
      if (!hasMore || loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [hasMore, loading]
  );

  const hasLikedPost = useCallback(
    (post) => {
      if (!userId || !Array.isArray(post.likes)) return false;
      return post.likes.some((id) => id?.toString() === userId.toString());
    },
    [userId]
  );

  const handleLikePost = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to leave interactions");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE}/post/like/${postId}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: res.data.likes } : p
        )
      );
    } catch (err) {
      toast.error("Action error, try again");
    }
  };

  const handleComment = async (postId) => {
    const token = localStorage.getItem("token");
    const comment = commentTextMap[postId]?.trim();
    if (!token || !comment) return;

    try {
      const res = await axios.post(
        `${API_BASE}/post/comment/${postId}`,
        { CommentText: comment, userId },
        { headers: { "x-auth-token": token } }
      );
      setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, comments: res.data.comments } : p
        )
      );
      toast.success("Comment published 💬");
    } catch {
      toast.error("Could not post comment");
    }
  };

  const toggleMute = (postId) => {
    const video = videoRefs.current[postId];
    if (video) {
      video.muted = !video.muted;
      setMutedMap((prev) => ({ ...prev, [postId]: video.muted }));
    }
  };

  const handleShare = (post) => {
    try {
      const isVideo =
        post.mediaType?.startsWith("video") ||
        post.media?.match(/\.(mp4|mov|webm|mkv)$/i);
      const path = isVideo ? "shorts" : "post";
      const url = `${window.location.origin}/${path}/${post._id}`;
      
      navigator.clipboard.writeText(url);
      setCopiedPostId(post._id);
      setTimeout(() => setCopiedPostId(null), 2500);
      toast.success("Link copied to clipboard ✨");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const renderPost = useCallback(
    (post, index) => {
      const isExpanded = expandedPosts[post._id];
      const isVideo =
        post.mediaType?.startsWith("video") ||
        post.media?.match(/\.(mp4|mov|webm|mkv)$/i);
      const title = post.title || "";
      const titleText = isExpanded
        ? title
        : title.slice(0, 95) + (title.length > 95 ? "..." : "");

      return (
        <article
          key={post._id}
          data-postid={post._id}
          className="feed-post-item bg-white w-full max-w-[550px] mx-auto mb-4 sm:mb-8 sm:rounded-2xl overflow-hidden border-y sm:border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 h-14">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${post.userId?.username}`} className="relative group">
                <div className="w-9 h-9 rounded-full p-[1.5px] bg-slate-100 hover:scale-105 transition-transform">
                  <img
                    src={post.userId?.profilePic || "/Fondpeace.jpg"}
                    alt="profile"
                    className="w-full h-full rounded-full object-cover"
                    loading="lazy"
                  />
                </div>
              </Link>
              <Link href={`/profile/${post.userId?.username}`} className="flex flex-col">
                <span className="text-[13.5px] font-bold text-slate-900 hover:text-blue-600 transition-colors leading-none">
                  {post.userId?.username || "Unknown"}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 font-medium">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </Link>
            </div>
            <button
              onClick={() => toast("Feature launching soon 🚀")}
              className="text-slate-400 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-50 transition"
            >
              <span className="text-sm tracking-wider font-black">•••</span>
            </button>
          </div>

          {/* MEDIA CONTENT ROW */}
          {post.media && (
            <div className="relative w-full bg-slate-950 flex items-center justify-center overflow-hidden aspect-[4/5]">
              <Link
                href={isVideo ? `/shorts/${post._id}` : `/post/${post._id}`}
                className="w-full h-full flex items-center justify-center"
              >
                {isVideo ? (
                  <video
                    ref={(ref) => (videoRefs.current[post._id] = ref)}
                    src={post.media}
                    loop
                    playsInline
                    muted={mutedMap[post._id] !== false}
                    preload="metadata"
                    poster={post.thumbnail || post.image}
                    className="w-full h-full object-cover block mx-auto"
                  />
                ) : (
                  <img
                    src={post.media}
                    alt={post.title}
                    className="w-full h-full object-contain block mx-auto transition-transform duration-500 hover:scale-[1.02]"
                    loading="lazy"
                  />
                )}
              </Link>

              {isVideo && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMute(post._id);
                  }}
                  className="absolute bottom-4 right-4 bg-slate-900/60 text-white p-2.5 rounded-full backdrop-blur-md hover:bg-slate-900/80 transition active:scale-90"
                >
                  {mutedMap[post._id] ? <FaVolumeMute size={13} /> : <FaVolumeUp size={13} />}
                </button>
              )}
            </div>
          )}

          {/* INTERACTION SUITE */}
          <div className="px-4 pt-3.5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4.5">
                {/* Like Action */}
                <button
                  onClick={() => handleLikePost(post._id)}
                  className="flex items-center gap-1.5 group transition"
                >
                  {hasLikedPost(post) ? (
                    <FaHeart className="text-rose-500 text-[23px] scale-100 active:scale-125 transition-transform" />
                  ) : (
                    <FaRegHeart className="text-[23px] text-slate-800 group-hover:text-rose-500 transition-colors" />
                  )}
                  <span className="font-bold text-[13px] text-slate-700">
                    {post.likes?.length || 0}
                  </span>
                </button>

                {/* Comment Toggle */}
                <button
                  onClick={() =>
                    setCommentBoxOpen((p) => ({
                      ...p,
                      [post._id]: !commentBoxOpen[post._id],
                    }))
                  }
                  className="flex items-center gap-1.5 group transition"
                >
                  <FaCommentDots className="text-[22px] text-slate-800 group-hover:text-blue-500 transition-colors" />
                  <span className="font-bold text-[13px] text-slate-700">
                    {post.comments?.length || 0}
                  </span>
                </button>

                {/* Share Link Action */}
                <div className="relative">
                  <button
                    onClick={() => handleShare(post)}
                    className="flex items-center text-slate-800 hover:text-emerald-500 transition-colors"
                  >
                    <FaShareAlt className="text-[20px]" />
                  </button>
                  {copiedPostId === post._id && (
                    <span className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md shadow-md whitespace-nowrap font-medium animate-bounce">
                      Copied!
                    </span>
                  )}
                </div>
              </div>

              {/* Minimal Metric Counter */}
              <div className="flex items-center gap-1 text-slate-400 font-medium text-xs">
                <FaEye size={13} />
                <span>{post.views?.toLocaleString() || 0} views</span>
              </div>
            </div>

            {/* Structured Caption Layout */}
            <div className="space-y-2">
              <div className="text-[14px] text-slate-800 leading-normal">
                <span className="font-bold text-slate-900 mr-2 hover:underline cursor-pointer">
                  {post.userId?.username}
                </span>
                <span className="whitespace-pre-wrap text-slate-700">{titleText}</span>
                {title.length > 95 && (
                  <button
                    onClick={() =>
                      setExpandedPosts((p) => ({
                        ...p,
                        [post._id]: !isExpanded,
                      }))
                    }
                    className="text-blue-600 font-semibold text-xs ml-1 hover:underline"
                  >
                    {isExpanded ? "less" : "more"}
                  </button>
                )}
              </div>

              {/* Comment Thread Toggle Header */}
              {post.comments?.length > 0 && !commentBoxOpen[post._id] && (
                <button
                  onClick={() =>
                    setCommentBoxOpen((p) => ({ ...p, [post._id]: true }))
                  }
                  className="text-xs text-slate-400 hover:text-slate-600 transition font-semibold block"
                >
                  View all {post.comments.length} comments
                </button>
              )}
            </div>

            {/* Comment Drawer Section */}
            {commentBoxOpen[post._id] && (
              <div className="mt-3.5 pt-3.5 border-t border-slate-100/70">
                <div className="space-y-2.5 mb-3.5 max-h-40 overflow-y-auto pr-1">
                  {post.comments?.map((cmt, i) => (
                    <div key={i} className="flex gap-2 text-[13px] items-start">
                      <span className="font-bold text-slate-900 whitespace-nowrap">
                        {cmt?.userId?.username || "User"}
                      </span>
                      <span className="text-slate-600 leading-normal">
                        {cmt?.CommentText}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Inline Sticky Adding Field */}
                <div className="flex items-center gap-2 mt-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <input
                    type="text"
                    placeholder="Write a response..."
                    value={commentTextMap[post._id] || ""}
                    onChange={(e) =>
                      setCommentTextMap((p) => ({
                        ...p,
                        [post._id]: e.target.value,
                      }))
                    }
                    className="flex-1 text-xs bg-transparent outline-none text-slate-800 placeholder-slate-400"
                  />
                  <button
                    onClick={() => handleComment(post._id)}
                    disabled={!commentTextMap[post._id]?.trim()}
                    className="text-blue-600 text-xs font-bold disabled:opacity-20 hover:text-blue-700 transition"
                  >
                    Publish
                  </button>
                </div>
              </div>
            )}
          </div>
        </article>
      );
    },
    [commentTextMap, commentBoxOpen, expandedPosts, userId, mutedMap, copiedPostId]
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-0 sm:px-4">
      {/* Initial Array Loading State - Replaced spinner with shimmers */}
      {initialLoad && loading && (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {/* Render Dynamic Feed */}
      {!initialLoad && posts && posts.length > 0 ? (
        <>
          {posts.map((post, idx) => {
            const isLast = idx === posts.length - 1;
            return (
              <div
                key={post._id}
                ref={(node) => {
                  if (isLast) lastPostRef(node);
                }}
              >
                {renderPost(post, idx)}
              </div>
            );
          })}

          {/* Pagination Shimmer Row */}
          {loading && !initialLoad && (
            <div className="py-4">
              <PostSkeleton />
            </div>
          )}

          {/* Terminal End of Content Section */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-14 px-4 border-t border-slate-100 mt-8">
              <p className="font-bold text-slate-800 text-[15px]">You're caught up completely 🎉</p>
              <p className="text-xs text-slate-400 mt-1">Check back later for fresh updates</p>
              <Link href="/" className="text-xs text-blue-600 font-bold hover:underline mt-3 block">
                Return to home catalog →
              </Link>
            </div>
          )}
        </>
      ) : (
        !initialLoad &&
        !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <p className="text-slate-400 font-medium text-sm mb-3">No matching feed items right now</p>
            <Link href="/" className="text-xs bg-slate-900 text-white font-semibold px-4 py-2 rounded-xl hover:bg-slate-800 transition">
              Go back home
            </Link>
          </div>
        )
      )}
    </div>
  );
}









// "use client";

// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import Link from "next/link";
// import jwt from "jsonwebtoken";
// import toast from "react-hot-toast";
// import {
//   FaHeart,
//   FaRegHeart,
//   FaCommentDots,
//   FaShareAlt,
//   FaEye,
//   FaVolumeMute,
//   FaVolumeUp,
// } from "react-icons/fa";

// export default function RelatedPosts() {
//   const [posts, setPosts] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [initialLoad, setInitialLoad] = useState(true);

//   const observerRef = useRef(null);
//   const viewObserver = useRef(null);
//   const videoRefs = useRef({});
//   const viewedPosts = useRef(new Set());

//   const [commentTextMap, setCommentTextMap] = useState({});
//   const [commentBoxOpen, setCommentBoxOpen] = useState({});
//   const [expandedPosts, setExpandedPosts] = useState({});
//   const [userId, setUserId] = useState(null);
//   const [mutedMap, setMutedMap] = useState({});
//   const [copiedPostId, setCopiedPostId] = useState(null);

//   const router = useRouter();
//   const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://backend-k.vercel.app";

//   // ==========================================
//   // GET USER ID FROM TOKEN
//   // ==========================================
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;
//     try {
//       const decoded = jwt.decode(token);
//       if (decoded && decoded.exp * 1000 > Date.now()) {
//         setUserId(decoded.UserId);
//       }
//     } catch (e) {
//       console.error("Token error");
//     }
//   }, []);

//   // ==========================================
//   // FETCH POSTS FROM API (Page 1 on mount)
//   // ==========================================
//   useEffect(() => {
//     if (!initialLoad) return;

//     setLoading(true);
//     setInitialLoad(false);

//     axios
//       .get(`${API_BASE}/post/mango/getall?page=1`)
//       .then((res) => {
//         const data = res.data;

//         if (!Array.isArray(data) || data.length === 0) {
//           setHasMore(false);
//           setPosts([]);
//         } else {
//           setPosts(data);
//           setHasMore(true);
//           setPage(1);
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching posts:", error);
//         toast.error("Failed to load posts");
//         setHasMore(false);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   // ==========================================
//   // FETCH NEXT PAGE (Pagination)
//   // ==========================================
//   useEffect(() => {
//     if (page === 1 || !hasMore || loading) return;

//     setLoading(true);

//     axios
//       .get(`${API_BASE}/post/mango/getall?page=${page}`)
//       .then((res) => {
//         const data = res.data;

//         if (!Array.isArray(data) || data.length === 0) {
//           setHasMore(false);
//         } else {
//           setPosts((prev) => [...prev, ...data]);
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching next page:", error);
//         setHasMore(false);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, [page]);

//   // ==========================================
//   // INCREASE VIEW (Your exact logic)
//   // ==========================================
//   const increaseView = useCallback((postId) => {
//     if (viewedPosts.current.has(postId)) return;

//     viewedPosts.current.add(postId);
//     console.log("📊 VIEW +1:", postId);

//     axios.post(`${API_BASE}/analytics/view`, { postId }).catch(() => {});
//   }, [API_BASE]);

//   // ==========================================
//   // VIEW OBSERVER: Track views + Update URL + Autoplay
//   // ==========================================
//   useEffect(() => {
//     viewObserver.current = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             const postId = entry.target.dataset.postid;
//             if (postId) {
//               // 1. Track view
//               increaseView(postId);

//               // 2. Update URL silently
//               const post = posts.find((p) => p._id === postId);
//               const isVideo =
//                 post?.mediaType?.startsWith("video") ||
//                 post?.media?.match(/\.(mp4|mov|webm|mkv)$/i);
//               const path = isVideo ? "shorts" : "post";

//               window.history.replaceState(null, "", `/${path}/${postId}`);

//               // 3. Play video if exists
//               const video = videoRefs.current[postId];
//               if (video) video.play().catch(() => {});
//             }
//           } else {
//             // Pause video when out of view
//             const postId = entry.target.dataset.postid;
//             const video = videoRefs.current[postId];
//             if (video) video.pause();
//           }
//         });
//       },
//       { threshold: 0.65 }
//     );

//     return () => viewObserver.current?.disconnect();
//   }, [increaseView, posts]);

//   // ==========================================
//   // OBSERVE ALL POSTS
//   // ==========================================
//   useEffect(() => {
//     const elements = document.querySelectorAll(".feed-post-item");
//     elements.forEach((el) => {
//       if (viewObserver.current) viewObserver.current.observe(el);
//     });

//     return () => {
//       elements.forEach((el) => {
//         if (viewObserver.current) viewObserver.current.unobserve(el);
//       });
//     };
//   }, [posts]);

//   // ==========================================
//   // INFINITE SCROLL - Load next page
//   // ==========================================
//   const lastPostRef = useCallback(
//     (node) => {
//       if (!hasMore || loading) return;

//       if (observerRef.current) observerRef.current.disconnect();

//       observerRef.current = new IntersectionObserver((entries) => {
//         if (entries[0].isIntersecting) {
//           setPage((prev) => prev + 1);
//         }
//       });

//       if (node) observerRef.current.observe(node);
//     },
//     [hasMore, loading]
//   );

//   // ==========================================
//   // HANDLERS
//   // ==========================================
//   const hasLikedPost = useCallback(
//     (post) => {
//       if (!userId || !Array.isArray(post.likes)) return false;
//       return post.likes.some((id) => id?.toString() === userId.toString());
//     },
//     [userId]
//   );

//   const handleLikePost = async (postId) => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       toast.error("Please login to like");
//       return;
//     }
//     try {
//       const res = await axios.post(
//         `${API_BASE}/post/like/${postId}`,
//         {},
//         { headers: { "x-auth-token": token } }
//       );
//       setPosts((prev) =>
//         prev.map((p) =>
//           p._id === postId ? { ...p, likes: res.data.likes } : p
//         )
//       );
//       toast.success("Liked! ❤️");
//     } catch (err) {
//       toast.error("Failed to like");
//     }
//   };

//   const handleComment = async (postId) => {
//     const token = localStorage.getItem("token");
//     const comment = commentTextMap[postId]?.trim();
//     if (!token || !comment) return;

//     try {
//       const res = await axios.post(
//         `${API_BASE}/post/comment/${postId}`,
//         { CommentText: comment, userId },
//         { headers: { "x-auth-token": token } }
//       );
//       setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
//       setPosts((prev) =>
//         prev.map((p) =>
//           p._id === postId ? { ...p, comments: res.data.comments } : p
//         )
//       );
//       toast.success("Comment added! 💬");
//     } catch {
//       toast.error("Error adding comment");
//     }
//   };

//   const toggleMute = (postId) => {
//     const video = videoRefs.current[postId];
//     if (video) {
//       video.muted = !video.muted;
//       setMutedMap((prev) => ({ ...prev, [postId]: video.muted }));
//     }
//   };

//   const handleShare = (post) => {
//     try {
//       const isVideo =
//         post.mediaType?.startsWith("video") ||
//         post.media?.match(/\.(mp4|mov|webm|mkv)$/i);
//       const path = isVideo ? "shorts" : "post";

//       const url = `${window.location.origin}/${path}/${post._id}`;
//       const shareText = `${post.title || "Check this out!"}\n${url}`;

//       navigator.clipboard.writeText(shareText);
//       setCopiedPostId(post._id);
//       setTimeout(() => setCopiedPostId(null), 2500);
//     } catch (err) {
//       console.error("Failed to copy:", err);
//     }
//   };

//   // ==========================================
//   // RENDER POST CARD
//   // ==========================================
//   const renderPost = useCallback(
//     (post, index) => {
//       const isExpanded = expandedPosts[post._id];
//       const isVideo =
//         post.mediaType?.startsWith("video") ||
//         post.media?.match(/\.(mp4|mov|webm|mkv)$/i);
//       const title = post.title || "";
//       const titleText = isExpanded
//         ? title
//         : title.slice(0, 100) + (title.length > 100 ? "..." : "");

//       return (
//         <article
//           key={post._id}
//           data-postid={post._id}
//           className="feed-post-item bg-white w-full max-w-[600px] mx-auto mb-2 sm:mb-6 sm:rounded-lg overflow-hidden border-y sm:border border-gray-200 shadow-sm hover:shadow-md transition-all"
//         >
//           {/* HEADER */}
//           <div className="flex items-center justify-between p-3 sm:p-4 h-[56px]">
//             <div className="flex items-center gap-2">
//               <Link
//                 href={`/profile/${post.userId?.username}`}
//                 className="relative group"
//               >
//                 <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
//                   <div className="bg-white p-[1px] rounded-full w-full h-full">
//                     <img
//                       src={post.userId?.profilePic || "/Fondpeace.jpg"}
//                       alt="profile"
//                       className="w-full h-full rounded-full object-cover"
//                       loading="lazy"
//                     />
//                   </div>
//                 </div>
//               </Link>
//               <Link
//                 href={`/profile/${post.userId?.username}`}
//                 className="flex flex-col"
//               >
//                 <span className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
//                   {post.userId?.username || "Unknown"}
//                 </span>
//                 <span className="text-[11px] text-gray-500 mt-0.5 font-medium">
//                   {new Date(post.createdAt).toLocaleDateString()}
//                 </span>
//               </Link>
//             </div>
//             <button
//               onClick={() => toast("Options coming soon 🚀")}
//               className="text-gray-500 hover:text-black px-2 transition-colors"
//             >
//               <span className="text-lg tracking-widest font-bold">•••</span>
//             </button>
//           </div>

//           {/* MEDIA SECTION */}
//           {post.media && (
//             <div className="relative w-full bg-black flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[400px]">
//               <Link
//                 href={isVideo ? `/shorts/${post._id}` : `/post/${post._id}`}
//                 className="w-full h-full flex items-center justify-center bg-black"
//               >
//                 {isVideo ? (
//                   <video
//                     ref={(ref) => (videoRefs.current[post._id] = ref)}
//                     src={post.media}
//                     loop
//                     playsInline
//                     muted={mutedMap[post._id] !== false}
//                     preload="metadata"
//                     poster={post.thumbnail || post.image}
//                     className="w-full max-w-[540px] aspect-[4/5] object-contain block mx-auto"
//                   />
//                 ) : (
//                   <img
//                     src={post.media}
//                     alt={post.title}
//                     className="w-full max-w-[540px] aspect-[4/5] object-contain block mx-auto"
//                     loading="lazy"
//                   />
//                 )}
//               </Link>

//               {isVideo && (
//                 <button
//                   onClick={(e) => {
//                     e.preventDefault();
//                     toggleMute(post._id);
//                   }}
//                   className="absolute bottom-4 right-4 bg-black/60 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/80 transition"
//                 >
//                   {mutedMap[post._id] ? (
//                     <FaVolumeMute size={14} />
//                   ) : (
//                     <FaVolumeUp size={14} />
//                   )}
//                 </button>
//               )}
//             </div>
//           )}

//           {/* INTERACTION AREA */}
//           <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-4">
//             {/* Action Icons */}
//             <div className="flex items-center justify-between mb-3">
//               <div className="flex items-center gap-5">
//                 <button
//                   onClick={() => handleLikePost(post._id)}
//                   className="flex items-center gap-1.5 transition-transform active:scale-125 hover:opacity-70"
//                 >
//                   {hasLikedPost(post) ? (
//                     <>
//                       <FaHeart className="text-red-500 text-[26px]" />
//                       <span className="font-bold text-sm">
//                         {post.likes?.length || 0}
//                       </span>
//                     </>
//                   ) : (
//                     <>
//                       <FaRegHeart className="text-[26px] text-gray-800 hover:text-gray-500" />
//                       <span className="font-bold text-sm">
//                         {post.likes?.length || 0}
//                       </span>
//                     </>
//                   )}
//                 </button>

//                 <button
//                   onClick={() =>
//                     setCommentBoxOpen((p) => ({
//                       ...p,
//                       [post._id]: !commentBoxOpen[post._id],
//                     }))
//                   }
//                   className="flex items-center gap-1.5 transition-transform active:scale-125 hover:opacity-70"
//                 >
//                   <FaCommentDots className="text-[24px] text-gray-800 hover:text-gray-500" />
//                   <span className="font-bold text-sm">
//                     {post.comments?.length || 0}
//                   </span>
//                 </button>

//                 <div className="relative flex items-center justify-center">
//                   <button
//                     onClick={() => handleShare(post)}
//                     className="flex items-center gap-1.5 transition-transform active:scale-125 hover:opacity-70"
//                   >
//                     <FaShareAlt className="text-[22px] text-gray-800 hover:text-gray-500" />
//                   </button>

//                   {copiedPostId === post._id && (
//                     <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl z-[9999] whitespace-nowrap font-bold">
//                       Link copied! 🎉
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* View Count Badge */}
//               <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-full border border-gray-100">
//                 <FaEye size={14} />
//                 <span className="text-[12px] font-bold">
//                   {post.views?.toLocaleString() || 0}
//                 </span>
//               </div>
//             </div>

//             {/* Caption */}
//             <div className="space-y-1.5">
//               <div className="text-sm text-gray-900 leading-snug">
//                 <span className="font-bold mr-2 hover:underline cursor-pointer">
//                   {post.userId?.username}
//                 </span>
//                 <span className="whitespace-pre-wrap">{titleText}</span>
//                 {title.length > 100 && (
//                   <button
//                     onClick={() =>
//                       setExpandedPosts((p) => ({
//                         ...p,
//                         [post._id]: !isExpanded,
//                       }))
//                     }
//                     className="text-blue-600 font-medium ml-1 hover:text-blue-700"
//                   >
//                     {isExpanded ? " show less" : "...more"}
//                   </button>
//                 )}
//               </div>

//               {/* View Comments Button */}
//               {post.comments?.length > 0 && !commentBoxOpen[post._id] && (
//                 <button
//                   onClick={() =>
//                     setCommentBoxOpen((p) => ({ ...p, [post._id]: true }))
//                   }
//                   className="text-sm text-gray-500 block hover:text-gray-700 transition font-medium"
//                 >
//                   View all {post.comments.length} comments
//                 </button>
//               )}
//             </div>

//             {/* Comments Section */}
//             {commentBoxOpen[post._id] && (
//               <div className="mt-4 pt-4 border-t border-gray-100">
//                 <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
//                   {post.comments?.map((cmt, i) => (
//                     <div key={i} className="flex gap-2 text-sm items-start">
//                       <span className="font-bold whitespace-nowrap text-xs sm:text-sm">
//                         {cmt?.userId?.username || "User"}
//                       </span>
//                       <span className="text-gray-700 leading-tight text-xs sm:text-sm">
//                         {cmt?.CommentText}
//                       </span>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Add Comment Input */}
//                 <div className="flex items-center gap-3 mt-3 border border-gray-200 rounded-full px-4 py-2 bg-gray-50 focus-within:bg-white focus-within:border-blue-400 transition-all">
//                   <input
//                     type="text"
//                     placeholder="Add a comment..."
//                     value={commentTextMap[post._id] || ""}
//                     onChange={(e) =>
//                       setCommentTextMap((p) => ({
//                         ...p,
//                         [post._id]: e.target.value,
//                       }))
//                     }
//                     className="flex-1 text-sm bg-transparent outline-none text-gray-900"
//                   />
//                   <button
//                     onClick={() => handleComment(post._id)}
//                     disabled={!commentTextMap[post._id]?.trim()}
//                     className="text-blue-600 text-sm font-bold disabled:opacity-30 hover:text-blue-700 transition"
//                   >
//                     Post
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </article>
//       );
//     },
//     [
//       commentTextMap,
//       commentBoxOpen,
//       expandedPosts,
//       userId,
//       mutedMap,
//       copiedPostId,
//     ]
//   );

//   return (
//     <div className="max-w-2xl mx-auto w-full">
//       {/* Initial Loading State */}
//       {initialLoad && loading && (
//         <div className="flex items-center justify-center min-h-[600px]">
//           <div className="flex flex-col items-center gap-4">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             <p className="text-gray-600 font-medium">Loading posts...</p>
//           </div>
//         </div>
//       )}

//       {/* Posts Feed */}
//       {!initialLoad && posts && posts.length > 0 ? (
//         <>
//           {posts.map((post, idx) => {
//             const isLast = idx === posts.length - 1;

//             return (
//               <div
//                 key={post._id}
//                 ref={(node) => {
//                   if (isLast) lastPostRef(node);
//                 }}
//               >
//                 {renderPost(post, idx)}
//               </div>
//             );
//           })}

//           {/* Loading Indicator for next page */}
//           {loading && !initialLoad && (
//             <div className="flex justify-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//             </div>
//           )}

//           {/* End of Feed Message */}
//           {!hasMore && posts.length > 0 && (
//             <div className="text-center py-12 text-gray-600">
//               <p className="font-medium text-lg">You've reached the end 🎉</p>
//               <Link href="/" className="text-blue-600 font-semibold hover:text-blue-700 mt-2 block">
//                 Explore more on home →
//               </Link>
//             </div>
//           )}
//         </>
//       ) : (
//         !initialLoad &&
//         !loading && (
//           <div className="flex items-center justify-center min-h-[600px]">
//             <div className="text-center">
//               <p className="text-gray-500 font-medium text-lg mb-4">
//                 No posts available
//               </p>
//               <Link
//                 href="/"
//                 className="text-blue-600 font-semibold hover:text-blue-700"
//               >
//                 Go back home →
//               </Link>
//             </div>
//           </div>
//         )
//       )}
//     </div>
//   );
// }








// "use client";

// import { useEffect, useRef } from "react";
// import { FaHeart, FaCommentDots, FaEye } from "react-icons/fa";

// function toAbsolute(url) {
//   if (!url) return "";
//   if (url.startsWith("http")) return url;
//   return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
// }

// function likesCount(post) {
//   return post?.likes?.length || 0;
// }

// function commentsCount(post) {
//   return post?.comments?.length || 0;
// }

// function viewsCount(post) {
//   return post?.views || 0;
// }

// function AutoPlayVideo({ video, thumb }) {
//   const videoRef = useRef(null);

//   useEffect(() => {
//     window.scrollTo({
//       top: window.innerHeight / 1.2,
//       behavior: "smooth",
//     });
//   }, []);

//   useEffect(() => {
//     const currentVideo = videoRef.current;
//     if (!currentVideo) return;

//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           currentVideo.play().catch(() => {});
//         } else {
//           currentVideo.pause();
//           currentVideo.currentTime = 0;
//         }
//       },
//       {
//         threshold: 0.7,
//       }
//     );

//     observer.observe(currentVideo);
//     return () => observer.disconnect();
//   }, []);

//   return (
//     <video
//       ref={videoRef}
//       src={video}
//       poster={thumb}
//       muted
//       loop
//       autoPlay
//       controls
//       playsInline
//       preload="metadata"
//       className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
//     />
//   );
// }

// export default function RelatedPosts({ related }) {
//   // console.log("RELATED POSTS:", related); // Kept your debug log

//   if (!Array.isArray(related) || related.length === 0) return null;

//   return (
//     <aside className="max-w-5xl mx-auto mt-6 sm:mt-10 px-4 pb-10">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
//           Explore More
//         </h2>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
//         {related.map((r) => {
//           // Detect all possible media fields
//           const media = toAbsolute(
//             r.video || r.videoUrl || r.media || r.image || r.file || ""
//           );

//           const thumb = toAbsolute(
//             r.thumbnail || r.thumb || r.image || ""
//           );

//           // Detect media type
//           const isVideo = media?.match(/\.(mp4|webm|ogg|mov)$/i);
//           const isImage = media?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

//           return (
//             <a
//               key={r._id}
//               href={`/shorts/${r._id}`}
//               className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 transform hover:-translate-y-1"
//             >
//               {/* Media Container with 4:5 Aspect Ratio (Great for Mobile/Shorts) */}
//               <div className="w-full aspect-[4/5] sm:h-72 bg-gray-100 overflow-hidden relative">
//                 {/* VIDEO */}
//                 {isVideo ? (
//                   <AutoPlayVideo video={media} thumb={thumb} />
//                 ) : isImage ? (
//                   /* IMAGE */
//                   <img
//                     src={media}
//                     alt={r.title}
//                     className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
//                     loading="lazy"
//                   />
//                 ) : (
//                   /* FALLBACK */
//                   <img
//                     src={thumb}
//                     alt={r.title}
//                     className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
//                     loading="lazy"
//                   />
//                 )}
                
//                 {/* Optional Play Icon Overlay for Videos */}
//                 {isVideo && (
//                   <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm p-1.5 rounded-full">
//                     <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
//                       <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
//                     </svg>
//                   </div>
//                 )}
//               </div>

//               {/* Card Content */}
//               <div className="p-4 flex flex-col flex-grow justify-between bg-white">
//                 <p className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight mb-3 group-hover:text-blue-600 transition-colors">
//                   {r.title}
//                 </p>

//                 {/* Engagement Stats */}
//                 <div className="flex items-center gap-4 text-gray-500 text-xs font-medium border-t border-gray-50 pt-3">
//                   <div className="flex items-center gap-1.5">
//                     <FaHeart className="text-red-500 text-sm" />
//                     <span>{likesCount(r)}</span>
//                   </div>

//                   <div className="flex items-center gap-1.5">
//                     <FaCommentDots className="text-blue-500 text-sm" />
//                     <span>{commentsCount(r)}</span>
//                   </div>

//                   <div className="flex items-center gap-1.5 ml-auto">
//                     <FaEye className="text-gray-400 text-sm" />
//                     <span>{viewsCount(r)}</span>
//                   </div>
//                 </div>
//               </div>
//             </a>
//           );
//         })}
//       </div>
//     </aside>
//   );
// }









// // "use client";

// // import { useEffect, useRef } from "react";
// // import { FaHeart, FaCommentDots, FaEye } from "react-icons/fa";

// // function toAbsolute(url) {
// //   if (!url) return "";

// //   if (url.startsWith("http")) return url;

// //   return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
// // }

// // function likesCount(post) {
// //   return post?.likes?.length || 0;
// // }

// // function commentsCount(post) {
// //   return post?.comments?.length || 0;
// // }

// // function viewsCount(post) {
// //   return post?.views || 0;
// // }

// // function AutoPlayVideo({ video, thumb }) {
// //   const videoRef = useRef(null);


// //   useEffect(() => {
// //   window.scrollTo({
// //     top: window.innerHeight / 1.2,
// //     behavior: "smooth",
// //   });
// // }, []);

  
// //   useEffect(() => {
// //     const currentVideo = videoRef.current;

// //     if (!currentVideo) return;

// //     const observer = new IntersectionObserver(
// //       ([entry]) => {
// //         if (entry.isIntersecting) {
// //           currentVideo.play().catch(() => {});
// //         } else {
// //           currentVideo.pause();
// //           currentVideo.currentTime = 0;
// //         }
// //       },
// //       {
// //         threshold: 0.7,
// //       }
// //     );

// //     observer.observe(currentVideo);

// //     return () => observer.disconnect();
// //   }, []);

// //   return (
// //     <video
// //       ref={videoRef}
// //       src={video}
// //       poster={thumb}
// //       muted
// //       loop
// //       autoPlay
// //       controls
// //       playsInline
// //       preload="metadata"
// //       className="w-full h-full object-cover object-center"
// //     />
// //   );
// // }

// // export default function RelatedPosts({ related }) {
// //   console.log("RELATED POSTS:", related);

// //   if (!Array.isArray(related) || related.length === 0) return null;

// //   return (
// //     <aside className="max-w-5xl mx-auto mt-10 px-4">
// //       <p className="text-xl font-semibold mb-4 text-gray-900">
// //         Related Posts
// //       </p>

// //       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
// //         {related.map((r) => {

// //           // 🔥 detect all possible media fields
// //           const media = toAbsolute(
// //             r.video ||
// //             r.videoUrl ||
// //             r.media ||
// //             r.image ||
// //             r.file ||
// //             ""
// //           );

// //           const thumb = toAbsolute(
// //             r.thumbnail ||
// //             r.thumb ||
// //             r.image ||
// //             ""
// //           );

// //           // 🔥 detect media type
// //           const isVideo =
// //             media?.match(/\.(mp4|webm|ogg|mov)$/i);

// //           const isImage =
// //             media?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

// //           return (
// //             <a
// //               key={r._id}
// //               href={`/shorts/${r._id}`}
// //               className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border"
// //             >
// //               <div className="w-full h-80 bg-gray-200 overflow-hidden relative">

// //                 {/* VIDEO */}
// //                 {isVideo ? (
// //                   <AutoPlayVideo
// //                     video={media}
// //                     thumb={thumb}
// //                   />
// //                 ) : isImage ? (

// //                   /* IMAGE */
// //                   <img
// //                     src={media}
// //                     alt={r.title}
// //                     className="w-full h-full object-cover object-center"
// //                     loading="lazy"
// //                   />

// //                 ) : (

// //                   /* FALLBACK */
// //                   <img
// //                     src={thumb}
// //                     alt={r.title}
// //                     className="w-full h-full object-cover object-center"
// //                     loading="lazy"
// //                   />

// //                 )}
// //               </div>

// //               <div className="p-3">
// //                 <p className="font-medium text-gray-900 line-clamp-2 text-sm">
// //                   {r.title}
// //                 </p>

// //                 <div className="flex items-center gap-3 text-gray-500 text-xs mt-2">
// //                   <FaHeart className="text-red-500" />
// //                   {likesCount(r)}

// //                   <span>•</span>

// //                   <FaCommentDots />
// //                   {commentsCount(r)}

// //                   <span>•</span>

// //                   <FaEye />
// //                   {viewsCount(r)}
// //                 </div>
// //               </div>
// //             </a>
// //           );
// //         })}
// //       </div>
// //     </aside>
// //   );
// // }
