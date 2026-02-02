'use client';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import jwt from "jsonwebtoken";
import toast from "react-hot-toast";
import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaEye, FaVolumeMute, FaVolumeUp } from "react-icons/fa";

export default function Village({ initialPosts = [] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);

  const [commentTextMap, setCommentTextMap] = useState({});
  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [userId, setUserId] = useState(null);
  const [mutedMap, setMutedMap] = useState({});
  const videoRefs = useRef([]);
  const router = useRouter();
  const API_BASE = "https://backend-k.vercel.app";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUserId(decoded.UserId);
      }
    } catch (e) { console.error("Token error"); }
  }, []);
  useEffect(() => {
  if (page === 1) return;

  axios
    .get(`${API_BASE}/post/mango/getall?page=${page}`)
    .then((res) => {
      if (!res.data.length) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...res.data]);
      }
    })
    .catch(() => {});
}, [page]);

  
  const viewedPosts = useRef(new Set());

const increaseView = useCallback((postId) => {
  if (viewedPosts.current.has(postId)) return;

  viewedPosts.current.add(postId);
  console.log(viewedPosts.current.add(postId));

  axios.post(`${API_BASE}/post/view/${postId}`).catch(() => {});
}, []);

// 👁️ VIEW OBSERVER
const viewObserver = useRef(null);

const viewPostRef = useCallback(
  (node, postId) => {
    if (!node) return;

    if (viewObserver.current) viewObserver.current.disconnect();

    viewObserver.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          increaseView(postId); // 🔥 VIEW COUNT HERE
        }
      },
      { threshold: 0.6 }
    );

    viewObserver.current.observe(node);
  },
  [increaseView]
);

  
  useEffect(() => {
    if (!posts.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );
    videoRefs.current.forEach((video) => { if (video) observer.observe(video); });
    return () => observer.disconnect();
  }, [posts]);

  const hasLikedPost = useCallback((post) => {
    if (!userId || !Array.isArray(post.likes)) return false;
    return post.likes.some((id) => id?.toString() === userId.toString());
  }, [userId]);

  const handleLikePost = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Please login"); return; }
    try {
      const res = await axios.post(`${API_BASE}/post/like/${postId}`, {}, { headers: { "x-auth-token": token } });
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (err) { toast.error("Failed to like"); }
  };

  const handleComment = async (postId) => {
    const token = localStorage.getItem("token");
    const comment = commentTextMap[postId]?.trim();
    if (!token || !comment) return;
    try {
      const res = await axios.post(`${API_BASE}/post/comment/${postId}`, { CommentText: comment, userId }, { headers: { "x-auth-token": token } });
      setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, comments: res.data.comments } : p));
      toast.success("Commented");
    } catch { toast.error("Error"); }
  };

  const toggleMute = (index) => {
    const video = videoRefs.current[index];
    if (video) {
      video.muted = !video.muted;
      setMutedMap(prev => ({ ...prev, [index]: video.muted }));
    }
  };
  const lastPostRef = useCallback(
  (node) => {
    if (!hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1); // ✅ LOAD NEXT PAGE
      }
    });

    if (node) observerRef.current.observe(node);
  },
  [hasMore]
);


  const renderPost = useCallback((post, index) => {
    const isExpanded = expandedPosts[post._id];
    const isVideo = post.mediaType?.startsWith("video");
    const title = post.title || "";
    const titleText = isExpanded ? title : title.slice(0, 100) + (title.length > 100 ? "..." : "");

   return (
  <article 
    key={post._id} 
    className="bg-white w-full max-w-[600px] mx-auto mb-4 sm:mb-8 sm:rounded-lg overflow-hidden border-y sm:border border-gray-200 shadow-sm"
  >
    
    {/* 1. HEADER - Clean & Compact */}
    <div className="flex items-center justify-between p-3 h-[56px]">
      <div className="flex items-center gap-3">
        <Link href={`/profile/${post.userId?.username}`} className="relative group">
          {/* Story-style gradient ring */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
            <div className="bg-white p-[1.5px] rounded-full w-full h-full">
              <img 
                src="https://www.fondpeace.com/og-image.jpg" 
                alt="profile" 
                className="w-full h-full rounded-full object-cover" 
              />
            </div>
          </div>
        </Link>
        <Link href={`/profile/${post.userId?.username}`} className="flex flex-col">
          <span className="text-sm font-bold text-gray-900 leading-none hover:underline">
            {post.userId?.username || "Unknown"}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 font-medium">{new Date(post.createdAt).toLocaleDateString()}</span>
        </Link>
      </div>
      <button onClick={() => toast("Options coming soon 🚀")} className="text-gray-500 hover:text-black px-2 transition-colors">
        <span className="text-lg tracking-widest font-bold">•••</span>
      </button>
    </div>

    {/* 2. MEDIA SECTION - No more "Ugly" stretching */}
    {post.media && (
      <div className="relative w-full bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[750px]">
        <Link 
          href={isVideo ? `/short/${post._id}` : `/post/${post._id}`} 
          className="w-full h-full flex items-center justify-center bg-black"
        >
          {isVideo ? (
            <video
              ref={(ref) => (videoRefs.current[index] = ref)}
              src={post.media}
              autoPlay
              loop
              playsInline
             muted
             preload="none"
              /* h-auto + object-contain prevents distorted faces/shapes */
              className="w-full h-auto max-h-[750px] object-contain block mx-auto"
            />
          ) : (
            <img 
              src={post.media} 
              alt={post.title} 
              className="w-full h-auto max-h-[750px] object-contain block mx-auto" 
            />
          )}
        </Link>
        
        {isVideo && (
          <button 
            onClick={(e) => { e.preventDefault(); toggleMute(index); }}
            className="absolute bottom-4 right-4 bg-black/60 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/80 transition"
          >
            {mutedMap[index] ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
          </button>
        )}
      </div>
    )}

    {/* 3. INTERACTION & CONTENT AREA */}
    <div className="px-3 pt-3 pb-4">
      {/* Action Icons */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <button onClick={() => handleLikePost(post._id)} className="flex items-center gap-1 transition-transform active:scale-125">
  {hasLikedPost(post) ? (
    <div className="flex items-center gap-1">
      <FaHeart className="text-red-500 text-[26px]" />
      <span>{post.likes?.length || 0}</span>
    </div>
  ) : (
    <div className="flex items-center gap-1">
      <FaRegHeart className="text-[26px] text-gray-800 hover:text-gray-500" />
      <span>{post.likes?.length || 0}</span>
    </div>
  )}
</button>

          <button onClick={() => setCommentBoxOpen(p => ({...p, [post._id]: !commentBoxOpen[post._id]}))} className="flex items-center gap-1 transition-transform active:scale-125">
            <FaCommentDots className="text-[24px] text-gray-800 hover:text-gray-500" /> 
            <span>{post.comments?.length || 0}</span>
          </button>
          <button onClick={() => handleShare(post)}>
            <FaShareAlt className="text-[22px] text-gray-800 hover:text-gray-500" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
          <FaEye size={14} />
          <span className="text-[11px] font-bold">{post.views || 0}</span>
        </div>
      </div>

      {/* Stats and Caption */}
      <div className="space-y-1.5">
        
        
        <div className="text-sm text-gray-900 leading-snug">
          <span className="font-bold mr-2 hover:underline cursor-pointer">
            {post.userId?.username}
          </span>
          <span className="whitespace-pre-wrap">{titleText}</span>
          {title.length > 100 && (
            <button 
              onClick={() => setExpandedPosts(p => ({...p, [post._id]: !isExpanded}))} 
              className="text-gray-500 font-medium ml-1 hover:text-gray-700"
            >
              {isExpanded ? " show less" : "...more"}
            </button>
          )}
        </div>

        {/* Comment Preview Logic */}
        {post.comments?.length > 0 && !commentBoxOpen[post._id] && (
          <button 
            onClick={() => setCommentBoxOpen(p => ({...p, [post._id]: true}))}
            className="text-sm text-gray-500 block hover:text-gray-400 transition"
          >
            View all {post.comments.length} comments
          </button>
        )}
      </div>

      {/* Active Comments Dropdown */}
      {commentBoxOpen[post._id] && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
            {post.comments?.map((cmt, i) => (
              <div key={i} className="flex gap-2 text-sm items-start">
                <span className="font-bold whitespace-nowrap">{cmt?.userId?.username || "User"}</span>
                <span className="text-gray-700 leading-tight">{cmt?.CommentText}</span>
              </div>
            ))}
          </div>
          
          {/* New Comment Input Field */}
          <div className="flex items-center gap-3 mt-2 border border-gray-100 rounded-full px-4 py-2 bg-gray-50 focus-within:bg-white focus-within:border-blue-200 transition-all">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentTextMap[post._id] || ""}
              onChange={(e) => setCommentTextMap(p => ({...p, [post._id]: e.target.value}))}
              className="flex-1 text-sm bg-transparent outline-none text-gray-800"
            />
            <button 
              onClick={() => handleComment(post._id)}
              disabled={!commentTextMap[post._id]?.trim()}
              className="text-blue-500 text-sm font-bold disabled:opacity-30 hover:text-blue-700 transition"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  </article>
);
  }, [commentTextMap, commentBoxOpen, expandedPosts, userId, mutedMap]);

  return (
    <div className="max-w-2xl mx-auto w-full">
      {posts.map((post, idx) => {
  const isLast = idx === posts.length - 1;

  return (
    <div
      key={post._id}
      ref={(node) => {
        viewPostRef(node, post._id); // 👁️ VIEW
        if (isLast) lastPostRef(node); // ⬇️ LOAD MORE
      }}
    >
      {renderPost(post, idx)}
    </div>
  );
})}


    </div>
  );
}













// 'use client';
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import Link from "next/link";
// import jwt from "jsonwebtoken";
// import toast from "react-hot-toast";

 
// import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaEye } from "react-icons/fa";
  

// export default function Village({ initialPosts = [] }) {

//   const [posts, setPosts] = useState(initialPosts);
//   const [commentTextMap, setCommentTextMap] = useState({});
//   const [commentBoxOpen, setCommentBoxOpen] = useState({});
//   const [expandedPosts, setExpandedPosts] = useState({});
//   const [userId, setUserId] = useState(null);
//   const videoRefs = useRef([]);
//   const router = useRouter();
//   const API_BASE = "https://backend-k.vercel.app";

  

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     const startRedirectTimer = () => {
//       const timer = setTimeout(() => {
//         window.location.href = "/login";
//       }, 2 * 60 * 1000);
//       return timer;
//     };

//     let timer;

    

//     if (!token) {
//       timer = startRedirectTimer();
//       return () => clearTimeout(timer);
//     }

//     try {
//       const decoded = jwt.decode(token);

//       if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
//         localStorage.removeItem("token");
//         timer = startRedirectTimer();
//         return () => clearTimeout(timer);
//       }

//       setUserId(decoded.UserId);
//     } catch {
//       localStorage.removeItem("token");
//       timer = startRedirectTimer();
//       return () => clearTimeout(timer);
//     }
//   }, []);

//   // IntersectionObserver for autoplay on 50% visibility
//   useEffect(() => {
//     if (!posts.length) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           const video = entry.target;
//           if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
//             video.play().catch(() => {});
//           } else {
//             video.pause();
//           }
//         });
//       },
//       { threshold: 0.5 }
//     );

//     videoRefs.current.forEach((video) => {
//       if (video) observer.observe(video);
//     });

//     return () => observer.disconnect();
//   }, [posts]);

  

//  const hasLikedPost = useCallback(
//   (post) => {
//     if (!userId) return false;
//     if (!Array.isArray(post.likes)) return false;

//     return post.likes.some(
//       (id) => id?.toString() === userId.toString()
//     );
//   },
//   [userId]
// );



//   const handleLikePost = async (postId) => {
//   const token = localStorage.getItem("token");

//   if (!token || !userId) {
//     toast.error("Please login to like this post");
//     router.push("/login");
//     return;
//   }

//   try {
//     const res = await axios.post(
//       `${API_BASE}/post/like/${postId}`,
//       {},
//       { headers: { "x-auth-token": token } }
//     );

//     setPosts((prev) =>
//       prev.map((p) =>
//         p._id === postId
//           ? { ...p, likes: res.data.likes }
//           : p
//       )
//     );
//   } catch (err) {
//     toast.error("Failed to like post");
//   }
// };




//   const handleComment = async (postId) => {
//   const token = localStorage.getItem("token");
//   const comment = commentTextMap[postId]?.trim();

//   if (!token || !userId) {
//     toast.error("Login required to comment");
//     router.push("/login");
//     return;
//   }

//   if (!comment) {
//     toast.error("Comment cannot be empty");
//     return;
//   }

//   try {
//     const res = await axios.post(
//       `${API_BASE}/post/comment/${postId}`,
//       { CommentText: comment, userId },
//       { headers: { "x-auth-token": token } }
//     );

//     setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
//     setPosts((prev) =>
//       prev.map((p) =>
//         p._id === postId
//           ? { ...p, comments: res.data.comments }
//           : p
//       )
//     );

//     toast.success("Comment added");
//   } catch {
//     toast.error("Failed to post comment");
//   }
// };


//   const toggleCommentBox = (postId) => {
//     setCommentBoxOpen((prev) => ({ ...prev, [postId]: !prev[postId] }));
//   };

//   const toggleExpanded = (postId) => {
//     setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
//   };

//   const handleShare = async (post) => {
//   try {
//     const shareText = `${post.title}\n${window.location.origin}/post/${post._id}`;
//     await navigator.clipboard.writeText(shareText);
//     toast.success("Link copied to clipboard");
//   } catch (error) {
//     console.error("Share failed:", error);
//     toast.error("Share failed");
//   }
// };




//   const renderPost = useCallback(
//     (post, index) => {
//       const isExpanded = expandedPosts[post._id];
//       const isVideo = post.mediaType?.startsWith("video");
//       const commentText = commentTextMap[post._id] || "";
//       const commentsVisible = commentBoxOpen[post._id];
//       const title = post.title || "";
//       const titleText = isExpanded
//         ? title
//         : title.slice(0, 100) + (title.length > 100 ? "..." : "");



      
//   return (
//         <div key={post._id} className="bg-white shadow rounded-lg p-4 mb-6">
          
          
//           <div className="flex items-center justify-between mb-4">
//   {/* Left side → Avatar + Username */}
//   <div className="flex items-center gap-3">
//    <Link
//         href={`/profile/${post.userId?.username}`}
//         className="flex items-center gap-3"
//     >
//     <img
//       src={"https://www.fondpeace.com/og-image.jpg"}
//       alt="profile"
//       className="w-12 h-12 rounded-full object-cover"
//     />
//     <span className="font-semibold text-gray-900">
//       {post.userId?.username || "Unknown"}
//     </span>
//    </Link>
//   </div>

//   {/* Right side → 3 dots menu */}
//   <button
//     className="text-gray-600 hover:text-gray-900 text-2xl px-2"
//     onClick={(e) => {
//       e.stopPropagation(); // prevent opening post when clicked
//       toast("Options coming soon 🚀");

//     }}
//   >
//     ⋮
//   </button>
// </div>





          

//           <p className="text-gray-800 mb-4">
//             {titleText}
//             {title.length > 100 && (
//               <span
//                 className="text-blue-600 ml-2 cursor-pointer"
//                 onClick={() => toggleExpanded(post._id)}
//               >
//                 {isExpanded ? " See less" : " See more"}
//               </span>
//             )}
//           </p>

          
              
//                {post.media && (
//   <Link
//     href={isVideo ? `/short/${post._id}` : `/post/${post._id}`}
//     prefetch
//   >
//     <div className="relative w-full max-w-[600px] aspect-square rounded-lg mb-4 overflow-hidden mx-auto shadow-md cursor-pointer">
      
//       {/* VIDEO */}
//       {isVideo ? (
//         <video
//           ref={(ref) => (videoRefs.current[index] = ref)}
//           src={post.media}
//           autoPlay
//           loop
//           playsInline
//           muted
//           preload="none"
//           className="w-full h-full object-cover rounded-lg"
//         />
//       ) : (
//         /* IMAGE */
//         <img
//           src={post.media}
//           alt={post.title}
//           className="w-full h-full object-cover rounded-lg"
//         />
//       )}

//       {/* Sound toggle for video only */}
//       {isVideo && (
//         <button
//           className="absolute bottom-3 right-3 bg-black/60 text-white rounded-full p-2"
//           onClick={(e) => {
//             e.preventDefault();
//             e.stopPropagation();
//             const video = videoRefs.current[index];
//             if (video) video.muted = !video.muted;
//           }}
//         >
//           🔊
//         </button>
//       )}

//     </div>
//   </Link>
// )}


             

//           <div className="flex items-center justify-between text-gray-700 mb-4 text-sm">

//   {/* ❤️ LIKE */}
//   <button
//     onClick={() => handleLikePost(post._id)}
//     className="flex items-center gap-1"
//   >
//     {hasLikedPost(post) ? (
//       <FaHeart className="text-red-600 text-lg" />
//     ) : (
//       <FaRegHeart className="text-lg" />
//     )}
//     <span>{post.likes?.length || 0}</span>
//   </button>

//   {/* 💬 COMMENT */}
//   <button
//     onClick={() => toggleCommentBox(post._id)}
//     className="flex items-center gap-1"
//   >
//     <FaCommentDots className="text-lg" />
//     <span>{post.comments?.length || 0}</span>
//   </button>

//   {/* 👁️ VIEWS */}
//   <div className="flex items-center gap-1">
//     <FaEye className="text-lg text-gray-600" />
//     <span>{post.views || 0}</span>
//   </div>

//   {/* 🔗 SHARE */}
//   <button
//     onClick={() => handleShare(post)}
//     className="flex items-center gap-1 text-blue-600"
//   >
//     <FaShareAlt className="text-lg" />
    
//   </button>

// </div>


//           {commentsVisible && (
//             <div className="mt-4">
//               <input
//                 type="text"
//                 placeholder="Write a comment..."
//                 value={commentText}
//                 onChange={(e) =>
//                   setCommentTextMap((prev) => ({
//                     ...prev,
//                     [post._id]: e.target.value,
//                   }))
//                 }
//                 className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
//               />
//               <button
//                 onClick={() => handleComment(post._id)}
//                 className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
//               >
//                 Post Comment
//               </button>

//               <div className="mt-4 space-y-2">
//                 {Array.isArray(post.comments) &&
//   post.comments.map((cmt, i) => (
//     <div key={i} className="bg-gray-100 p-3 rounded-md">
//       <p className="font-semibold text-gray-800">
//         {cmt?.userId?.username || "User"}
//       </p>
//       <p className="text-gray-700">{cmt?.CommentText}</p>
//     </div>
// ))}

//               </div>
//             </div>
//           )}
//         </div>
//       );
//     },
//     [commentTextMap, commentBoxOpen, expandedPosts, userId]
//   );

  

//   return (
//   <div className="max-w-2xl mx-auto space-y-8 px-2 sm:px-0">
//     {posts.map((post, idx) => renderPost(post, idx))}
//   </div>
// );

//           }










// // 'use client';
// // import React, { useCallback, useEffect, useRef, useState } from "react";
// // import { useRouter } from "next/navigation";
// // import axios from "axios";
// // import Link from "next/link";
// // import jwt from "jsonwebtoken";
// // import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaEye } from "react-icons/fa";

// // export default function Village({ initialPosts = [] }) {
// //   const [posts, setPosts] = useState(initialPosts);
// //   const [commentTextMap, setCommentTextMap] = useState({});
// //   const [commentBoxOpen, setCommentBoxOpen] = useState({});
// //   const [loading, setLoading] = useState(true);
// //   const [expandedPosts, setExpandedPosts] = useState({});
// //   const [userId, setUserId] = useState(null);
// //   const videoRefs = useRef([]);
// //   const router = useRouter();
// //   const API_BASE = "https://backend-k.vercel.app";

// //   // Set userId from token
// //   useEffect(() => {
// //     const token = localStorage.getItem("token");

// //     const startRedirectTimer = () => {
// //       const timer = setTimeout(() => {
// //         window.location.href = "/login";
// //       }, 2 * 60 * 1000);
// //       return timer;
// //     };

// //     let timer;

// //     if (!token) {
// //       timer = startRedirectTimer();
// //       return () => clearTimeout(timer);
// //     }

// //     try {
// //       const decoded = jwt.decode(token);

// //       if (!decoded || !decoded.exp || decoded.exp * 1000 < Date.now()) {
// //         localStorage.removeItem("token");
// //         timer = startRedirectTimer();
// //         return () => clearTimeout(timer);
// //       }

// //       setUserId(decoded.UserId);
// //     } catch {
// //       localStorage.removeItem("token");
// //       timer = startRedirectTimer();
// //       return () => clearTimeout(timer);
// //     }
// //   }, []);

// //   // IntersectionObserver for autoplay videos
// //   useEffect(() => {
// //     if (!posts.length) return;

// //     const observer = new IntersectionObserver(
// //       (entries) => {
// //         entries.forEach((entry) => {
// //           const video = entry.target;
// //           if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
// //             video.play().catch(() => {});
// //           } else {
// //             video.pause();
// //           }
// //         });
// //       },
// //       { threshold: 0.5 }
// //     );

// //     videoRefs.current.forEach((video) => {
// //       if (video) observer.observe(video);
// //     });

// //     return () => observer.disconnect();
// //   }, [posts]);

// //   // Safe check for likes
// //   const hasLikedPost = (post) =>
// //     (post.likes || []).some((id) => id && userId && id.toString() === userId.toString());

// //   const handleLikePost = async (postId) => {
// //     const token = localStorage.getItem("token");
// //     if (!token) return alert("You must be logged in to like");

// //     try {
// //       const res = await axios.post(
// //         `${API_BASE}/post/like/${postId}`,
// //         {},
// //         { headers: { "x-auth-token": token } }
// //       );
// //       setPosts((prev) =>
// //         prev.map((p) => (p._id === postId ? res.data : p))
// //       );
// //     } catch {
// //       alert("Failed to toggle like");
// //     }
// //   };

// //   const handleComment = async (postId) => {
// //     const token = localStorage.getItem("token");
// //     const comment = commentTextMap[postId]?.trim();
// //     if (!token || !userId) return alert("Not authenticated");
// //     if (!comment) return alert("Comment cannot be empty");

// //     try {
// //       const res = await axios.post(
// //         `${API_BASE}/post/comment/${postId}`,
// //         { CommentText: comment, userId },
// //         { headers: { "x-auth-token": token } }
// //       );
// //       setCommentTextMap((prev) => ({ ...prev, [postId]: "" }));
// //       setPosts((prev) =>
// //         prev.map((p) =>
// //           p._id === postId ? { ...p, comments: res.data.comments } : p
// //         )
// //       );
// //     } catch {
// //       alert("Failed to post comment");
// //     }
// //   };

// //   const toggleCommentBox = (postId) => {
// //     setCommentBoxOpen((prev) => ({ ...prev, [postId]: !prev[postId] }));
// //   };

// //   const toggleExpanded = (postId) => {
// //     setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
// //   };

// //   const handleShare = async (post) => {
// //     try {
// //       const shareText = `${post.title}\n${window.location.origin}/post/${post._id}`;
// //       await navigator.clipboard.writeText(shareText);
// //       alert("Copied: Title + URL");
// //     } catch (error) {
// //       console.error("Share failed:", error);
// //     }
// //   };

// //   const renderPost = useCallback(
// //     (post, index) => {
// //       const isExpanded = expandedPosts[post._id];
// //       const isVideo = post.mediaType?.startsWith("video");
// //       const commentText = commentTextMap[post._id] || "";
// //       const commentsVisible = commentBoxOpen[post._id];
// //       const title = post.title || "";
// //       const titleText = isExpanded
// //         ? title
// //         : title.slice(0, 100) + (title.length > 100 ? "..." : "");

// //       return (
// //         <div key={post._id} className="bg-white shadow rounded-lg p-4 mb-6">
// //           {/* Post Header */}
// //           <div className="flex items-center justify-between mb-4">
// //             <div className="flex items-center gap-3">
// //               <Link href={`/profile/${post.userId?.username}`} className="flex items-center gap-3">
// //                 <img
// //                   src={"https://www.fondpeace.com/og-image.jpg"}
// //                   alt="profile"
// //                   className="w-12 h-12 rounded-full object-cover"
// //                 />
// //                 <span className="font-semibold text-gray-900">
// //                   {post.userId?.username || "Unknown"}
// //                 </span>
// //               </Link>
// //             </div>
// //             <button
// //               className="text-gray-600 hover:text-gray-900 text-2xl px-2"
// //               onClick={(e) => {
// //                 e.stopPropagation();
// //                 alert("Show post options menu here (Report, Save, Share etc.)");
// //               }}
// //             >
// //               ⋮
// //             </button>
// //           </div>

// //           {/* Title */}
// //           <p className="text-gray-800 mb-4">
// //             {titleText}
// //             {title.length > 100 && (
// //               <span
// //                 className="text-blue-600 ml-2 cursor-pointer"
// //                 onClick={() => toggleExpanded(post._id)}
// //               >
// //                 {isExpanded ? " See less" : " See more"}
// //               </span>
// //             )}
// //           </p>

// //           {/* Media */}
// //           {post.media && (
// //             <Link href={isVideo ? `/short/${post._id}` : `/post/${post._id}`} prefetch>
// //               <div className="relative w-full max-w-[600px] aspect-square rounded-lg mb-4 overflow-hidden mx-auto shadow-md cursor-pointer">
// //                 {isVideo ? (
// //                   <video
// //                     ref={(ref) => (videoRefs.current[index] = ref)}
// //                     src={post.media}
// //                     autoPlay
// //                     loop
// //                     playsInline
// //                     muted
// //                     preload="none"
// //                     className="w-full h-full object-cover rounded-lg"
// //                   />
// //                 ) : (
// //                   <img
// //                     src={post.media}
// //                     alt={post.title}
// //                     className="w-full h-full object-cover rounded-lg"
// //                   />
// //                 )}
// //                 {isVideo && (
// //                   <button
// //                     className="absolute bottom-3 right-3 bg-black/60 text-white rounded-full p-2"
// //                     onClick={(e) => {
// //                       e.preventDefault();
// //                       e.stopPropagation();
// //                       const video = videoRefs.current[index];
// //                       if (video) video.muted = !video.muted;
// //                     }}
// //                   >
// //                     🔊
// //                   </button>
// //                 )}
// //               </div>
// //             </Link>
// //           )}

// //           {/* Actions */}
// //           <div className="flex items-center justify-between text-gray-700 mb-4 text-sm">
// //             <button onClick={() => handleLikePost(post._id)} className="flex items-center gap-1">
// //               {hasLikedPost(post) ? (
// //                 <FaHeart className="text-red-600 text-lg" />
// //               ) : (
// //                 <FaRegHeart className="text-lg" />
// //               )}
// //               <span>{post.likes?.length || 0}</span>
// //             </button>
// //             <button onClick={() => toggleCommentBox(post._id)} className="flex items-center gap-1">
// //               <FaCommentDots className="text-lg" />
// //               <span>{post.comments?.length || 0}</span>
// //             </button>
// //             <div className="flex items-center gap-1">
// //               <FaEye className="text-lg text-gray-600" />
// //               <span>{post.views || 0}</span>
// //             </div>
// //             <button onClick={() => handleShare(post)} className="flex items-center gap-1 text-blue-600">
// //               <FaShareAlt className="text-lg" />
// //             </button>
// //           </div>

// //           {/* Comment Box */}
// //           {commentsVisible && (
// //             <div className="mt-4">
// //               <input
// //                 type="text"
// //                 placeholder="Write a comment..."
// //                 value={commentText}
// //                 onChange={(e) =>
// //                   setCommentTextMap((prev) => ({ ...prev, [post._id]: e.target.value }))
// //                 }
// //                 className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
// //               />
// //               <button
// //                 onClick={() => handleComment(post._id)}
// //                 className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
// //               >
// //                 Post Comment
// //               </button>

// //               <div className="mt-4 space-y-2">
// //                 {post.comments?.map((cmt, i) => (
// //                   <div key={i} className="bg-gray-100 p-3 rounded-md">
// //                     <p className="font-semibold text-gray-800">{cmt.userId?.username || "User"}</p>
// //                     <p className="text-gray-700">{cmt.CommentText}</p>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       );
// //     },
// //     [commentTextMap, commentBoxOpen, expandedPosts, userId]
// //   );

// //   // Set loading to false after initialPosts are loaded
// //   useEffect(() => {
// //     setLoading(false);
// //   }, [initialPosts]);

// //   if (loading) return <div className="text-center p-6">Loading feed...</div>;

// //   return (
// //     <div className="max-w-2xl mx-auto space-y-8 px-2 sm:px-0">
// //       {posts.map((post, idx) => renderPost(post, idx))}
// //     </div>
// //   );
// // }







