'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';

const API_URL = "https://backend-k.vercel.app/post/shorts";
const DEFAULT_THUMB = "/fondpeace.jpg";

const isBotUserAgent = () => {
  if (typeof navigator === "undefined") return true;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("googlebot") ||
    ua.includes("adsbot") ||
    ua.includes("mediapartners-google") ||
    ua.includes("bingbot") ||
    ua.includes("duckduckbot") ||
    ua.includes("yandex") ||
    ua.includes("baiduspider") ||
    ua.includes("semrush") ||
    ua.includes("ahrefs")
  );
};

const ReelsFeed = ({ initialPost, initialRelated = [] }) => {
  const router = useRouter();
  const params = useParams();
  const mainId = params?.id;
  const bot = isBotUserAgent();

  const [posts, setPosts] = useState(bot ? [initialPost] : [initialPost, ...initialRelated]);
  const [loading, setLoading] = useState(false);
  const videoRefs = useRef([]);
  const pageRef = useRef(1);

  // Autoplay for users only
  const handleAutoPlay = useCallback(
    (entries) => {
      if (bot) return;
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
          videoRefs.current.forEach(v => v && v !== video && v.pause());
          video.play().catch(()=>{});
          const id = video.dataset.id;
          if (id) router.replace(`/short/${id}`, { scroll: false });
        } else {
          video.pause();
        }
      });
    },
    [bot, router]
  );

  useEffect(() => {
    if (bot) return;
    const observer = new IntersectionObserver(handleAutoPlay, { threshold: [0,0.65] });
    videoRefs.current.forEach(v => v && observer.observe(v));
    return () => observer.disconnect();
  }, [posts, handleAutoPlay, bot]);

  // Infinite scroll for users only
  const loadMorePosts = async () => {
    if (loading || bot) return;
    setLoading(true);
    try {
      pageRef.current += 1;
      const res = await fetch(`${API_URL}?page=${pageRef.current}&limit=6`);
      const data = await res.json();
      setPosts(prev => {
        const ids = new Set(prev.map(x => x._id));
        const newPosts = (data.videos || data).filter(x => !ids.has(x._id));
        return [...prev, ...newPosts];
      });
    } catch(e) {
      toast.error("Failed loading more videos");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (bot) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const lastItem = entries[0];
        if (lastItem.isIntersecting) loadMorePosts();
      },
      { threshold: 0.1 }
    );
    const lastEl = document.querySelector(".last-feed-item");
    if (lastEl) observer.observe(lastEl);
    return () => observer.disconnect();
  }, [posts, bot]);

  if (!posts || posts.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">No videos yet</div>;
  }

  return (
    <div className="reels-container w-full h-screen snap-y snap-mandatory" style={{ overflowY: bot ? "hidden" : "scroll" }}>
      {posts.map((item, index) => {
        const videoUrl = item.media || item.mediaUrl;
        const isLast = index === posts.length - 1;

        return (
          <div
            key={item._id || index}
            className={`video-wrapper ${isLast ? "last-feed-item" : ""} snap-start w-full h-screen flex items-center justify-center`}
            data-id={item._id}
            style={{ position: "relative" }}
          >
            <video
              ref={el => (videoRefs.current[index] = el)}
              src={videoUrl}
              poster={item.thumbnail || DEFAULT_THUMB}
              muted
              playsInline
              preload="metadata"
              loop
              className="object-contain w-full h-full"
            />
            {!bot && (
              <div className="absolute left-4 bottom-24 text-white max-w-[70%]">
                <p className="font-semibold">@{item.userId?.username}</p>
                <p className="text-sm line-clamp-2 mt-1">{item.title}</p>
              </div>
            )}
          </div>
        );
      })}

      {!bot && (
        <div className="p-6 text-center">
          <button onClick={loadMorePosts} className="px-4 py-2 bg-gray-900 text-white rounded">
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

export default ReelsFeed;










// 'use client';

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import toast from 'react-hot-toast';

// const API_URL = "[https://backend-k.vercel.app/post/shorts](https://backend-k.vercel.app/post/shorts)";
// const DEFAULT_THUMB = "/fondpeace.jpg"; // fallback thumbnail

// const isBotUserAgent = () => {
// if (typeof navigator === "undefined") return true;
// const ua = navigator.userAgent.toLowerCase();
// return (
// ua.includes("googlebot") ||
// ua.includes("adsbot") ||
// ua.includes("mediapartners-google") ||
// ua.includes("bingbot") ||
// ua.includes("duckduckbot") ||
// ua.includes("yandex") ||
// ua.includes("baiduspider") ||
// ua.includes("semrush") ||
// ua.includes("ahrefs")
// );
// };

// const ReelsFeed = ({ initialPost, initialRelated = [] }) => {
// const router = useRouter();
// const params = useParams();
// const mainId = params?.id;

// const [posts, setPosts] = useState(initialPost ? [initialPost, ...initialRelated] : []);
// const [loading, setLoading] = useState(false);
// const videoRefs = useRef([]);
// const pageRef = useRef(1);

// const bot = isBotUserAgent();

// // ======================================================
// // Autoplay + pause others
// // ======================================================
// const handleAutoPlay = useCallback(
// (entries) => {
// if (bot) return;
// entries.forEach(entry => {
// const video = entry.target;
// if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
// videoRefs.current.forEach(v => v && v !== video && v.pause());
// video.play().catch(()=>{});
// // dynamic URL update
// const id = video.dataset.id;
// if (id) router.replace(`/short/${id}`, { scroll: false });
// } else {
// video.pause();
// }
// });
// },
// [bot, router]
// );

// useEffect(() => {
// if (bot) return;
// const observer = new IntersectionObserver(handleAutoPlay, { threshold: [0,0.65] });
// videoRefs.current.forEach(v => v && observer.observe(v));
// return () => observer.disconnect();
// }, [posts, handleAutoPlay, bot]);

// // ======================================================
// // Infinite scroll
// // ======================================================
// const loadMorePosts = async () => {
// if (loading || bot) return;
// setLoading(true);
// try {
// pageRef.current += 1;
// const res = await fetch(`${API_URL}?page=${pageRef.current}&limit=6`);
// const data = await res.json();
// setPosts(prev => {
// const ids = new Set(prev.map(x => x._id));
// const newPosts = (data.videos || data).filter(x => !ids.has(x._id));
// return [...prev, ...newPosts];
// });
// } catch(e) {
// toast.error("Failed loading more videos");
// }
// setLoading(false);
// };

// useEffect(() => {
// if (bot) return;
// const observer = new IntersectionObserver(
// (entries) => {
// const lastItem = entries[0];
// if (lastItem.isIntersecting) loadMorePosts();
// },
// { threshold: 0.1 }
// );
// const lastEl = document.querySelector(".last-feed-item");
// if (lastEl) observer.observe(lastEl);
// return () => observer.disconnect();
// }, [posts, bot]);

// // ======================================================
// // Page UI
// // ======================================================
// if (!posts || posts.length === 0) {
// return <div className="min-h-screen flex items-center justify-center">No videos yet</div>;
// }

// return ( <div className="reels-container w-full h-screen overflow-y-auto snap-y snap-mandatory">
// {posts.map((item, index) => {
// const videoUrl = item.media || item.mediaUrl;
// const isLast = index === posts.length - 1;
// return (
// <div
// key={item._id || index}
// className={`video-wrapper ${isLast ? "last-feed-item" : ""} snap-start w-full h-screen flex items-center justify-center`}
// data-id={item._id}
// style={{ position: "relative" }}
// >
// <video
// ref={el => (videoRefs.current[index] = el)}
// src={videoUrl}
// poster={item.thumbnail || DEFAULT_THUMB}
// muted
// playsInline
// preload="metadata"
// loop
// className="object-contain w-full h-full"
// /> <div className="absolute left-4 bottom-24 text-white max-w-[70%]"> <p className="font-semibold">@{item.userId?.username}</p> <p className="text-sm line-clamp-2 mt-1">{item.title}</p> </div> </div>
// );
// })} <div className="p-6 text-center"> <button
//        onClick={loadMorePosts}
//        className="px-4 py-2 bg-gray-900 text-white rounded"
//      >
// Load more </button> </div> </div>
// );
// };

// export default ReelsFeed;











// 'use client';
 
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import toast from 'react-hot-toast';
 
// const API_URL = "https://backend-k.vercel.app/post/shorts";
// const SECOND_API_URL = "https://backend-k.vercel.app/post";

// /* ======================================================
//    🚀 100% Accurate Bot Detector
//    ====================================================== */
// const isBotUserAgent = () => {
//   if (typeof navigator === "undefined") return true; // Googlebot during SSR
//   const ua = navigator.userAgent.toLowerCase();
//   return (
//     ua.includes("googlebot") ||
//     ua.includes("adsbot") ||
//     ua.includes("mediapartners-google") ||
//     ua.includes("bingbot") ||
//     ua.includes("duckduckbot") ||
//     ua.includes("yandex") ||
//     ua.includes("baiduspider") ||
//     ua.includes("semrush") ||
//     ua.includes("ahrefs")
//   );
// };

// const ReelsFeed = ({ initialPost, initialRelated }) => {
//   const router = useRouter();
//   const params = useParams();
//   const mainId = params?.id;

//   const [posts, setPosts] = useState([initialPost, ...initialRelated]);
//   const [loading, setLoading] = useState(false);
//   const videoRefs = useRef([]);

//   const bot = isBotUserAgent();

//   /* ======================================================
//      1️⃣ AUTOPLAY — Disabled for Googlebot
//      ====================================================== */
//   const handleAutoPlay = useCallback(
//     (entries) => {
//       if (bot) return; // Skip for bots

//       entries.forEach((entry) => {
//         const video = entry.target;

//         if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
//           video.play().catch(() => {});
//         } else {
//           video.pause();
//         }
//       });
//     },
//     [bot]
//   );

//   useEffect(() => {
//     if (bot) return; // Googlebot never autoplays

//     const observer = new IntersectionObserver(handleAutoPlay, {
//       threshold: [0, 0.65],
//     });

//     videoRefs.current.forEach((vid) => vid && observer.observe(vid));

//     return () => observer.disconnect();
//   }, [posts, handleAutoPlay, bot]);

//   /* ======================================================
//      2️⃣ INFINITE SCROLL — Disabled for Googlebot
//      ====================================================== */
//   const loadMorePosts = async () => {
//     if (loading || bot) return;
//     setLoading(true);

//     try {
//       const res = await fetch(API_URL);
//       const data = await res.json();
//       setPosts((prev) => [...prev, ...data]);
//     } catch (e) {
//       toast.error("Failed loading more videos");
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     if (bot) return; // Googlebot never scrolls

//     const lastItem = document.querySelector(".last-feed-item");
//     if (!lastItem) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) loadMorePosts();
//       },
//       { threshold: 0.1 }
//     );

//     observer.observe(lastItem);
//     return () => observer.disconnect();
//   }, [posts, bot]);

//   /* ======================================================
//      3️⃣ DYNAMIC URL — Disabled for Googlebot
//      ====================================================== */
//   const handleVideoVisible = (id) => {
//     if (bot) return; // Googlebot sees ONLY the main clean URL
//     router.replace(`/short/${id}`, { scroll: false });
//   };

//   // Track visible video
//   useEffect(() => {
//     if (bot) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (!entry.isIntersecting) return;

//           const id = entry.target.getAttribute("data-id");
//           if (id) handleVideoVisible(id);
//         });
//       },
//       { threshold: 0.9 }
//     );

//     document.querySelectorAll(".video-wrapper").forEach((el) => observer.observe(el));
//     return () => observer.disconnect();
//   }, [posts, bot]);


//   /* ======================================================
//      PAGE UI
//      ====================================================== */
//   return (
//     <div className="reels-container" style={{ height: "100vh", overflowY: "scroll" }}>
//       {posts.map((item, index) => {
//         const videoUrl = item.mediaUrl;
//         const isLast = index === posts.length - 1;

//         return (
//           <div
//             key={item._id}
//             className={`video-wrapper ${isLast ? "last-feed-item" : ""}`}
//             data-id={item._id}
//             style={{
//               height: "100vh",
//               position: "relative",
//               scrollSnapAlign: "start",
//             }}
//           >
//             <video
//               ref={(el) => (videoRefs.current[index] = el)}
//               src={videoUrl}
//               muted
//               playsInline
//               preload="metadata"
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 objectFit: "cover",
//                 background: "#000",
//               }}
//             />
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default ReelsFeed;









// // components/ReelsFeed.jsx (client)
// "use client";
// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useRouter } from "next/navigation";

// export default function ReelsFeed({ initialPost, initialRelated = [] }) {
//   const router = useRouter();
//   // Defensive: if initialPost is null/undefined, start with an empty list and fetch on mount
//   const [posts, setPosts] = useState(initialPost ? [initialPost, ...initialRelated] : []);
//   const videoRefs = useRef([]);
//   const ioRef = useRef(null);

//   // If no initial post, attempt to fetch first batch client-side
//   useEffect(() => {
//     if (!initialPost) {
//       (async () => {
//         try {
//           const res = await fetch("/post/shorts?page=1&limit=6");
//           if (!res.ok) return;
//           const data = await res.json();
//           setPosts(data.videos || []);
//         } catch (e) {
//           console.error("client fetch error:", e);
//         }
//       })();
//     }
//   }, [initialPost]);

//   useEffect(() => {
//     if (ioRef.current) ioRef.current.disconnect();
//     ioRef.current = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           const el = entry.target;
//           if (entry.isIntersecting && entry.intersectionRatio > 0.65) {
//             const id = el.dataset.id;
//             videoRefs.current.forEach((v) => {
//               if (v && v !== el) {
//                 try { v.pause(); } catch {}
//               }
//             });
//             try { el.play().catch(()=>{}); } catch {}
//             if (id) {
//               router.replace(`/short/${id}`);
//             }
//           } else {
//             try { entry.target.pause(); } catch {}
//           }
//         });
//       },
//       { threshold: [0.65] }
//     );

//     videoRefs.current.forEach((v) => v && ioRef.current.observe(v));
//     return () => { ioRef.current && ioRef.current.disconnect(); };
//   }, [posts, router]);

//   const fetchMore = useCallback(async (page = 1) => {
//     try {
//       const res = await fetch(`/post/shorts?page=${page}&limit=6`);
//       if (!res.ok) return;
//       const data = await res.json();
//       setPosts((p) => {
//         const ids = new Set(p.map(x => x._id));
//         const newOnes = (data.videos || []).filter(v => !ids.has(v._id));
//         return [...p, ...newOnes];
//       });
//     } catch (e) {
//       console.error("fetchMore error:", e);
//     }
//   }, []);

//   const handleEnded = (idx) => {
//     const next = videoRefs.current[idx + 1];
//     if (next) next.scrollIntoView({ behavior: "smooth", block: "center" });
//   };

//   if (!posts || posts.length === 0) {
//     return <div className="min-h-screen flex items-center justify-center">No videos yet</div>;
//   }

//   return (
//     <div className="w-full h-screen overflow-y-auto snap-y snap-mandatory">
//       {posts.map((p, idx) => (
//         <div key={p._id || idx} className="snap-start w-full h-screen flex items-center justify-center">
//           <div className="relative w-full h-full bg-black flex items-center justify-center">
//             <video
//               ref={(el) => (videoRefs.current[idx] = el)}
//               src={p.media || p.mediaUrl}
//               poster={p.thumbnail}
//               data-id={p._id}
//               playsInline
//               loop
//               controls={false}
//               className="object-contain w-full h-full"
//               onEnded={() => handleEnded(idx)}
//             />
//             <div className="absolute left-4 bottom-24 text-white max-w-[70%]">
//               <p className="font-semibold">@{p.userId?.username}</p>
//               <p className="text-sm line-clamp-2 mt-1">{p.title}</p>
//             </div>
//           </div>
//         </div>
//       ))}
//       <div className="p-6 text-center">
//         <button onClick={() => fetchMore(2)} className="px-4 py-2 bg-gray-900 text-white rounded">Load more</button>
//       </div>
//     </div>
//   );
// }
