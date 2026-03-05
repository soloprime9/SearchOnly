"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import jwt from "jsonwebtoken";

const BACKEND = "https://backendk-z915.onrender.com/analytics";
const Socket_Backend = "https://backendk-z915.onrender.com";

export default function AdminClient({ initialPosts }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts || []);
  const [activeTab, setActiveTab] = useState("1m");
  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  /* ================= TOKEN CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const decoded = jwt.decode(token);
      if (!decoded?.exp || decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return router.push("/login");
      }
      setAuthorized(true);
    } catch {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, []);

  /* ================= SOCKET.IO ================= */
  useEffect(() => {
    const socket = io(Socket_Backend, {
      transports: ["websocket"],
      withCredentials: true,
      secure: true,
    });

    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("connect_error", (err) => console.error("Socket error:", err.message));

    socket.on("newViewGlobal", () => refreshData());

    return () => socket.disconnect();
  }, [activeTab]);

  /* ================= FETCH POSTS ================= */
  const refreshData = async () => {
    try {
      setLoading(true);
      const url = `${BACKEND}/admin/live-traffic?time=${activeTab}`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data.traffic || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  /* ================= FETCH POST DETAILS ================= */
  const fetchPostDetails = async (id) => {
    try {
      const res = await fetch(`${BACKEND}/admin/post/${id}/details`);
      const data = await res.json();
      setPostDetails(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openDetails = (post) => {
    setSelectedPost(post);
    fetchPostDetails(post._id || post.postId);
  };

  /* ================= SHARE ================= */
  const handleShare = async (post) => {
    const postId = post._id || post.postId;
    const text = `${post.title}\n${window.location.origin}/post/${postId}`;
    await navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  /* ================= TIME TABS ================= */
  const timeTabs = [
    { key: "1m", label: "1 Min" },
    { key: "2m", label: "2 Min" },
    { key: "5m", label: "5 Min" },
    { key: "30m", label: "30 Min" },
    { key: "1h", label: "1 Hour" },
    { key: "24h", label: "24 Hours" },
    { key: "7d", label: "7 Days" },
  ];

  if (!authorized) return null; // prevent rendering before auth

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        📊 Admin Live Traffic Dashboard
      </h1>

      {/* TIME TABS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {timeTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      {/* POSTS GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {!loading &&
          posts.map((post, i) => {
            const postData = post._id || post; // support trending & live format
            return (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition relative overflow-hidden"
                onMouseEnter={() => fetchPostDetails(postData._id || postData.postId)}
              >
                <img
                  src={postData.thumbnail}
                  className="w-full h-44 object-cover"
                  alt={postData.title}
                />
                <div className="p-4">
                  <h2 className="font-semibold text-lg line-clamp-1">{postData.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Views: {postData.views || 0}
                  </p>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => openDetails(postData)}
                      className="text-blue-600 text-sm"
                    >
                      Analytics
                    </button>
                    <button
                      onClick={() => handleShare(postData)}
                      className="text-green-600 text-sm"
                    >
                      Share
                    </button>
                  </div>
                </div>

                {/* Hover Locations */}
                {postDetails &&
                  postDetails.locations?.length > 0 &&
                  selectedPost?._id === postData._id && (
                    <div className="absolute top-0 left-0 bg-white bg-opacity-90 p-2 text-xs max-h-40 overflow-y-auto z-10">
                      {postDetails.locations.map((loc, idx) => (
                        <div key={idx} className="flex justify-between border-b border-gray-200">
                          <span>
                            {loc._id.country}, {loc._id.city} ({loc.count})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            );
          })}
      </div>

      {/* MODAL */}
      {selectedPost && postDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedPost.title} Analytics</h2>
              <button
                onClick={() => {
                  setSelectedPost(null);
                  setPostDetails(null);
                }}
                className="text-red-500"
              >
                Close
              </button>
            </div>

            {/* TRAFFIC */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {Object.entries(postDetails.traffic).map(([key, value]) => (
                <div key={key} className="bg-gray-100 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-500">{key}</p>
                  <p className="font-bold text-lg">{value}</p>
                </div>
              ))}
            </div>

            {/* COUNTRIES + CITIES */}
            <div>
              <h3 className="font-semibold mb-2">🌍 Top Locations</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {postDetails.locations.map((loc, i) => (
                  <div key={i} className="flex justify-between bg-gray-50 p-2 rounded">
                    <span>
                      {loc._id.country}, {loc._id.city}
                    </span>
                    <span className="font-medium">{loc.count}</span>
                  </div>
                ))}
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
