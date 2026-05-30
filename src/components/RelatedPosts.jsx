"use client";

import { useEffect, useRef } from "react";
import { FaHeart, FaCommentDots, FaEye } from "react-icons/fa";

function toAbsolute(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
}

function likesCount(post) {
  return post?.likes?.length || 0;
}

function commentsCount(post) {
  return post?.comments?.length || 0;
}

function viewsCount(post) {
  return post?.views || 0;
}

function AutoPlayVideo({ video, thumb }) {
  const videoRef = useRef(null);

  useEffect(() => {
    window.scrollTo({
      top: window.innerHeight / 1.2,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const currentVideo = videoRef.current;
    if (!currentVideo) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentVideo.play().catch(() => {});
        } else {
          currentVideo.pause();
          currentVideo.currentTime = 0;
        }
      },
      {
        threshold: 0.7,
      }
    );

    observer.observe(currentVideo);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={video}
      poster={thumb}
      muted
      loop
      autoPlay
      controls
      playsInline
      preload="metadata"
      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
    />
  );
}

export default function RelatedPosts({ related }) {
  // console.log("RELATED POSTS:", related); // Kept your debug log

  if (!Array.isArray(related) || related.length === 0) return null;

  return (
    <aside className="max-w-5xl mx-auto mt-6 sm:mt-10 px-4 pb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Explore More
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
        {related.map((r) => {
          // Detect all possible media fields
          const media = toAbsolute(
            r.video || r.videoUrl || r.media || r.image || r.file || ""
          );

          const thumb = toAbsolute(
            r.thumbnail || r.thumb || r.image || ""
          );

          // Detect media type
          const isVideo = media?.match(/\.(mp4|webm|ogg|mov)$/i);
          const isImage = media?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

          return (
            <a
              key={r._id}
              href={`/shorts/${r._id}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Media Container with 4:5 Aspect Ratio (Great for Mobile/Shorts) */}
              <div className="w-full aspect-[4/5] sm:h-72 bg-gray-100 overflow-hidden relative">
                {/* VIDEO */}
                {isVideo ? (
                  <AutoPlayVideo video={media} thumb={thumb} />
                ) : isImage ? (
                  /* IMAGE */
                  <img
                    src={media}
                    alt={r.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  /* FALLBACK */
                  <img
                    src={thumb}
                    alt={r.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}
                
                {/* Optional Play Icon Overlay for Videos */}
                {isVideo && (
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm p-1.5 rounded-full">
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-4 flex flex-col flex-grow justify-between bg-white">
                <p className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight mb-3 group-hover:text-blue-600 transition-colors">
                  {r.title}
                </p>

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 text-gray-500 text-xs font-medium border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-1.5">
                    <FaHeart className="text-red-500 text-sm" />
                    <span>{likesCount(r)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <FaCommentDots className="text-blue-500 text-sm" />
                    <span>{commentsCount(r)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <FaEye className="text-gray-400 text-sm" />
                    <span>{viewsCount(r)}</span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </aside>
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
//   window.scrollTo({
//     top: window.innerHeight / 1.2,
//     behavior: "smooth",
//   });
// }, []);

  
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
//       className="w-full h-full object-cover object-center"
//     />
//   );
// }

// export default function RelatedPosts({ related }) {
//   console.log("RELATED POSTS:", related);

//   if (!Array.isArray(related) || related.length === 0) return null;

//   return (
//     <aside className="max-w-5xl mx-auto mt-10 px-4">
//       <p className="text-xl font-semibold mb-4 text-gray-900">
//         Related Posts
//       </p>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
//         {related.map((r) => {

//           // 🔥 detect all possible media fields
//           const media = toAbsolute(
//             r.video ||
//             r.videoUrl ||
//             r.media ||
//             r.image ||
//             r.file ||
//             ""
//           );

//           const thumb = toAbsolute(
//             r.thumbnail ||
//             r.thumb ||
//             r.image ||
//             ""
//           );

//           // 🔥 detect media type
//           const isVideo =
//             media?.match(/\.(mp4|webm|ogg|mov)$/i);

//           const isImage =
//             media?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

//           return (
//             <a
//               key={r._id}
//               href={`/shorts/${r._id}`}
//               className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border"
//             >
//               <div className="w-full h-80 bg-gray-200 overflow-hidden relative">

//                 {/* VIDEO */}
//                 {isVideo ? (
//                   <AutoPlayVideo
//                     video={media}
//                     thumb={thumb}
//                   />
//                 ) : isImage ? (

//                   /* IMAGE */
//                   <img
//                     src={media}
//                     alt={r.title}
//                     className="w-full h-full object-cover object-center"
//                     loading="lazy"
//                   />

//                 ) : (

//                   /* FALLBACK */
//                   <img
//                     src={thumb}
//                     alt={r.title}
//                     className="w-full h-full object-cover object-center"
//                     loading="lazy"
//                   />

//                 )}
//               </div>

//               <div className="p-3">
//                 <p className="font-medium text-gray-900 line-clamp-2 text-sm">
//                   {r.title}
//                 </p>

//                 <div className="flex items-center gap-3 text-gray-500 text-xs mt-2">
//                   <FaHeart className="text-red-500" />
//                   {likesCount(r)}

//                   <span>•</span>

//                   <FaCommentDots />
//                   {commentsCount(r)}

//                   <span>•</span>

//                   <FaEye />
//                   {viewsCount(r)}
//                 </div>
//               </div>
//             </a>
//           );
//         })}
//       </div>
//     </aside>
//   );
// }
