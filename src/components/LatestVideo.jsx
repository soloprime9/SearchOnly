'use client';
 
import Link from 'next/link';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import StatusBar from '@/components/StatusBar'
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';



const API_URL = 'https://backend-k.vercel.app/post/shorts';
const Second_API_URL = "https://backend-k.vercel.app/post";

const ReelsFeed = () => {
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef(null);
  const videoRefs = useRef([]);
  const SinglePostsFetched = useRef(false);
  const [singlevid, setSinglevid] = useState([]);
  const {videoId} = useParams();
  const [expandedId, setExpandedId] = useState(null);
 




  useEffect(() => {


    if(SinglePostsFetched.current) return;
    SinglePostsFetched.current = true;

    const SingleVideo = async () => {

    const pathname = window.location.pathname;
    const id = pathname.split("/").pop();
    console.log("This is Id: ", id);

    try{
    const response = await fetch(`${Second_API_URL}/single/${id}`);
    const Data = await response.json();
    // console.log("Single Post" , Data);
    setSinglevid(Data);

    }
    catch(error){
      console.log(error);
    }
  };
    SingleVideo();
  }, [])

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?page=${page}&limit=5`);
      const data = await res.json();
      // console.log(data);

      setVideos(prev => {
        const existingIds = new Set(prev.map(v => v._id));
        const newVideos = data.videos.filter(v => !existingIds.has(v._id));
        return [...prev, ...newVideos];
      });

      setHasMore(page < data.totalPages);
    } catch (err) {
      // console.log('Fetch error:', err);
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
  }, [videos, singlevid]);

 const handleShare = (item) => {
    const shareText = `${item.title}\n\n${window.location.origin}/short/${item._id}`;
  
    navigator.clipboard.writeText(shareText).then(() => {
      toast.success('Video link copied!', {
        duration: 2000,
      });
     alert("Copied");
    }).catch(() => {
      toast.error('Failed to copy');
     alert("!!! Not Copied");
    });
  };

 return (
  <div className="overflow-y-auto snap-y snap-mandatory bg-white mt-2">

    {/* Main Container */}
    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_300px] md:mb-2">
    
      {/* Left Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col sticky top-0 h-screen overflow-y-auto border border-gray-300 rounded-md p-4 text-lg font-semibold space-y-4">
        <h4>Worlds</h4>
        <h4>Search</h4>
        <h4>Account</h4>
        <h4>Setting</h4>
        <h4>Privacy</h4>
      </aside>

      {/* Main Video Feed */}
      <main className="grid">
      <div className="w-full h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
        {/* Main Single Video */}
        {singlevid && (
          <div className="snap-start w-full h-screen flex justify-center items-center md:mb-1">
            <div className="relative w-full h-full aspect-video flex justify-center items-center bg-black">
              <video
                ref={(el) => (videoRefs.current[videos.length] = el)}
                src={singlevid.media}
                loop
                playsInline
                
                controls={false}
                autoPlay
                
                className="object-contain w-full h-full bg-black"
                data-id={singlevid._id}
              ></video>
              <div className="absolute  md:bottom-[20vh] left-4 z-10 text-white max-w-[80%]">
                  <p className="font-semibold text-lg mb-1">
                    <a href={`/profile/${singlevid.userId?.username}`}>@{singlevid.userId?.username}</a>
                  </p>
                  <p
                    className={`text-sm leading-tight cursor-pointer ${expandedId === singlevid._id ? '' : 'line-clamp-1'}`}
                    onClick={() => setExpandedId(expandedId === singlevid._id ? null : singlevid._id)}
                  >
                    {singlevid.title}
                  </p>

                </div>

                <div className="absolute  md:bottom-[20vh] right-4 flex flex-col items-center gap-4 z-10 text-white">
                  <div className="flex flex-col items-center">
                    {/* Replace this with your actual like icon */}

                   <div
                         className="flex flex-col items-center cursor-pointer"
                         onClick={() => handleShare(singlevid)}
                       >
                         {/* Share icon */}
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v1a9 9 0 009 9h3M20 12v-1a9 9 0 00-9-9H8" />
                           <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" />
                         </svg>
                         <span className="text-xs">Share</span>
                       </div>

                   
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                              2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 
                              4.5 2.09C13.09 3.81 14.76 3 16.5 3 
                              19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                              6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="text-xs">{singlevid.likes?.length || 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    {/* Replace this with your actual comment icon */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                    </svg>
                    <span className="text-xs">{singlevid.comments?.length || 0}</span>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* Other videos */}
        {videos.map((video, index) => (
          <div
            key={video._id}
            ref={index === videos.length - 1 ? lastVideoRef : null}
            className="snap-start w-full h-screen flex justify-center items-center mb-1"
          >
            <div className="relative w-full h-full aspect-video max-h-screen flex justify-center items-center bg-black ">
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={video.media}
                data-id={video._id}
                loop
                
                playsInline
                controls={false}
                autoPlay
                className="object-contain w-full h-full bg-black"
              />
              <div className="absolute md:bottom-[20vh] left-4 z-10 text-white max-w-[80%]">
                  <p className="font-semibold text-lg mb-1">
                   <a href={`/profile/${video.userId?.username}`}>@{video.userId?.username}</a>
                 </p>
                 <p
                   className={`text-sm leading-tight cursor-pointer ${
                     expandedId === video._id ? '' : 'line-clamp-1'
                   }`}
                   onClick={() => setExpandedId(expandedId === video._id ? null : video._id)}
                 >
                   {video.title}
                 </p>

                </div>

                <div className="absolute  md:bottom-[20vh] right-4 flex flex-col items-center gap-4 z-10 text-white">
                  <div className="flex flex-col items-center">
                   
                    {/* Replace this with your actual like icon */}

                   <div className="flex flex-col items-center cursor-pointer" onClick={() => handleShare(video)}
                     >
                       {/* Share icon */}
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v1a9 9 0 009 9h3M20 12v-1a9 9 0 00-9-9H8" />
                         <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" />
                       </svg>
                       <span className="text-xs">Share</span>
                     </div>

                   
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                              2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 
                              4.5 2.09C13.09 3.81 14.76 3 16.5 3 
                              19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                              6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="text-xs">{video.likes?.length || 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    {/* Replace this with your actual comment icon */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                    </svg>
                    <span className="text-xs">{video.comments?.length || 0}</span>
                  </div>
                </div>

            </div>
          </div>
        ))}
      </div>
    </main>

      {/* Right Sidebar (hidden on mobile) */}
      <aside className="hidden md:block sticky top-0 h-screen overflow-y-auto border border-gray-300 rounded-md p-4 mx-2 space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg"
                alt="profile"
                className="w-10 h-10 rounded-full border"
              />
              <span className="truncate font-medium text-sm">Human Cant</span>
            </div>
            <button className="px-3 py-1 text-sm font-semibold border rounded-xl">
              Follow
            </button>
          </div>
        ))}
      </aside>
    </div>

    

        <StatusBar />


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





