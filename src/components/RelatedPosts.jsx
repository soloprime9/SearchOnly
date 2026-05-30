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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://backend-k.vercel.app";

export default function RelatedPosts({ mainPost, relatedPosts = [] }) {
  // Combine posts: main first, then related
  const [posts, setPosts] = useState(
    [mainPost, ...relatedPosts].filter(Boolean)
  );
  const [userId, setUserId] = useState(null);
  const [commentTextMap, setCommentTextMap] = useState({});
  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [mutedMap, setMutedMap] = useState({});
  const [copiedPostId, setCopiedPostId] = useState(null);
  const [likedPostMap, setLikedPostMap] = useState({});

  const videoRefs = useRef({});
  const viewedPosts = useRef(new Set());
  const viewObserver = useRef(null);
  const router = useRouter();

  // ==========================================
  // GET USER ID FROM TOKEN
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUserId(decoded.UserId);
      }
    } catch (e) {
      console.error("Token error:", e);
    }
  }, []);

  // ==========================================
  // INCREASE VIEW (Your exact logic)
  // ==========================================
  const increaseView = useCallback((postId) => {
    if (viewedPosts.current.has(postId)) return;

    viewedPosts.current.add(postId);
    console.log("VIEW +1:", postId);

    axios.post(`${API_BASE}/analytics/view`, { postId }).catch(() => {});
  }, []);

  // ==========================================
  // VIEW OBSERVER: Update URL + Analytics
  // ==========================================
  useEffect(() => {
    viewObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.dataset.postid;
            if (postId) {
              // 1. Track view
              increaseView(postId);

              // 2. Update URL silently
              window.history.replaceState(null, "", `/shorts/${postId}`);

              // 3. Play video if exists
              const video = videoRefs.current[postId];
              if (video) video.play().catch(() => {});
            }
          } else {
            // Pause when out of view
            const video = videoRefs.current[entry.target.dataset.postid];
            if (video) video.pause();
          }
        });
      },
      { threshold: 0.65 }
    );

    return () => viewObserver.current?.disconnect();
  }, [increaseView]);

  // ==========================================
  // OBSERVE ALL POSTS
  // ==========================================
  useEffect(() => {
    const elements = document.querySelectorAll(".premium-post-card");
    elements.forEach((el) => {
      if (viewObserver.current) viewObserver.current.observe(el);
    });

    return () => {
      elements.forEach((el) => {
        if (viewObserver.current) viewObserver.current.unobserve(el);
      });
    };
  }, [posts]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleLikePost = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to like");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/post/like/${postId}`,
        {},
        { headers: { "x-auth-token": token } }
      );

      // Update likes in state
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: res.data.likes || p.likes }
            : p
        )
      );

      // Optimistic UI
      setLikedPostMap((prev) => ({ ...prev, [postId]: !prev[postId] }));
    } catch (err) {
      toast.error("Failed to like");
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

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: res.data.comments || p.comments }
            : p
        )
      );

      setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to comment");
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
    const isVideo = post.mediaType?.startsWith("video") || post.media?.match(/\.(mp4|mov|webm|mkv)$/i);
    const path = isVideo ? "shorts" : "post";
    const url = `${window.location.origin}/${path}/${post._id}`;
    const shareText = `${post.title || "Check this out!"}\n${url}`;

    navigator.clipboard.writeText(shareText);
    setCopiedPostId(post._id);
    setTimeout(() => setCopiedPostId(null), 2500);
  };

  const hasLikedPost = (post) => {
    if (!userId || !Array.isArray(post.likes)) return false;
    return post.likes.some((id) => id?.toString() === userId?.toString());
  };

  // ==========================================
  // RENDER POST CARD
  // ==========================================
  const renderPost = useCallback(
    (post, isMainPost = false) => {
      if (!post) return null;

      const isExpanded = expandedPosts[post._id];
      const isVideo = post.mediaType?.startsWith("video") || post.media?.match(/\.(mp4|mov|webm|mkv)$/i);
      const title = post.title || "";
      const titleText = isExpanded ? title : title.slice(0, 100);
      const liked = hasLikedPost(post) || likedPostMap[post._id];
      const isMuted = mutedMap[post._id] !== false;

      return (
        <article
          key={post._id}
          data-postid={post._id}
          className={`premium-post-card bg-white w-full max-w-[600px] mx-auto mb-4 sm:mb-8 sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-y sm:border ${
            isMainPost
              ? "ring-2 ring-blue-400/30 sm:shadow-xl"
              : "border-gray-100"
          }`}
        >
          {/* Main Post Indicator */}
          {isMainPost && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2.5 flex items-center gap-2 border-b border-blue-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-blue-700 tracking-wide">
                ORIGINAL POST
              </span>
            </div>
          )}

          {/* HEADER */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/${post.userId?.username}`}
                className="relative group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 group-hover:shadow-lg transition-all">
                  <div className="bg-white p-[1px] rounded-full w-full h-full">
                    <img
                      src={post.userId?.profilePic || "/Fondpeace.jpg"}
                      alt="profile"
                      className="w-full h-full rounded-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </Link>

              <div>
                <Link
                  href={`/profile/${post.userId?.username}`}
                  className="flex flex-col"
                >
                  <span className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    {post.userId?.username || "Unknown"}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </Link>
              </div>
            </div>

            <button
              onClick={() => toast.success("More options coming soon!")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <span className="text-lg font-bold text-gray-600">•••</span>
            </button>
          </div>

          {/* MEDIA SECTION - Premium styling */}
          {post.media && (
            <div className="relative w-full bg-black flex items-center justify-center overflow-hidden min-h-[350px] sm:min-h-[500px]">
              {isVideo ? (
                <video
                  ref={(ref) => (videoRefs.current[post._id] = ref)}
                  src={post.media}
                  loop
                  playsInline
                  muted={isMuted}
                  preload="metadata"
                  className="w-full max-w-[540px] aspect-[4/5] object-contain"
                />
              ) : (
                <img
                  src={post.media}
                  alt={post.title}
                  className="w-full max-w-[540px] aspect-[4/5] object-contain"
                  loading="lazy"
                />
              )}

              {isVideo && (
                <button
                  onClick={() => toggleMute(post._id)}
                  className="absolute bottom-4 right-4 bg-black/70 text-white p-3 rounded-full backdrop-blur-md hover:bg-black/90 transition-all shadow-lg"
                >
                  {isMuted ? (
                    <FaVolumeMute size={16} />
                  ) : (
                    <FaVolumeUp size={16} />
                  )}
                </button>
              )}
            </div>
          )}

          {/* INTERACTION AREA - Premium */}
          <div className="px-4 pt-4 pb-5">
            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => handleLikePost(post._id)}
                  className="flex items-center gap-2 transition-all active:scale-125 hover:opacity-70"
                >
                  {liked ? (
                    <FaHeart className="text-red-500 text-[28px]" />
                  ) : (
                    <FaRegHeart className="text-[28px] text-gray-800" />
                  )}
                  <span className="font-bold text-sm">
                    {(post.likes?.length || 0) + (liked && !hasLikedPost(post) ? 1 : 0)}
                  </span>
                </button>

                <button
                  onClick={() =>
                    setCommentBoxOpen((p) => ({
                      ...p,
                      [post._id]: !commentBoxOpen[post._id],
                    }))
                  }
                  className="flex items-center gap-2 transition-all active:scale-125 hover:opacity-70"
                >
                  <FaCommentDots className="text-[26px] text-gray-800" />
                  <span className="font-bold text-sm">
                    {post.comments?.length || 0}
                  </span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-2 transition-all active:scale-125 hover:opacity-70"
                  >
                    <FaShareAlt className="text-[24px] text-gray-800" />
                  </button>
                  {copiedPostId === post._id && (
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap font-bold shadow-lg z-50">
                      Link copied! 🎉
                    </span>
                  )}
                </div>
              </div>

              {/* View Count - Premium Badge */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-full border border-blue-100 shadow-sm">
                <FaEye className="text-blue-600" size={14} />
                <span className="font-bold text-sm text-blue-600">
                  {post.views?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <div className="text-sm text-gray-900 leading-relaxed">
                <span className="font-bold text-gray-900 hover:underline cursor-pointer">
                  {post.userId?.username}
                </span>
                <span className="ml-2">{titleText}</span>
                {title.length > 100 && (
                  <button
                    onClick={() =>
                      setExpandedPosts((p) => ({
                        ...p,
                        [post._id]: !isExpanded,
                      }))
                    }
                    className="text-blue-600 font-semibold ml-1 hover:text-blue-700"
                  >
                    {isExpanded ? "less" : "more"}
                  </button>
                )}
              </div>

              {post.comments?.length > 0 && !commentBoxOpen[post._id] && (
                <button
                  onClick={() =>
                    setCommentBoxOpen((p) => ({ ...p, [post._id]: true }))
                  }
                  className="text-sm text-gray-500 font-medium hover:text-gray-700 transition-colors"
                >
                  View all {post.comments.length} comments
                </button>
              )}
            </div>

            {/* Comments Section */}
            {commentBoxOpen[post._id] && (
              <div className="mt-5 pt-4 border-t border-gray-100 space-y-4">
                {post.comments?.length > 0 && (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {post.comments.map((cmt, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">
                            {cmt?.userId?.username || "User"}
                          </p>
                          <p className="text-sm text-gray-700 leading-tight">
                            {cmt?.CommentText}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentTextMap[post._id] || ""}
                    onChange={(e) =>
                      setCommentTextMap((p) => ({
                        ...p,
                        [post._id]: e.target.value,
                      }))
                    }
                    className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus:bg-white focus:border-blue-400 focus:outline-none transition-all"
                  />
                  <button
                    onClick={() => handleComment(post._id)}
                    disabled={!commentTextMap[post._id]?.trim()}
                    className="text-blue-600 font-bold text-sm disabled:opacity-30 hover:text-blue-700 transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </article>
      );
    },
    [
      commentTextMap,
      commentBoxOpen,
      expandedPosts,
      mutedMap,
      copiedPostId,
      likedPostMap,
      userId,
    ]
  );

  return (
    <div className="w-full flex flex-col items-center">
      {posts.map((post, idx) => {
        const isMainPost = idx === 0;
        return (
          <div key={post._id} ref={(node) => {
            if (node && viewObserver.current) {
              viewObserver.current.observe(node);
            }
          }}>
            {renderPost(post, isMainPost)}
          </div>
        );
      })}
    </div>
  );
}









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
