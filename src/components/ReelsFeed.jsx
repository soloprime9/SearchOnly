"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import jwt from "jsonwebtoken";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShareAlt,
  FaEye,
  FaEllipsisH,
  FaPlay,
  FaPause,
} from "react-icons/fa";
import { IoMdVolumeHigh, IoMdVolumeOff } from "react-icons/io";

const API_BASE = "https://backend-k.vercel.app";
const DEFAULT_THUMB = "/Fondpeace.jpg";
const DEFAULT_AVATAR = "/Fondpeace.jpg";

export default function SingleReel({ initialPost }) {
  const videoRef = useRef(null);
  const commentRef = useRef(null);

  const [post, setPost] = useState(initialPost);
  const [userId, setUserId] = useState(null);
  const [showComments, setShowComments] = useState(true);
  const [comment, setComment] = useState("");
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  /* ---------------- USER ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = jwt.decode(token);
    if (decoded?.UserId) setUserId(decoded.UserId);
  }, []);

  /* ---------------- AUTOPLAY ---------------- */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.play().catch(() => {});
    }
  }, [muted]);



  if (!post) {
    return <div className="h-screen flex items-center justify-center">Video not found</div>;
  }

  const hasLiked = post.likes?.some(
    (id) => id?.toString() === userId?.toString()
  );

  /* ---------------- LIKE ---------------- */
  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login");

    const res = await axios.post(
      `${API_BASE}/post/like/${post._id}`,
      {},
      { headers: { "x-auth-token": token } }
    );
    setPost((p) => ({ ...p, likes: res.data.likes }));
  };

  /* ---------------- COMMENT ---------------- */
  const handleComment = async () => {
    if (!comment.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login");

    const res = await axios.post(
      `${API_BASE}/post/comment/${post._id}`,
      { CommentText: comment, userId },
      { headers: { "x-auth-token": token } }
    );
    setPost((p) => ({ ...p, comments: res.data.comments }));
    setComment("");
  };

  /* ---------------- SHARE ---------------- */
  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert("Link copied");
  };

  /* ---------------- PLAY / PAUSE ---------------- */
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 700);
  };

  /* ---------------- MUTE ---------------- */
  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  


//   return (
//     <div className="flex flex-col h-screen w-screen bg-white justify-start overflow-y-auto">
//       <div className="w-full max-w-[480px] flex flex-col">

//         {/* ---------------- HEADER ---------------- */}
//         <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white z-10">
//           <Link href={`/profile/${post.userId?.username}`} className="flex items-center gap-3">
//             <img
//               src={post.userId?.avatar || DEFAULT_AVATAR}
//               className="w-10 h-10 rounded-full object-cover"
//             />
//             <p className="font-semibold text-sm">
//               {post.userId?.username || "fondpeace"}
//             </p>
//           </Link>
//           <FaEllipsisH />
//         </div>

//         {/* ---------------- VIDEO ---------------- */}
//         <div className="flex flex-col">
//         <div className="relative w-full bg-black h-[70vh]" onClick={togglePlayPause}>
//           <video
//             ref={videoRef}
//             src={post.media}
//             poster={post.thumbnail || DEFAULT_THUMB}
//             autoPlay
//             loop
//             playsInline
//             preload="auto"
//             muted={muted}
//             controls={false}
//             className="w-full h-full object-contain"
//           />

//           {/* ---------------- PLAY / PAUSE ICON CENTER ---------------- */}
//           {showPlayIcon && (
//             <div className="absolute inset-0 flex items-center justify-center">
//               {isPlaying ? (
//                 <FaPause className="text-white text-6xl opacity-90 animate-pulse" />
//               ) : (
//                 <FaPlay className="text-white text-6xl opacity-90 animate-pulse" />
//               )}
//             </div>
//           )}

//           {/* ---------------- MUTE BUTTON ---------------- */}
//           <button
//             onClick={toggleMute}
//             className="absolute bottom-4 right-4 bg-black/60 p-2 rounded-full text-white"
//           >
//             {muted ? <IoMdVolumeOff size={22} /> : <IoMdVolumeHigh size={22} />}
//           </button>
//         </div>

//         {/* ---------------- INTERACTIONS ---------------- */}
//         <div className="flex justify-between items-center px-4 py-2">
//           <div className="flex gap-5 items-center">
//             <button onClick={handleLike} className="flex items-center gap-1">
//               {hasLiked ? (
//                 <FaHeart className="text-red-600 text-xl" />
//               ) : (
//                 <FaRegHeart className="text-xl" />
//               )}
//               {post.likes?.length || 0}
//             </button>

//             <button className="flex items-center gap-1">
//   <FaCommentDots className="text-xl" />
//   {post.comments?.length || 0}
// </button>



//             <button
//               onClick={handleShare}
//               className="flex items-center gap-1"
//             >
//               <FaShareAlt className="text-xl" />
//             </button>
//           </div>

//           <div className="flex items-center gap-1 text-sm">
//             <FaEye />
//             {post.views || 0}
//           </div>
//         </div>

//         {/* ---------------- CAPTION ---------------- */}
//         <div className="px-4 py-2 text-sm">
//           <span className="font-semibold mr-1">
//             {post.userId?.username || "fondpeace"}
//           </span>
//           {post.title}
//         </div>

//         {/* ---------------- COMMENTS PANEL ---------------- */}
//         {showComments && (
//   <div className="bg-gray-50 w-full border-t border-gray-200 p-4 max-h-[30vh] overflow-y-auto">

//     {/* Comment input */}
//     <div className="flex items-center gap-3 mb-4">
//       <img
//         src={DEFAULT_AVATAR}
//         className="w-8 h-8 rounded-full object-cover"
//       />
//       <input
//         value={comment}
//         onChange={(e) => setComment(e.target.value)}
//         placeholder="Add a comment..."
//         className="flex-1 bg-white border rounded-full px-4 py-2 text-sm focus:outline-none"
//       />
//       <button
//         onClick={handleComment}
//         className="text-blue-600 font-semibold text-sm"
//       >
//         Post
//       </button>
//     </div>

//     {/* Comments list */}
//     {post.comments?.map((cmt, i) => (
//       <div key={i} className="flex gap-3 mb-3">
//         <img
//           src={cmt.userId?.avatar || DEFAULT_AVATAR}
//           className="w-8 h-8 rounded-full object-cover"
//         />
//         <div>
//           <p className="text-sm">
//             <span className="font-semibold mr-1">
//               {cmt.userId?.username || "User"}
//             </span>
//             {cmt.CommentText}
//           </p>
//         </div>
//       </div>
//     ))}
//   </div>
// )}

//         </div>


//       </div>
//     </div>
//   );
// }



  return (
  <div className="h-screen w-screen bg-black text-white flex">

    {/* ========== DESKTOP LEFT SIDEBAR ========== */}
    <aside className="hidden md:flex w-[240px] flex-col border-r border-neutral-800 px-4 py-6">
      <div className="text-2xl font-semibold mb-8">FondPeace</div>

      <SidebarItem label="Home" />
      <SidebarItem label="Search" />
      <SidebarItem label="Explore" />
      <SidebarItem label="Reels" active />
      <SidebarItem label="Upload" />
      <SidebarItem label="Profile" />

      <div className="mt-auto">
        <SidebarItem label="More" />
      </div>
    </aside>

    {/* ========== CENTER CONTENT ========== */}
    <div className="flex-1 flex justify-center overflow-hidden">

      <div className="w-full max-w-[480px] bg-black flex flex-col">

        {/* HEADER (Mobile + Desktop) */}
        <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-black z-20 border-b border-neutral-800">
          <Link
            href={`/profile/${post.userId?.username}`}
            className="flex items-center gap-3"
          >
            <img
              src={post.userId?.avatar || DEFAULT_AVATAR}
              className="w-9 h-9 rounded-full"
            />
            <span className="font-semibold text-sm">
              {post.userId?.username || "fondpeace"}
            </span>
          </Link>
          <FaEllipsisH />
        </div>

        {/* VIDEO */}
        <div
          className="relative flex-1 bg-black"
          onClick={togglePlayPause}
        >
          <video
            ref={videoRef}
            src={post.media}
            poster={post.thumbnail || DEFAULT_THUMB}
            autoPlay
            loop
            playsInline
            muted={muted}
            className="w-full h-full object-contain"
          />

          {showPlayIcon && (
            <div className="absolute inset-0 flex items-center justify-center">
              {isPlaying ? (
                <FaPause className="text-white text-6xl" />
              ) : (
                <FaPlay className="text-white text-6xl" />
              )}
            </div>
          )}

          <button
            onClick={toggleMute}
            className="absolute bottom-4 right-4 bg-black/60 p-2 rounded-full"
          >
            {muted ? <IoMdVolumeOff size={22} /> : <IoMdVolumeHigh size={22} />}
          </button>
        </div>

        {/* ACTION BAR */}
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex gap-5 items-center">
            <button onClick={handleLike} className="flex items-center gap-1">
              {hasLiked ? (
                <FaHeart className="text-red-500 text-xl" />
              ) : (
                <FaRegHeart className="text-xl" />
              )}
              {post.likes?.length || 0}
            </button>

            <div className="flex items-center gap-1">
              <FaCommentDots className="text-xl" />
              {post.comments?.length || 0}
            </div>

            <button onClick={handleShare}>
              <FaShareAlt className="text-xl" />
            </button>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <FaEye />
            {post.views || 0}
          </div>
        </div>

        {/* CAPTION */}
        <div className="px-4 pb-2 text-sm">
          <span className="font-semibold mr-1">
            {post.userId?.username}
          </span>
          {post.title}
        </div>

        {/* COMMENTS */}
        {showComments && (
          <div className="border-t border-neutral-800 px-4 py-3 max-h-[28vh] overflow-y-auto bg-black">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={DEFAULT_AVATAR}
                className="w-8 h-8 rounded-full"
              />
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-full px-4 py-2 text-sm outline-none"
              />
              <button
                onClick={handleComment}
                className="text-blue-500 font-semibold text-sm"
              >
                Post
              </button>
            </div>

            {post.comments?.map((cmt, i) => (
              <div key={i} className="flex gap-3 mb-3">
                <img
                  src={cmt.userId?.avatar || DEFAULT_AVATAR}
                  className="w-8 h-8 rounded-full"
                />
                <p className="text-sm">
                  <span className="font-semibold mr-1">
                    {cmt.userId?.username}
                  </span>
                  {cmt.CommentText}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* ========== MOBILE BOTTOM NAV ========== */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-black border-t border-neutral-800 flex justify-around items-center">
      <FaPlay />
      <FaCommentDots />
      <FaHeart />
      <FaShareAlt />
      <FaEllipsisH />
    </nav>
  </div>
);

/* -------- Sidebar item -------- */
function SidebarItem({ label, active }) {
  return (
    <div
      className={`px-3 py-3 rounded-lg cursor-pointer ${
        active ? "bg-neutral-800 font-semibold" : "hover:bg-neutral-900"
      }`}
    >
      {label}
    </div>
  );
}









// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// const DEFAULT_THUMB = "/fondpeace.jpg";

// // Detect Googlebot / Bingbot / crawler
// const isBotUserAgent = () => {
//   if (typeof navigator === "undefined") return true;
//   const ua = navigator.userAgent.toLowerCase();
//   return (
//     ua.includes("googlebot") ||
//     ua.includes("adsbot") ||
//     ua.includes("bingbot") ||
//     ua.includes("duckduckbot") ||
//     ua.includes("yandex") ||
//     ua.includes("baiduspider")
//   );
// };

// export default function ReelsFeed({ initialPost, initialRelated = [] }) {
//   const router = useRouter();
//   const bot = isBotUserAgent();

//   const [posts] = useState(
//     bot ? [initialPost] : [initialPost, ...initialRelated]
//   );

//   const containerRef = useRef(null);
//   const videoRefs = useRef([]);
//   const activeIndexRef = useRef(0);
//   const postsRef = useRef(posts);

//   // ---------------------------
//   // OPTIMIZED AUTOPLAY HANDLER
//   // ---------------------------
//   const handleAutoPlay = (entries) => {
//     for (const entry of entries) {
//       if (!entry.isIntersecting || entry.intersectionRatio < 0.65) continue;

//       const index = Number(entry.target.dataset.index);
//       const post = postsRef.current[index];
//       const video = entry.target;

//       // If changed to a new short
//       if (index !== activeIndexRef.current) {
//         activeIndexRef.current = index;

//         // Pause previous only, not all videos
//         videoRefs.current.forEach((v, i) => {
//           if (i !== index && v) v.pause();
//         });

//         video.play().catch(() => {});

//         // SEO: Don't change URL for bots
//         if (!bot && post) {
//           const newUrl = `/short/${post._id}`;
//           window.history.replaceState(null, "", newUrl);
//           document.title = post.title || "FondPeace Short Video";
//         }
//       }
//     }
//   };

//   // ---------------------------
//   // INTERSECTION OBSERVER
//   // ---------------------------
//   useEffect(() => {
//     if (bot) return;

//     const observer = new IntersectionObserver(handleAutoPlay, {
//       threshold: [0.65],
//     });

//     videoRefs.current.forEach((v) => v && observer.observe(v));

//     return () => observer.disconnect();
//   }, []);

//   // ---------------------------
//   // BOT SIMPLE VIEW
//   // ---------------------------
//   if (bot) {
//     const v = posts[0];
//     return (
//       <div className="w-full h-screen flex items-center justify-center bg-black">
//         <video
//           src={v.media || v.mediaUrl}
//           className="w-full h-full object-cover"
//           poster={v.thumbnail || DEFAULT_THUMB}
//           controls
//         />
//       </div>
//     );
//   }

//   // ---------------------------
//   // USER FULL SHORTS FEED
//   // ---------------------------
//   return (
//     <div
//       ref={containerRef}
//       className="w-full h-screen overflow-y-scroll snap-y snap-mandatory bg-black"
//     >
//       {posts.map((item, index) => {
//         const videoUrl = item.media || item.mediaUrl;

//         return (
//           <div
//             key={item._id}
//             data-index={index}
//             className="w-full h-screen snap-start relative flex items-center justify-center"
//           >
//             <video
//               ref={(el) => (videoRefs.current[index] = el)}
//               data-index={index}
//               src={videoUrl}
//               loop
//               playsInline
              
//               preload={index === 0 ? "metadata" : "none"} // Massive lag fix!
//               poster={item.thumbnail || DEFAULT_THUMB}
//               className="w-full h-full bg-black"
//             />

//             <div className="absolute bottom-24 left-4 text-white z-20 max-w-[70%]">

//               <Link href={`/profile/${item.userId?.username}`}>
//               <p className="font-bold text-lg">@{item.userId?.username}</p>
//               </Link>
//               <p className="mt-1 opacity-80 line-clamp-2">{item.title}</p>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }












// // 'use client';

// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import { useRouter } from 'next/navigation';

// // const DEFAULT_THUMB = "/fondpeace.jpg";

// // // Bot detection
// // const isBotUserAgent = () => {
// //     if (typeof navigator === "undefined") return true;
// //     const ua = navigator.userAgent.toLowerCase();
// //     return (
// //         ua.includes("googlebot") || 
// //         ua.includes("adsbot") || 
// //         ua.includes("bingbot") ||
// //         ua.includes("duckduckbot") || 
// //         ua.includes("yandex") || 
// //         ua.includes("baiduspider")
// //     );
// // };

// // const ReelsFeed = ({ initialPost, initialRelated = [] }) => {
// //     const router = useRouter();
// //     const bot = isBotUserAgent();

// //     const [posts, setPosts] = useState(bot ? [initialPost].filter(Boolean) : [initialPost, ...initialRelated].filter(Boolean));
// //     const [activeIndex, setActiveIndex] = useState(0);
// //     const [currentUrl, setCurrentUrl] = useState(typeof window !== "undefined" ? window.location.pathname : "");
// //     const videoRefs = useRef([]);

// //     const handleAutoPlay = useCallback((entries) => {
// //         if (bot) return; // Bot ko URL change na ho

// //         entries.forEach(entry => {
// //             const video = entry.target;
// //             const index = parseInt(video.dataset.index, 10);
// //             const post = posts[index];

// //             if (entry.isIntersecting && entry.intersectionRatio >= 0.65 && post) {
// //                 setActiveIndex(index);
// //                 videoRefs.current.forEach(v => v && v !== video && v.pause());
// //                 video.play().catch(() => {});

// //                 const newPath = `/short/${post._id}`;
// //                 if (currentUrl !== newPath) {
// //                     router.replace(newPath, { scroll: false, shallow: true });
// //                     setCurrentUrl(newPath);
// //                     document.title = post.title || "FondPeace Short Video";
// //                 }
// //             } else {
// //                 video.pause();
// //             }
// //         });
// //     }, [bot, posts, router, currentUrl]);

// //     useEffect(() => {
// //         if (bot || posts.length === 0) return;
// //         const observer = new IntersectionObserver(handleAutoPlay, { threshold: [0, 0.65] });
// //         videoRefs.current.forEach(v => v && observer.observe(v));
// //         return () => observer.disconnect();
// //     }, [posts, handleAutoPlay, bot]);

// //     if (!posts || posts.length === 0) {
// //         return <div className="min-h-screen flex items-center justify-center">No videos yet</div>;
// //     }

// //     return (
// //         <div className="reels-container w-full h-screen snap-y snap-mandatory" style={{ overflowY: bot ? "hidden" : "scroll" }}>
// //             {posts.map((item, index) => {
// //                 const videoUrl = item.media || item.mediaUrl;

// //                 return (
// //                     <div
// //                         key={item._id || index}
// //                         className="video-wrapper snap-start w-full h-screen flex items-center justify-center relative"
// //                         data-id={item._id}
// //                         data-index={index}
// //                     >
// //                         <video
// //                             ref={el => (videoRefs.current[index] = el)}
// //                             src={videoUrl}
// //                             poster={item.thumbnail || DEFAULT_THUMB}
// //                             muted
// //                             playsInline
// //                             preload="metadata"
// //                             loop
// //                             className="object-contain w-full h-full bg-black"
// //                         />
// //                         {!bot && (
// //                             <div className="absolute left-4 bottom-24 text-white max-w-[70%] z-10">
// //                                 <p className="font-bold text-lg">@{item.userId?.username}</p>
// //                                 <p className="text-sm line-clamp-2 mt-1">{item.title}</p>
// //                             </div>
// //                         )}
// //                     </div>
// //                 );
// //             })}
// //         </div>
// //     );
// // };

// // export default ReelsFeed;










// // // src/components/ReelsFeed.jsx
// // 'use client';

// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import { useRouter } from 'next/navigation';
// // import toast from 'react-hot-toast';

// // const API_URL = "https://backend-k.vercel.app/post/shorts";
// // const DEFAULT_THUMB = "/fondpeace.jpg";

// // // Bot User Agent Detection
// // const isBotUserAgent = () => {
// //     if (typeof navigator === "undefined") return true;
// //     const ua = navigator.userAgent.toLowerCase();
// //     return (
// //         ua.includes("googlebot") || 
// //         ua.includes("adsbot") || 
// //         ua.includes("bingbot") ||
// //         ua.includes("duckduckbot") || 
// //         ua.includes("yandex") || 
// //         ua.includes("baiduspider")
// //     );
// // };

// // const ReelsFeed = ({ initialPost, initialRelated = [] }) => {
// //     const router = useRouter();
// //     const bot = isBotUserAgent();

// //     const [posts, setPosts] = useState(bot ? [initialPost].filter(Boolean) : [initialPost, ...initialRelated].filter(Boolean));
// //     const [loading, setLoading] = useState(false);
// //     const videoRefs = useRef([]);
// //     const pageRef = useRef(1);

// //     // --- Core Logic: Autoplay and URL Change ---
// //     const handleAutoPlay = useCallback(
// //         (entries) => {
// //             if (bot) return; // <<-- यही लाइन Google Bot को URL बदलने से रोकती है

// //             entries.forEach(entry => {
// //                 const video = entry.target;
// //                 const index = parseInt(video.dataset.index, 10);
// //                 const post = posts[index];

// //                 if (entry.isIntersecting && entry.intersectionRatio >= 0.65 && post) {
// //                     // 1. वीडियो प्ले/पॉज़ लॉजिक
// //                     videoRefs.current.forEach(v => v && v !== video && v.pause());
// //                     video.play().catch(() => {});
                    
// //                     // 2. Soft Navigation (URL Change)
// //                     const id = post._id;
// //                     if (id) {
// //                         // USER के लिए URL बदलें (पेज रीलोड नहीं होगा)
// //                         router.replace(`/short/${id}`, { scroll: false });
                        
// //                         // **नोट:** यहाँ आपको JS से ब्राउज़र का टाइटल भी अपडेट करना होगा 
// //                         // ताकि यूजर को पता चले कि वे किस वीडियो पर हैं।
// //                     }
// //                 } else {
// //                     video.pause();
// //                 }
// //             });
// //         },
// //         [bot, router, posts]
// //     );

// //     // --- useEffects (unchanged logic, only runs if not bot) ---
// //     useEffect(() => {
// //         if (bot || posts.length === 0) return;
// //         const observer = new IntersectionObserver(handleAutoPlay, { threshold: [0, 0.65] });
// //         videoRefs.current.forEach(v => v && observer.observe(v));
// //         return () => observer.disconnect();
// //     }, [posts, handleAutoPlay, bot]);

// //     // ... (rest of loadMorePosts and infinite scroll logic) ...

// //     if (!posts || posts.length === 0) {
// //         return <div className="min-h-screen flex items-center justify-center">No videos yet</div>;
// //     }

// //     return (
// //         <div 
// //             className="reels-container w-full h-screen snap-y snap-mandatory" 
// //             style={{ overflowY: bot ? "hidden" : "scroll" }} // Bot can't scroll
// //         >
// //             {posts.map((item, index) => {
// //                 // ... (video rendering logic) ...
// //                 const videoUrl = item.media || item.mediaUrl;
// //                 const isLast = index === posts.length - 1;

// //                 return (
// //                     <div
// //                         key={item._id || index}
// //                         className={`video-wrapper ${isLast ? "last-feed-item" : ""} snap-start w-full h-screen flex items-center justify-center relative`}
// //                         data-id={item._id}
// //                         data-index={index}
// //                     >
// //                         <video
// //                             ref={el => (videoRefs.current[index] = el)}
// //                             src={videoUrl}
// //                             poster={item.thumbnail || DEFAULT_THUMB}
// //                             muted
// //                             playsInline
// //                             preload="metadata"
// //                             loop
// //                             className="object-contain w-full h-full bg-black"
// //                         />
                        
// //                         {!bot && (
// //                             <div className="absolute left-4 bottom-24 text-white max-w-[70%] z-10">
// //                                 <p className="font-bold text-lg">@{item.userId?.username}</p>
// //                                 <p className="text-sm line-clamp-2 mt-1">{item.title}</p>
// //                             </div>
// //                         )}
// //                     </div>
// //                 );
// //             })}
// //         </div>
// //     );
// // };

// // export default ReelsFeed;








// // 'use client';
 
// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import { useRouter, useParams } from 'next/navigation';
// // import toast from 'react-hot-toast';

// // // Constants
// // const API_URL = "https://backend-k.vercel.app/post/shorts";
// // const DEFAULT_THUMB = "/fondpeace.jpg";

// // // Utility: Bot User Agent Detection
// // // यह फंक्शन सर्वर कंपोनेंट में RENDER नहीं होता है, इसलिए यह केवल क्लाइंट साइड पर चलता है।
// // const isBotUserAgent = () => {
// //     if (typeof navigator === "undefined") return true;
// //     const ua = navigator.userAgent.toLowerCase();
// //     // महत्वपूर्ण: Googlebot/Bingbot/etc. के लिए सभी क्लाइंट-साइड इंटरेक्शन को अक्षम करें
// //     return (
// //         ua.includes("googlebot") ||
// //         ua.includes("adsbot") ||
// //         ua.includes("bingbot") ||
// //         ua.includes("duckduckbot") ||
// //         ua.includes("yandex") ||
// //         ua.includes("baiduspider")
// //     );
// // };

// // // ReelsFeed Component
// // const ReelsFeed = ({ initialPost, initialRelated = [] }) => {
// //     const router = useRouter();
// //     const bot = isBotUserAgent();

// //     // क्रॉलर के लिए, posts एरे में केवल initialPost होगा।
// //     const [posts, setPosts] = useState(bot ? [initialPost].filter(Boolean) : [initialPost, ...initialRelated].filter(Boolean));
// //     const [loading, setLoading] = useState(false);
// //     const videoRefs = useRef([]);
// //     const pageRef = useRef(1);

// //     // 1. Autoplay and URL Update Logic (Only for Users, not Bots)
// //     const handleAutoPlay = useCallback(
// //         (entries) => {
// //             if (bot) return; // BOT को ऑटोप्ले और URL बदलने की अनुमति नहीं है
// //             entries.forEach(entry => {
// //                 const video = entry.target;
// //                 const index = parseInt(video.dataset.index, 10);
// //                 const post = posts[index];

// //                 if (entry.isIntersecting && entry.intersectionRatio >= 0.65 && post) {
// //                     // 1. केवल वर्तमान वीडियो को चलाएं और बाकी को रोकें
// //                     videoRefs.current.forEach(v => v && v !== video && v.pause());
// //                     video.play().catch(() => {});

// //                     // 2. URL को चुपचाप बदलें (Soft Navigation) - यह मुख्य UX/Sharing ट्रिक है।
// //                     const id = post._id;
// //                     if (id) {
// //                         // URL बदलता है, लेकिन पेज रीलोड नहीं होता
// //                         router.replace(`/short/${id}`, { scroll: false });
// //                     }
// //                 } else {
// //                     video.pause();
// //                 }
// //             });
// //         },
// //         [bot, router, posts]
// //     );

// //     // Autoplay Intersection Observer Setup
// //     useEffect(() => {
// //         if (bot || posts.length === 0) return;
// //         const observer = new IntersectionObserver(handleAutoPlay, { threshold: [0, 0.65] });
// //         videoRefs.current.forEach(v => v && observer.observe(v));
// //         return () => observer.disconnect();
// //     }, [posts, handleAutoPlay, bot]);


// //     // 2. Infinite Scroll Logic (Only for Users, not Bots)
// //     const loadMorePosts = async () => {
// //         if (loading || bot) return;
// //         setLoading(true);
// //         try {
// //             pageRef.current += 1;
// //             const res = await fetch(`${API_URL}?page=${pageRef.current}&limit=6`);
// //             const data = await res.json();

// //             setPosts(prev => {
// //                 const ids = new Set(prev.map(x => x._id));
// //                 // डुप्लिकेट हटाएँ
// //                 const newPosts = (data.videos || data).filter(x => x && x._id && !ids.has(x._id));
// //                 return [...prev, ...newPosts];
// //             });

// //         } catch(e) {
// //             toast.error("Failed loading more videos");
// //         }
// //         setLoading(false);
// //     };

// //     // Infinite Scroll Observer Setup
// //     useEffect(() => {
// //         if (bot || posts.length === 0) return;
// //         const observer = new IntersectionObserver(
// //             (entries) => {
// //                 const lastItem = entries[0];
// //                 // जब अंतिम आइटम दिखाई देता है, तो अधिक वीडियो लोड करें
// //                 if (lastItem.isIntersecting) loadMorePosts();
// //             },
// //             { threshold: 0.1 }
// //         );

// //         // केवल अंतिम आइटम को ऑब्जर्व करें
// //         const lastEl = document.querySelector(".last-feed-item");
// //         if (lastEl) observer.observe(lastEl);
// //         return () => observer.disconnect();
// //     }, [posts, bot]);

// //     // Handle initial state/loading
// //     if (!posts || posts.length === 0) {
// //         return <div className="min-h-screen flex items-center justify-center text-gray-800">No videos yet</div>;
// //     }

// //     return (
// //         <div 
// //             className="reels-container w-full h-screen snap-y snap-mandatory" 
// //             // क्रॉलर के लिए, ओवरफ़्लो hidden है ताकि वह स्क्रॉल न कर सके।
// //             style={{ overflowY: bot ? "hidden" : "scroll" }}
// //         >
// //             {posts.map((item, index) => {
// //                 // Ensure post item is valid
// //                 if (!item || !item._id) return null;

// //                 const videoUrl = item.media || item.mediaUrl;
// //                 const isLast = index === posts.length - 1;

// //                 return (
// //                     <div
// //                         key={item._id}
// //                         className={`video-wrapper ${isLast ? "last-feed-item" : ""} snap-start w-full h-screen flex items-center justify-center relative`}
// //                         data-id={item._id}
// //                         data-index={index} // Intersection Observer के लिए इंडेक्स ज़रूरी
// //                     >
// //                         {/* Video Player */}
// //                         <video
// //                             ref={el => (videoRefs.current[index] = el)}
// //                             src={videoUrl}
// //                             poster={item.thumbnail || DEFAULT_THUMB}
// //                             muted // Reels/Shorts/TikTok हमेशा म्यूट से शुरू होता है
// //                             playsInline
// //                             preload="metadata"
// //                             loop
// //                             className="object-contain w-full h-full bg-black"
// //                         />
                        
// //                         {/* Video Details (Only for Users, not Bots) */}
// //                         {!bot && (
// //                             <div className="absolute left-4 bottom-24 text-white max-w-[70%] z-10">
// //                                 <p className="font-bold text-lg">@{item.userId?.username || 'FondPeaceUser'}</p>
// //                                 <p className="text-sm line-clamp-2 mt-1">{item.title || 'Viral Short Video'}</p>
// //                             </div>
// //                         )}
                        
// //                         {/* Add interaction icons, etc., here for users */}
                        
// //                     </div>
// //                 );
// //             })}

// //             {/* Load More Button/Indicator (Only for Users, not Bots) */}
// //             {!bot && (
// //                 <div className="p-6 text-center">
// //                     {loading ? (
// //                          <p className="text-gray-600">Loading...</p>
// //                     ) : (
// //                         <button onClick={loadMorePosts} className="px-4 py-2 bg-gray-900 text-white rounded">
// //                             Load more
// //                         </button>
// //                     )}
// //                 </div>
// //             )}
// //         </div>
// //     );
// // };

// // export default ReelsFeed;






// // 'use client';

// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import { useRouter, useParams } from 'next/navigation';
// // import toast from 'react-hot-toast';

// // const API_URL = "[https://backend-k.vercel.app/post/shorts](https://backend-k.vercel.app/post/shorts)";
// // const DEFAULT_THUMB = "/fondpeace.jpg"; // fallback thumbnail

// // const isBotUserAgent = () => {
// // if (typeof navigator === "undefined") return true;
// // const ua = navigator.userAgent.toLowerCase();
// // return (
// // ua.includes("googlebot") ||
// // ua.includes("adsbot") ||
// // ua.includes("mediapartners-google") ||
// // ua.includes("bingbot") ||
// // ua.includes("duckduckbot") ||
// // ua.includes("yandex") ||
// // ua.includes("baiduspider") ||
// // ua.includes("semrush") ||
// // ua.includes("ahrefs")
// // );
// // };

// // const ReelsFeed = ({ initialPost, initialRelated = [] }) => {
// // const router = useRouter();
// // const params = useParams();
// // const mainId = params?.id;

// // const [posts, setPosts] = useState(initialPost ? [initialPost, ...initialRelated] : []);
// // const [loading, setLoading] = useState(false);
// // const videoRefs = useRef([]);
// // const pageRef = useRef(1);

// // const bot = isBotUserAgent();

// // // ======================================================
// // // Autoplay + pause others
// // // ======================================================
// // const handleAutoPlay = useCallback(
// // (entries) => {
// // if (bot) return;
// // entries.forEach(entry => {
// // const video = entry.target;
// // if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
// // videoRefs.current.forEach(v => v && v !== video && v.pause());
// // video.play().catch(()=>{});
// // // dynamic URL update
// // const id = video.dataset.id;
// // if (id) router.replace(`/short/${id}`, { scroll: false });
// // } else {
// // video.pause();
// // }
// // });
// // },
// // [bot, router]
// // );

// // useEffect(() => {
// // if (bot) return;
// // const observer = new IntersectionObserver(handleAutoPlay, { threshold: [0,0.65] });
// // videoRefs.current.forEach(v => v && observer.observe(v));
// // return () => observer.disconnect();
// // }, [posts, handleAutoPlay, bot]);

// // // ======================================================
// // // Infinite scroll
// // // ======================================================
// // const loadMorePosts = async () => {
// // if (loading || bot) return;
// // setLoading(true);
// // try {
// // pageRef.current += 1;
// // const res = await fetch(`${API_URL}?page=${pageRef.current}&limit=6`);
// // const data = await res.json();
// // setPosts(prev => {
// // const ids = new Set(prev.map(x => x._id));
// // const newPosts = (data.videos || data).filter(x => !ids.has(x._id));
// // return [...prev, ...newPosts];
// // });
// // } catch(e) {
// // toast.error("Failed loading more videos");
// // }
// // setLoading(false);
// // };

// // useEffect(() => {
// // if (bot) return;
// // const observer = new IntersectionObserver(
// // (entries) => {
// // const lastItem = entries[0];
// // if (lastItem.isIntersecting) loadMorePosts();
// // },
// // { threshold: 0.1 }
// // );
// // const lastEl = document.querySelector(".last-feed-item");
// // if (lastEl) observer.observe(lastEl);
// // return () => observer.disconnect();
// // }, [posts, bot]);

// // // ======================================================
// // // Page UI
// // // ======================================================
// // if (!posts || posts.length === 0) {
// // return <div className="min-h-screen flex items-center justify-center">No videos yet</div>;
// // }

// // return ( <div className="reels-container w-full h-screen overflow-y-auto snap-y snap-mandatory">
// // {posts.map((item, index) => {
// // const videoUrl = item.media || item.mediaUrl;
// // const isLast = index === posts.length - 1;
// // return (
// // <div
// // key={item._id || index}
// // className={`video-wrapper ${isLast ? "last-feed-item" : ""} snap-start w-full h-screen flex items-center justify-center`}
// // data-id={item._id}
// // style={{ position: "relative" }}
// // >
// // <video
// // ref={el => (videoRefs.current[index] = el)}
// // src={videoUrl}
// // poster={item.thumbnail || DEFAULT_THUMB}
// // muted
// // playsInline
// // preload="metadata"
// // loop
// // className="object-contain w-full h-full"
// // /> <div className="absolute left-4 bottom-24 text-white max-w-[70%]"> <p className="font-semibold">@{item.userId?.username}</p> <p className="text-sm line-clamp-2 mt-1">{item.title}</p> </div> </div>
// // );
// // })} <div className="p-6 text-center"> <button
// //        onClick={loadMorePosts}
// //        className="px-4 py-2 bg-gray-900 text-white rounded"
// //      >
// // Load more </button> </div> </div>
// // );
// // };

// // export default ReelsFeed;











// // 'use client';
 
// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import { useRouter, useParams } from 'next/navigation';
// // import toast from 'react-hot-toast';
 
// // const API_URL = "https://backend-k.vercel.app/post/shorts";
// // const SECOND_API_URL = "https://backend-k.vercel.app/post";

// // /* ======================================================
// //    🚀 100% Accurate Bot Detector
// //    ====================================================== */
// // const isBotUserAgent = () => {
// //   if (typeof navigator === "undefined") return true; // Googlebot during SSR
// //   const ua = navigator.userAgent.toLowerCase();
// //   return (
// //     ua.includes("googlebot") ||
// //     ua.includes("adsbot") ||
// //     ua.includes("mediapartners-google") ||
// //     ua.includes("bingbot") ||
// //     ua.includes("duckduckbot") ||
// //     ua.includes("yandex") ||
// //     ua.includes("baiduspider") ||
// //     ua.includes("semrush") ||
// //     ua.includes("ahrefs")
// //   );
// // };

// // const ReelsFeed = ({ initialPost, initialRelated }) => {
// //   const router = useRouter();
// //   const params = useParams();
// //   const mainId = params?.id;

// //   const [posts, setPosts] = useState([initialPost, ...initialRelated]);
// //   const [loading, setLoading] = useState(false);
// //   const videoRefs = useRef([]);

// //   const bot = isBotUserAgent();

// //   /* ======================================================
// //      1️⃣ AUTOPLAY — Disabled for Googlebot
// //      ====================================================== */
// //   const handleAutoPlay = useCallback(
// //     (entries) => {
// //       if (bot) return; // Skip for bots

// //       entries.forEach((entry) => {
// //         const video = entry.target;

// //         if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
// //           video.play().catch(() => {});
// //         } else {
// //           video.pause();
// //         }
// //       });
// //     },
// //     [bot]
// //   );

// //   useEffect(() => {
// //     if (bot) return; // Googlebot never autoplays

// //     const observer = new IntersectionObserver(handleAutoPlay, {
// //       threshold: [0, 0.65],
// //     });

// //     videoRefs.current.forEach((vid) => vid && observer.observe(vid));

// //     return () => observer.disconnect();
// //   }, [posts, handleAutoPlay, bot]);

// //   /* ======================================================
// //      2️⃣ INFINITE SCROLL — Disabled for Googlebot
// //      ====================================================== */
// //   const loadMorePosts = async () => {
// //     if (loading || bot) return;
// //     setLoading(true);

// //     try {
// //       const res = await fetch(API_URL);
// //       const data = await res.json();
// //       setPosts((prev) => [...prev, ...data]);
// //     } catch (e) {
// //       toast.error("Failed loading more videos");
// //     }
// //     setLoading(false);
// //   };

// //   useEffect(() => {
// //     if (bot) return; // Googlebot never scrolls

// //     const lastItem = document.querySelector(".last-feed-item");
// //     if (!lastItem) return;

// //     const observer = new IntersectionObserver(
// //       (entries) => {
// //         if (entries[0].isIntersecting) loadMorePosts();
// //       },
// //       { threshold: 0.1 }
// //     );

// //     observer.observe(lastItem);
// //     return () => observer.disconnect();
// //   }, [posts, bot]);

// //   /* ======================================================
// //      3️⃣ DYNAMIC URL — Disabled for Googlebot
// //      ====================================================== */
// //   const handleVideoVisible = (id) => {
// //     if (bot) return; // Googlebot sees ONLY the main clean URL
// //     router.replace(`/short/${id}`, { scroll: false });
// //   };

// //   // Track visible video
// //   useEffect(() => {
// //     if (bot) return;

// //     const observer = new IntersectionObserver(
// //       (entries) => {
// //         entries.forEach((entry) => {
// //           if (!entry.isIntersecting) return;

// //           const id = entry.target.getAttribute("data-id");
// //           if (id) handleVideoVisible(id);
// //         });
// //       },
// //       { threshold: 0.9 }
// //     );

// //     document.querySelectorAll(".video-wrapper").forEach((el) => observer.observe(el));
// //     return () => observer.disconnect();
// //   }, [posts, bot]);


// //   /* ======================================================
// //      PAGE UI
// //      ====================================================== */
// //   return (
// //     <div className="reels-container" style={{ height: "100vh", overflowY: "scroll" }}>
// //       {posts.map((item, index) => {
// //         const videoUrl = item.mediaUrl;
// //         const isLast = index === posts.length - 1;

// //         return (
// //           <div
// //             key={item._id}
// //             className={`video-wrapper ${isLast ? "last-feed-item" : ""}`}
// //             data-id={item._id}
// //             style={{
// //               height: "100vh",
// //               position: "relative",
// //               scrollSnapAlign: "start",
// //             }}
// //           >
// //             <video
// //               ref={(el) => (videoRefs.current[index] = el)}
// //               src={videoUrl}
// //               muted
// //               playsInline
// //               preload="metadata"
// //               style={{
// //                 width: "100%",
// //                 height: "100%",
// //                 objectFit: "cover",
// //                 background: "#000",
// //               }}
// //             />
// //           </div>
// //         );
// //       })}
// //     </div>
// //   );
// // };

// // export default ReelsFeed;









// // // components/ReelsFeed.jsx (client)
// // "use client";
// // import React, { useEffect, useRef, useState, useCallback } from "react";
// // import { useRouter } from "next/navigation";

// // export default function ReelsFeed({ initialPost, initialRelated = [] }) {
// //   const router = useRouter();
// //   // Defensive: if initialPost is null/undefined, start with an empty list and fetch on mount
// //   const [posts, setPosts] = useState(initialPost ? [initialPost, ...initialRelated] : []);
// //   const videoRefs = useRef([]);
// //   const ioRef = useRef(null);

// //   // If no initial post, attempt to fetch first batch client-side
// //   useEffect(() => {
// //     if (!initialPost) {
// //       (async () => {
// //         try {
// //           const res = await fetch("/post/shorts?page=1&limit=6");
// //           if (!res.ok) return;
// //           const data = await res.json();
// //           setPosts(data.videos || []);
// //         } catch (e) {
// //           console.error("client fetch error:", e);
// //         }
// //       })();
// //     }
// //   }, [initialPost]);

// //   useEffect(() => {
// //     if (ioRef.current) ioRef.current.disconnect();
// //     ioRef.current = new IntersectionObserver(
// //       (entries) => {
// //         entries.forEach((entry) => {
// //           const el = entry.target;
// //           if (entry.isIntersecting && entry.intersectionRatio > 0.65) {
// //             const id = el.dataset.id;
// //             videoRefs.current.forEach((v) => {
// //               if (v && v !== el) {
// //                 try { v.pause(); } catch {}
// //               }
// //             });
// //             try { el.play().catch(()=>{}); } catch {}
// //             if (id) {
// //               router.replace(`/short/${id}`);
// //             }
// //           } else {
// //             try { entry.target.pause(); } catch {}
// //           }
// //         });
// //       },
// //       { threshold: [0.65] }
// //     );

// //     videoRefs.current.forEach((v) => v && ioRef.current.observe(v));
// //     return () => { ioRef.current && ioRef.current.disconnect(); };
// //   }, [posts, router]);

// //   const fetchMore = useCallback(async (page = 1) => {
// //     try {
// //       const res = await fetch(`/post/shorts?page=${page}&limit=6`);
// //       if (!res.ok) return;
// //       const data = await res.json();
// //       setPosts((p) => {
// //         const ids = new Set(p.map(x => x._id));
// //         const newOnes = (data.videos || []).filter(v => !ids.has(v._id));
// //         return [...p, ...newOnes];
// //       });
// //     } catch (e) {
// //       console.error("fetchMore error:", e);
// //     }
// //   }, []);

// //   const handleEnded = (idx) => {
// //     const next = videoRefs.current[idx + 1];
// //     if (next) next.scrollIntoView({ behavior: "smooth", block: "center" });
// //   };

// //   if (!posts || posts.length === 0) {
// //     return <div className="min-h-screen flex items-center justify-center">No videos yet</div>;
// //   }

// //   return (
// //     <div className="w-full h-screen overflow-y-auto snap-y snap-mandatory">
// //       {posts.map((p, idx) => (
// //         <div key={p._id || idx} className="snap-start w-full h-screen flex items-center justify-center">
// //           <div className="relative w-full h-full bg-black flex items-center justify-center">
// //             <video
// //               ref={(el) => (videoRefs.current[idx] = el)}
// //               src={p.media || p.mediaUrl}
// //               poster={p.thumbnail}
// //               data-id={p._id}
// //               playsInline
// //               loop
// //               controls={false}
// //               className="object-contain w-full h-full"
// //               onEnded={() => handleEnded(idx)}
// //             />
// //             <div className="absolute left-4 bottom-24 text-white max-w-[70%]">
// //               <p className="font-semibold">@{p.userId?.username}</p>
// //               <p className="text-sm line-clamp-2 mt-1">{p.title}</p>
// //             </div>
// //           </div>
// //         </div>
// //       ))}
// //       <div className="p-6 text-center">
// //         <button onClick={() => fetchMore(2)} className="px-4 py-2 bg-gray-900 text-white rounded">Load more</button>
// //       </div>
// //     </div>
// //   );
// // }
