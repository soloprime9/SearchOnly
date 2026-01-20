"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShareAlt,
  FaEye,
} from "react-icons/fa";

export default function SinglePostInteractions({ initialPost }) {
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeReply, setActiveReply] = useState(null);
  const [replyText, setReplyText] = useState({});

  const API_BASE = "https://backend-k.vercel.app";

  /* ================= AUTH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.UserId) setUserId(decoded.UserId);
    }
  }, []);

  /* ================= HELPERS ================= */
  const hasLikedPost = () =>
    userId && post.likes?.some((id) => id.toString() === userId.toString());

  const hasLikedComment = (likes = []) =>
    userId && likes.some((id) => id.toString() === userId.toString());

  const hasLikedReply = (likes = []) =>
    userId && likes.some((id) => id.toString() === userId.toString());

  /* ================= POST LIKE ================= */
  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");

    const res = await axios.post(
      `${API_BASE}/post/like/${post._id}`,
      {},
      { headers: { "x-auth-token": token } }
    );

    setPost((p) => ({ ...p, likes: res.data.likes }));
  };

  /* ================= COMMENT ================= */
  const handleComment = async () => {
    if (!comment.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");

    const res = await axios.post(
      `${API_BASE}/post/comment/${post._id}`,
      { CommentText: comment },
      { headers: { "x-auth-token": token } }
    );

    setPost((p) => ({ ...p, comments: res.data.comments }));
    setComment("");
  };

  /* ================= COMMENT LIKE ================= */
  const handleCommentLike = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.post(
      `${API_BASE}/comment/${post._id}/like/${commentId}`,
      {},
      { headers: { "x-auth-token": token } }
    );

    setPost((p) => ({
      ...p,
      comments: p.comments.map((c) =>
        c._id === commentId
          ? {
              ...c,
              likes: res.data.liked
                ? [...c.likes, userId]
                : c.likes.filter((id) => id !== userId),
            }
          : c
      ),
    }));
  };

  /* ================= REPLY ================= */
  const submitReply = async (commentId) => {
    if (!replyText[commentId]) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.post(
      `${API_BASE}/comment/${post._id}/reply/${commentId}`,
      { replyText: replyText[commentId] },
      { headers: { "x-auth-token": token } }
    );

    setPost((p) => ({
      ...p,
      comments: p.comments.map((c) =>
        c._id === commentId ? { ...c, replies: res.data } : c
      ),
    }));

    setReplyText((r) => ({ ...r, [commentId]: "" }));
    setActiveReply(null);
  };

  /* ================= REPLY LIKE ================= */
  const handleReplyLike = async (commentId, replyId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.post(
      `${API_BASE}/comment/${post._id}/like-reply/${commentId}/${replyId}`,
      {},
      { headers: { "x-auth-token": token } }
    );

    setPost((p) => ({
      ...p,
      comments: p.comments.map((c) =>
        c._id === commentId
          ? {
              ...c,
              replies: c.replies.map((r) =>
                r._id === replyId
                  ? {
                      ...r,
                      likes: res.data.liked
                        ? [...r.likes, userId]
                        : r.likes.filter((id) => id !== userId),
                    }
                  : r
              ),
            }
          : c
      ),
    }));
  };

  /* ================= SHARE ================= */
  const handleShare = async () => {
    const text = `${post.title}\n${window.location.origin}/post/${post._id}`;
    await navigator.clipboard.writeText(text);
    alert("Copied link");
  };

  return (
    <div className="mt-6">
      {/* ACTION BAR */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg">
        <button onClick={handleLike} className="flex gap-1 items-center">
          {hasLikedPost() ? (
            <FaHeart className="text-red-600" />
          ) : (
            <FaRegHeart />
          )}
          {post.likes?.length || 0}
        </button>

        <button
          onClick={() => setShowComments((p) => !p)}
          className="flex gap-1 items-center"
        >
          <FaCommentDots /> {post.comments?.length || 0}
        </button>

        <div className="flex gap-1 items-center">
          <FaEye /> {post.views || 0}
        </div>

        <button onClick={handleShare}>
          <FaShareAlt />
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border px-3 py-2 rounded"
            />
            <button
              onClick={handleComment}
              className="bg-blue-600 text-white px-4 rounded"
            >
              Post
            </button>
          </div>

          {post.comments?.map((cmt) => (
            <div key={cmt._id} className="bg-gray-100 p-3 rounded">
              <p className="font-semibold">{cmt.userId?.username || "User"}</p>
              <p>{cmt.CommentText}</p>

              <button
                onClick={() => handleCommentLike(cmt._id)}
                className="flex items-center gap-1 mt-2 text-sm"
              >
                {hasLikedComment(cmt.likes) ? (
                  <FaHeart className="text-red-600" />
                ) : (
                  <FaRegHeart />
                )}
                {cmt.likes?.length || 0}
              </button>

              <button
                onClick={() => setActiveReply(cmt._id)}
                className="text-sm mt-1"
              >
                Reply
              </button>

              {activeReply === cmt._id && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={replyText[cmt._id] || ""}
                    onChange={(e) =>
                      setReplyText({
                        ...replyText,
                        [cmt._id]: e.target.value,
                      })
                    }
                    placeholder="Write a reply..."
                    className="flex-1 border px-2 py-1 rounded"
                  />
                  <button
                    onClick={() => submitReply(cmt._id)}
                    className="bg-gray-800 text-white px-3 rounded"
                  >
                    Reply
                  </button>
                </div>
              )}

              <div className="ml-6 mt-3 space-y-2">
                {cmt.replies?.map((rep) => (
                  <div key={rep._id} className="bg-white p-2 border rounded">
                    <p className="text-sm font-semibold">
                      {rep.userId?.username || "User"}
                    </p>
                    <p className="text-sm">{rep.replyText}</p>

                    <button
                      onClick={() =>
                        handleReplyLike(cmt._id, rep._id)
                      }
                      className="flex items-center gap-1 text-xs mt-1"
                    >
                      {hasLikedReply(rep.likes) ? (
                        <FaHeart className="text-red-600" />
                      ) : (
                        <FaRegHeart />
                      )}
                      {rep.likes?.length || 0}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}








// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import jwt from "jsonwebtoken";
// import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaEye } from "react-icons/fa";

// export default function SinglePostInteractions({ initialPost }) {
//   const [post, setPost] = useState(initialPost);
//   const [comment, setComment] = useState("");
//   const [showComments, setShowComments] = useState(false);
//   const [userId, setUserId] = useState(null);

//   const API_BASE = "https://backend-k.vercel.app";

//   // GET USER IDA
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       const decoded = jwt.decode(token);
//       if (decoded?.UserId) setUserId(decoded.UserId);
//     }
//   }, []);

//   const hasLiked =
//   Array.isArray(post?.likes) &&
//   userId &&
//   post.likes.some(
//     (id) =>
//       id &&
//       id.toString &&
//       id.toString() === userId.toString()
//   );


//   // LIKE
//   const handleLike = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return alert("Please login");

//       const res = await axios.post(
//         `${API_BASE}/post/like/${post._id}`,
//         {},
//         { headers: { "x-auth-token": token } }
//       );

//       setPost((prev) => ({
//         ...prev,
//         likes: res.data.likes,
//       }));
//     } catch {}
//   };

//   // COMMENT
//   const handleComment = async () => {
//     if (!comment.trim()) return;

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) return alert("Please login");

//       const res = await axios.post(
//         `${API_BASE}/post/comment/${post._id}`,
//         { CommentText: comment, userId },
//         { headers: { "x-auth-token": token } }
//       );

//       setPost((prev) => ({
//         ...prev,
//         comments: res.data.comments,
//       }));

//       setComment("");
//     } catch {}
//   };

//   const handleShare = async (post) => {
//   try {
//     const shareText = `${post.title}\n${window.location.origin}/post/${post._id}`;

//     await navigator.clipboard.writeText(shareText);

//     alert("Copied: Title + URL");
//   } catch (error) {
//     console.error("Share failed:", error);
//   }
// };




//   return (
//     <div className="mt-6">

//       {/* INLINE INTERACTION BAR */}
//       <div className="flex items-center justify-between py-2 px-3 bg-gray-100 rounded-lg">

        

//         {/* LIKE */}
//         <button onClick={handleLike} className="flex items-center gap-1 text-sm text-gray-700">
//           {hasLiked ? (
//             <FaHeart className="text-red-600 text-lg" />
//           ) : (
//             <FaRegHeart className="text-lg" />
//           )}
//           <span>{Array.isArray(post.likes) ? post.likes.length : 0}</span>
//         </button>

//         {/* COMMENT */}
//         <button
//           onClick={() => setShowComments((prev) => !prev)}
//           className="flex items-center gap-1 text-sm text-gray-700"
//         >
//           <FaCommentDots className="text-lg" />
//           <span>{post.comments.length}</span>
//         </button>

//         {/* VIEWS */}
//         <div className="flex items-center gap-1 text-gray-700 text-sm">
//           <FaEye className="text-gray-600" />
//           <span>{post.views || 0}</span>
//         </div>

//         {/* SHARE */}
//         <button onClick={() => handleShare(post)} className="text-gray-700 text-lg">
//   <FaShareAlt />
// </button>

//       </div>

//       {/* COMMENTS SECTION TOGGLE */}
//       {showComments && (
//         <div className="mt-4">

//           {/* Comment Input */}
//           <div className="flex gap-2 mb-3">
//             <input
//               type="text"
//               placeholder="Write a comment..."
//               value={comment}
//               onChange={(e) => setComment(e.target.value)}
//               className="w-full border border-gray-300 px-3 py-2 rounded-md"
//             />
//             <button
//               onClick={handleComment}
//               className="bg-blue-600 text-white px-4 rounded-md"
//             >
//               Post
//             </button>
//           </div>

//           {/* Show Comments */}
//           <div className="space-y-2">
//             {post.comments.map((cmt, i) => (
//               <div key={i} className="bg-gray-100 p-3 rounded-md">
//                 <p className="font-semibold text-gray-800">
//                   {cmt.userId?.username || "User"}
//                 </p>
//                 <p className="text-gray-700">{cmt.CommentText}</p>
//               </div>
//             ))}
//           </div>

//         </div>
//       )}
//     </div>
//   );
// }
