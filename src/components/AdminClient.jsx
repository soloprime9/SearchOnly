"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import jwt from "jsonwebtoken";

const BACKEND = "https://backendk-z915.onrender.com/analytics";
const SOCKET_BACKEND = "https://backendk-z915.onrender.com";

export default function AdminClient({ initialPosts }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts || []);
  const [activeTab, setActiveTab] = useState("latest"); // First Tab
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [activeUsers30m, setActiveUsers30m] = useState(0);

  // Auth Check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    try {
      const decoded = jwt.decode(token);
      if (!decoded || decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return router.push("/login");
      }
      setAuthorized(true);
    } catch (err) {
      router.push("/login");
    }
  }, [router]);

  // Data Fetcher
  const refreshData = useCallback(async (tabName = activeTab) => {
    setLoading(true);
    try {
      let url = `${BACKEND}/mango/getall`; // Default
      if (tabName === "trending") url = `${BACKEND}/admin/all-traffic`;
      if (tabName === "live") url = `${BACKEND}/admin/live-traffic?time=30m`;

      const res = await fetch(url);
      const data = await res.json();
      
      // Data normalizer for aggregate vs normal find
      const cleanData = Array.isArray(data) ? data : (data.traffic || []);
      setPosts(cleanData);

      // Fetch 30m global count for the header
      const statRes = await fetch(`${BACKEND}/admin/live-traffic?time=30m`);
      const statData = await statRes.json();
      const total = (statData.traffic || []).reduce((acc, curr) => acc + (curr.views || 0), 0);
      setActiveUsers30m(total);

    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Socket setup
  useEffect(() => {
    if (!authorized) return;
    const socket = io(SOCKET_BACKEND, { transports: ["websocket"], secure: true });
    socket.on("newViewGlobal", () => refreshData());
    return () => socket.disconnect();
  }, [authorized, refreshData]);

  // Tab switcher effect
  useEffect(() => {
    if (authorized) refreshData(activeTab);
  }, [activeTab, authorized, refreshData]);

  const getPostId = (p) => p._id?._id || p._id || p.postId;

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* MODERN HEADER */}
      <div className="bg-white border-b sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="p-2 bg-blue-600 rounded-lg text-white text-xs">TWU</span>
            Realtime Analytics
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400">30m Active Users</p>
            <p className="text-xl font-black text-blue-600">{activeUsers30m}</p>
          </div>
          <div className="h-8 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-xs font-bold text-green-700 uppercase">Live</span>
          </div>
        </div>
      </div>

      <main className="p-6 max-w-[1600px] mx-auto">
        {/* TABS SELECTOR */}
        <div className="flex bg-slate-200/50 p-1 rounded-xl w-fit mb-8">
          {[
            { id: "latest", label: "Latest Updates", color: "blue" },
            { id: "trending", label: "Trending (7D)", color: "red" },
            { id: "live", label: "Live Traffic (30m)", color: "green" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DATA DISPLAY */}
        <div className="space-y-3">
          {loading ? (
             <div className="flex flex-col items-center py-20 opacity-50">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold">Syncing data...</p>
             </div>
          ) : (
            posts.map((post, i) => {
              const data = post._id?.title ? post._id : post;
              const views = post.views || data.views || 0;
              
              return (
                <div 
                  key={i} 
                  className="group relative bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-400 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-slate-300 font-mono text-xs w-4">{(i + 1).toString().padStart(2, '0')}</span>
                    <div className="flex flex-col">
                      <h2 className="font-bold text-slate-800 cursor-pointer group-hover:text-blue-600 transition-colors">
                        {data.title}
                      </h2>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase tracking-wider">
                          {data.mediaType || 'Post'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ID: {getPostId(post).slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MINI GRAPH REPLACEMENT - VIEW NUMBERS */}
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Traffic</p>
                       <p className="text-lg font-black text-slate-700">{views}</p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setSelectedPost(data);
                        fetch(`${BACKEND}/admin/post/${getPostId(post)}/details`)
                          .then(r => r.json()).then(setPostDetails);
                      }}
                      className="bg-slate-900 text-white text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      ANALYTICS
                    </button>
                  </div>

                  {/* THE HOVER CARD (Preview) */}
                  <div className="absolute left-10 -top-40 scale-0 group-hover:scale-100 transition-all duration-200 origin-bottom pointer-events-none z-50">
                    <div className="bg-white shadow-2xl rounded-2xl border p-2 w-64 overflow-hidden">
                       <img src={data.thumbnail} className="w-full h-32 object-cover rounded-xl mb-2" alt="" />
                       <p className="text-xs font-bold p-2 leading-tight">{data.title}</p>
                       <div className="bg-blue-50 p-2 rounded-lg flex justify-between">
                          <span className="text-[10px] font-bold text-blue-700">Live Status</span>
                          <span className="text-[10px] font-black text-blue-800 tracking-tighter">OK</span>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* MODAL - PRECISE ANALYTICS */}
      {selectedPost && postDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-black text-slate-800">{selectedPost.title}</h2>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">Real-time Geographical & Temporal Data</p>
              </div>
              <button onClick={() => {setSelectedPost(null); setPostDetails(null)}} className="w-10 h-10 bg-white border rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all text-xl">✕</button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <div className="grid grid-cols-5 gap-4 mb-10">
                {Object.entries(postDetails.traffic).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{key}</p>
                    <p className="text-2xl font-black text-slate-800">{val}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-black uppercase text-blue-600 mb-4 tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span> Top Regions
                  </h3>
                  <div className="space-y-2">
                    {postDetails.locations.map((loc, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-700">{loc._id.country || 'Global'} <span className="text-slate-400 font-medium">({loc._id.city || 'Unknown'})</span></span>
                        <span className="bg-white border px-3 py-1 rounded-lg font-black text-xs text-blue-600">{loc.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                       <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <h4 className="text-lg font-bold">Post Performance</h4>
                    <p className="text-sm text-slate-400 mt-2">This post is currently attracting {postDetails.traffic['1m']} users per minute.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {io} from "socket.io-client";
// import jwt from "jsonwebtoken";

// const BACKEND = "https://backendk-z915.onrender.com/analytics";
// const Socket_Backend = "https://backendk-z915.onrender.com";

// export default function AdminClient({ initialPosts }) {
//   const router = useRouter();
//   const [posts, setPosts] = useState(initialPosts || []);
//   const [activeTab, setActiveTab] = useState("latest");
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [postDetails, setPostDetails] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [authorized, setAuthorized] = useState(false);

// /* ================= TOCKEN CHECKUP ================= */

//   useEffect(() => {
//   console.log("🔍 Checking token...");

//   const token = localStorage.getItem("token");
//   console.log("Token from localStorage:", token);

//   if (!token) {
//     console.log("❌ No token found. Redirecting...");
//     router.push("/login");
//     return;
//   }

//   try {
//     const decoded = jwt.decode(token);
//     console.log("Decoded token:", decoded);

//     if (!decoded) {
//       console.log("❌ Token decode failed");
//       localStorage.removeItem("token");
//       router.push("/login");
//       return;
//     }

//     if (!decoded.exp) {
//       console.log("❌ No expiration in token");
//       localStorage.removeItem("token");
//       router.push("/login");
//       return;
//     }

//     console.log("Token expiry:", decoded.exp * 1000);
//     console.log("Current time:", Date.now());

//     if (decoded.exp * 1000 < Date.now()) {
//       console.log("❌ Token expired");
//       localStorage.removeItem("token");
//       router.push("/login");
//       return;
//     }

//     console.log("✅ Token valid");
//     setAuthorized(true);

//   } catch (err) {
//     console.log("❌ Token invalid:", err);
//     localStorage.removeItem("token");
//     router.push("/login");
//   }
// }, []);
  
//   /* ================= SOCKET ================= */

//  useEffect(() => {
//   const socket = io(Socket_Backend, {
//     transports: ["websocket"], // ✅ Force websocket only
//     withCredentials: true,
//     secure: true,
//   });

//   socket.on("connect", () => {
//     console.log("✅ Socket connected:", socket.id);
//   });

//   socket.on("connect_error", (err) => {
//     console.error("❌ Socket connection error:", err.message);
//   });

//   socket.on("newViewGlobal", () => {
//     refreshData();
//   });

//   return () => {
//     socket.disconnect();
//   };
// }, []);

//   /* ================= TAB CHANGE ================= */

//   useEffect(() => {
//     if (activeTab !== "latest") {
//       refreshData();
//     }
//   }, [activeTab]);

//   /* ================= FETCH POSTS ================= */

//   const refreshData = async () => {
//     try {
//       setLoading(true);

//       const url =
//         activeTab === "trending"
//           ? `${BACKEND}/admin/all-traffic`
//           : `${BACKEND}/mango/getall`;

//       const res = await fetch(url);
//       const data = await res.json();

//       setPosts(data);
//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       setLoading(false);
//     }
//   };

//   /* ================= FETCH DETAILS ================= */

//   const fetchPostDetails = async (id) => {
//     try {
//       const res = await fetch(`${BACKEND}/admin/post/${id}/details`);
//       const data = await res.json();
//       setPostDetails(data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   /* ================= OPEN MODAL ================= */

//   const openDetails = (post) => {
//     const realPost = post._id?.title ? post._id : post;
//     setSelectedPost(realPost);
//     fetchPostDetails(realPost._id);
//   };

//   /* ================= SHARE ================= */

//   const handleShare = async (post) => {
//     const text = `${post.title}\n${window.location.origin}/post/${post._id}`;
//     await navigator.clipboard.writeText(text);
//     alert("Copied!");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">

//       {/* HEADER */}
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">
//         📊 Admin Analytics Dashboard
//       </h1>

//       {/* TABS */}
//       <div className="flex gap-4 mb-6 flex-wrap">
//         <button
//           onClick={() => setActiveTab("latest")}
//           className={`px-5 py-2 rounded-lg transition ${
//             activeTab === "latest"
//               ? "bg-blue-600 text-white shadow-lg"
//               : "bg-white border"
//           }`}
//         >
//           Latest Posts
//         </button>

//         <button
//           onClick={() => setActiveTab("trending")}
//           className={`px-5 py-2 rounded-lg transition ${
//             activeTab === "trending"
//               ? "bg-red-600 text-white shadow-lg"
//               : "bg-white border"
//           }`}
//         >
//           🔥 Trending (7D)
//         </button>
//       </div>

//       {loading && <p className="text-gray-500">Loading...</p>}

//       {/* POSTS GRID */}
//       <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {!loading &&
//           posts.map((post, i) => {
//             const data = post._id?.title ? post._id : post;

//             return (
//               <div
//                 key={i}
//                 className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
//               >
//                 <img
//                   src={data.thumbnail}
//                   className="w-full h-44 object-cover"
//                   alt=""
//                 />

//                 <div className="p-4">
//                   <h2 className="font-semibold text-lg line-clamp-1">
//                     {data.title}
//                   </h2>

//                   <p className="text-gray-500 text-sm mt-1">
//                     Total Views: {data.views}
//                   </p>

//                   {activeTab === "trending" && (
//                     <p className="text-red-600 text-sm font-medium mt-1">
//                       🔥 {post.views7d} views (7 days)
//                     </p>
//                   )}

//                   <div className="flex justify-between mt-4">
//                     <button
//                       onClick={() => openDetails(post)}
//                       className="text-blue-600 text-sm"
//                     >
//                       Analytics
//                     </button>

//                     <button
//                       onClick={() => handleShare(data)}
//                       className="text-green-600 text-sm"
//                     >
//                       Share
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//       </div>

//       {/* MODAL */}
//       {selectedPost && postDetails && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
//           <div className="bg-white w-full max-w-3xl rounded-2xl p-6 overflow-y-auto max-h-[90vh]">

//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold">
//                 {selectedPost.title} Analytics
//               </h2>

//               <button
//                 onClick={() => {
//                   setSelectedPost(null);
//                   setPostDetails(null);
//                 }}
//                 className="text-red-500"
//               >
//                 Close
//               </button>
//             </div>

//             {/* TRAFFIC */}
//             <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
//               {Object.entries(postDetails.traffic).map(([key, value]) => (
//                 <div
//                   key={key}
//                   className="bg-gray-100 rounded-lg p-3 text-center"
//                 >
//                   <p className="text-sm text-gray-500">{key}</p>
//                   <p className="font-bold text-lg">{value}</p>
//                 </div>
//               ))}
//             </div>

//             {/* COUNTRIES */}
//             <div>
//               <h3 className="font-semibold mb-2">🌍 Top Countries</h3>

//               <div className="space-y-2 max-h-40 overflow-y-auto">
//                 {postDetails.locations.map((loc, i) => (
//                   <div
//                     key={i}
//                     className="flex justify-between bg-gray-50 p-2 rounded"
//                   >
//                     <span>{loc._id}</span>
//                     <span className="font-medium">{loc.count}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
