'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

const API_URL = 'https://backendk-z915.onrender.com/post/shorts';

const ReelsFeed = () => {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef(null);
  const videoRefs = useRef([]);

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?page=${page}&limit=5`);
      const data = await res.json();

      setVideos(prev => {
        const existingIds = new Set(prev.map(v => v._id));
        const newVideos = data.videos.filter(v => !existingIds.has(v._id));
        return [...prev, ...newVideos];
      });

      setHasMore(page < data.totalPages);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, [page]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const lastVideoRef = useCallback(
    node => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  useEffect(() => {
    const videoObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target;

          if (entry.isIntersecting) {
            if (video && typeof video.play === 'function') {
              video.play().catch(err => {
                console.warn('Video play error:', err.message);
              });
            }

            const id = video.dataset.id;
            if (id) {
              window.history.replaceState(null, '', `/short/${id}`);
            }
          } else {
            if (video && typeof video.pause === 'function') {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach(video => {
      if (video) videoObserver.observe(video);
    });

    return () => {
      videoRefs.current.forEach(video => {
        if (video) videoObserver.unobserve(video);
      });
    };
  }, [videos]);

  return (
    <div
      className="reels-feed"
      style={{
        height: '100vh',
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
      }}
    >
      {videos.map((video, index) => (
        <div
          key={video._id}
          ref={index === videos.length - 1 ? lastVideoRef : null}
          style={{
            height: '100vh',
            scrollSnapAlign: 'start',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <video
            ref={el => (videoRefs.current[index] = el)}
            src={video.media}
            data-id={video._id}
            
            loop
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ))}
    </div>
  );
};

export default ReelsFeed;









// 'use client';
// import axios from 'axios';
// import React, { useEffect, useState, useRef } from 'react';
// import { useRouter } from 'next/navigation';

// const Shorts = () => {
//   const [posts, setPosts] = useState([]); // Videos list
//   const [loading, setLoading] = useState(false); // Loading state
//   const [page, setPage] = useState(1); // Pagination state
//   const observer = useRef(null); // For infinite scroll
//   const router = useRouter(); // For navigation

//   // Fetch videos from API
//   const fetchMedia = async () => {
//     if (loading) return; // Prevent multiple requests
//     setLoading(true);
//     try {
//       const response = await axios.get(`http://localhost:4000/post/shorts?page=${page}`);
//       const newPosts = response.data;
      
//       // Append new videos to existing ones
//       setPosts(prev => [...prev, ...newPosts]);
//       setPage(prev => prev + 1); // Increment page for next API request
//     } catch (error) {
//       console.error("Error fetching videos:", error);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchMedia(); // Fetch videos when the component mounts
//   }, []);

//   // Infinite scroll implementation using IntersectionObserver
//   useEffect(() => {
//     const options = {
//       root: null,
//       rootMargin: '0px',
//       threshold: 1.0, // Trigger when video is fully visible
//     };

//     if (observer.current) observer.current.disconnect(); // Disconnect previous observer
//     observer.current = new IntersectionObserver(entries => {
//       if (entries[0].isIntersecting) {
//         fetchMedia(); // Fetch more videos when user scrolls to bottom
//       }
//     }, options);

//     // Observing last video element
//     if (posts.length > 0) {
//       const lastVideo = document.querySelector("#last-video");
//       if (lastVideo) observer.current.observe(lastVideo);
//     }

//     return () => {
//       if (observer.current) observer.current.disconnect();
//     };
//   }, [posts]);

//   // Handle video play and navigation
//   const handleVideoPlay = (videoId) => {
//     router.push(`/short/${videoId}`);
//   };

//   return (
//     <div className="flex flex-col items-center">
//       {/* Render videos */}
//       {posts.map((post, index) => (
//         <div
//         key={`${post._id}-${index}`}  // Unique key for each video
//           id={index === posts.length - 1 ? 'last-video' : undefined} // Set id for last video to trigger infinite scroll
//           className="w-full flex justify-center mb-10"
//         >
//           <video
//             src={post.media} // Video source
//             autoPlay={index === 0} // Auto-play for first video
//             loop
//             muted
//             controls
//             onPlay={() => handleVideoPlay(post._id)}
//             className="w-full md:w-96 h-screen rounded-md shadow-lg"
//           />
//         </div>
//       ))}

//       {/* Loading indicator */}
//       {loading && <p className="text-center text-gray-600">Loading more videos...</p>}
//     </div>
//   );
// };

// export default Shorts;













// 'use client';
// import axios from 'axios';
// import React, { useEffect, useState, useRef } from 'react';

// const Shorts = () => {
//   const [posts, setPosts] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const containerRef = useRef(null);

//   // Fetching media (videos)
//   const fetchMedia = async () => {
//     if (loading) return;
//     setLoading(true);
//     try {
//       const res = await axios.get(`http://localhost:4000/post/shorts?page=${page}`);
//       if (res.data.length > 0) {
//         setPosts((prev) => [...prev, ...res.data]);
//         setPage((prev) => prev + 1);
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchMedia();  // Fetch videos when component mounts
//   }, []);

//   // Handle next/prev navigation
//   const handleNext = () => {
//     if (currentIndex < posts.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//     }
//   };

//   const handlePrev = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//     }
//   };

//   return (
//     <div ref={containerRef} className="relative h-screen overflow-hidden">
//       {/* Previous and Next Button */}
//       <button
//         onClick={handlePrev}
//         className="absolute top-1/2 left-0 transform -translate-y-1/2 text-white text-3xl z-10"
//         disabled={currentIndex === 0}
//       >
//         {'<'}
//       </button>

//       <button
//         onClick={handleNext}
//         className="absolute top-1/2 right-0 transform -translate-y-1/2 text-white text-3xl z-10"
//         disabled={currentIndex === posts.length - 1}
//       >
//         {'>'}
//       </button>

//       {/* Video Display */}
//       {posts.length > 0 && (
//         <div className="w-full h-full flex justify-center items-center">
//           <video
//             src={posts[currentIndex].media}
//             controls
//             autoPlay
//             loop
//             muted
//             className="w-auto h-full object-contain"
//           />
//         </div>
//       )}

//       {/* Loading Indicator */}
//       {loading && <p className="text-white text-center">Loading...</p>}
//     </div>
//   );
// };

// export default Shorts;








// 'use client';
// import axios from 'axios';
// import React, { useEffect, useState, useRef } from 'react';
// import { useRouter } from 'next/navigation';

// const Shorts = () => {
//   const [posts, setPosts] = useState([]);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [currentVideo, setCurrentVideo] = useState(null);
//   const lastPostRef = useRef(null);
//   const videoRefs = useRef({});
//   const router = useRouter();

//   const fetchMedia = async () => {
//     if (loading) return;
//     setLoading(true);

//     try {
//       const response = await axios.get(`http://localhost:4000/post/shorts?page=${page}`);
//       setPosts(prevPosts => [...prevPosts, ...response.data]);
//       setPage(prevPage => prevPage + 1);
//     } catch (error) {
//       console.error(error);
//     }

//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchMedia();
//   }, []);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       entries => {
//         if (entries[0].isIntersecting) {
//           fetchMedia();
//         }
//       },
//       { threshold: 1.0 }
//     );

//     if (lastPostRef.current) {
//       observer.observe(lastPostRef.current);
//     }

//     return () => observer.disconnect();
//   }, [posts]);

//   const handleVideoPlay = (videoId, index) => {
//     if (currentVideo !== videoId) {
//       setCurrentVideo(videoId);
//       router.push(`/short/${videoId}`); // Navigates to dynamic video page
//     }
//   };

//   return (
//     <div className="flex flex-col items-center">
//       {posts.length > 0 ? (
//         posts.map((post, index) => (
//           <div key={index} ref={index === posts.length - 1 ? lastPostRef : null} className="mb-">
//             {post.media.endsWith('.mp4') && (
//               <video
//                 ref={(el) => (videoRefs.current[index] = el)}
//                 src={post.media}
//                 autoPlay={index === 0}
//                 loop={false}
//                 muted
//                 controls
//                 className="md:w-80 md:h-68 w-full h-screen border-2 rounded-md"
//                 onPlay={() => handleVideoPlay(post._id, index)}
//                 onEnded={() => {
//                   const nextVideo = videoRefs.current[index + 1];
//                   if (nextVideo) {
//                     nextVideo.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                     setTimeout(() => nextVideo.play(), 500);
//                   }
//                 }}
//               />
//             )}
//           </div>
//         ))
//       ) : (
//         <p className="text-lg font-bold">No posts yet.</p>
//       )}
//       {loading && <p className="text-center">Loading...</p>}
//     </div>
//   );
// };

// export default Shorts;






