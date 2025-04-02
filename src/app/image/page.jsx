'use client';
// https://www.xvideos.com/video.kcuckpo90b3/curavaceous_australian_cunt_angela_white_gets_her_snatch_split_open


// import axios from "axios";
// import { useState } from "react";

// const ImageScraper = () => {
//     const [url, setUrl] = useState('');
//     const [images, setImages] = useState([]);
//     const [loading, setLoading] = useState(false);

//     // Function to sanitize and fix URL
//     const sanitizeUrl = (imgUrl) => {
//         try {
//             if (!imgUrl) return '/fallback-image.jpg'; // Fallback image if empty

//             // Handle protocol-relative URLs (starts with "//")
//             if (imgUrl.startsWith("//")) {
//                 return `https:${imgUrl}`;
//             }

//             // Handle relative URLs (starts with "/")
//             if (imgUrl.startsWith("/")) {
//                 const baseUrl = new URL(url);
//                 return `${baseUrl.origin}${imgUrl}`; // Convert to absolute URL
//             }

//             // Return the same if it's a proper absolute URL
//             if (imgUrl.startsWith("http") || imgUrl.startsWith("https")) {
//                 return imgUrl;
//             }

//             // Fallback in case of broken URL
//             return '/fallback-image.jpg';
//         } catch (error) {
//             console.error("Error sanitizing URL:", error);
//             return '/fallback-image.jpg';
//         }
//     };

//     // Fetch images from backend
//     const fetchImages = async () => {
//         if (!url.trim()) {
//             alert("Please enter a valid URL.");
//             return;
//         }
//         setLoading(true);
//         setImages([]); // Clear previous images

//         try {
//             const response = await axios.get("http://localhost:5000/scrape", {
//                 params: { url },
//             });

//             if (response.data && response.data.images) {
//                 setImages(response.data.images);
//                 console.log("Fetched Images:", response.data.images);
//             } else {
//                 alert("No images found.");
//             }
//         } catch (error) {
//             console.error("Error fetching images:", error);
//             alert("Failed to fetch images. Check console.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Handle input change
//     const handleChange = (e) => {
//         setUrl(e.target.value);
//     };

//     // Handle button click
//     const handleScrape = () => {
//         if (!url.trim()) {
//             alert("Please enter a valid URL.");
//             return;
//         }
//         fetchImages(); // Trigger image fetching
//     };

//     return (
//         <div className="flex flex-col justify-center m-20 pt-20 items-center text-center">
//             <h1 className="text-3xl font-bold mb-6">🖼️ Universal Image Scraper</h1>

//             <input
//                 type="text"
//                 placeholder="Enter website URL"
//                 value={url}
//                 onChange={handleChange}
//                 className="border-2 rounded-md w-full p-4 max-w-xl"
//             />

//             <button
//                 className="border-2 rounded-md bg-blue-500 text-white mt-4 p-4 hover:bg-blue-600"
//                 onClick={handleScrape}
//             >
//                 Scrape Images
//             </button>

//             {loading ? (
//                 <p className="text-gray-500 mt-4">Loading images...</p>
//             ) : (
//                 <div className="grid grid-cols-3 gap-4 mt-6">
//                     {images && images.length > 0 ? (
//                         images.map((img, index) => (
//                             <img
//                                 key={index}
//                                 src={sanitizeUrl(img)}
//                                 alt={`Image ${index}`}
//                                 className="w-60 h-40 object-cover rounded-md border-2 border-gray-300"
//                                 onError={(e) => (e.target.src = "/fallback-image.jpg")}
//                                 loading="lazy"
//                             />
//                         ))
//                     ) : (
//                         <p className="text-gray-500">No images found.</p>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ImageScraper;



import { useState } from 'react';

export default function App() {
  const [url, setUrl] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVideos = async () => {
    if (!url) return alert('Please enter a URL');
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/videos?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.success) {
        setVideos(data.videos);
      } else {
        alert('Failed to fetch videos');
      }
    } catch (error) {
      alert('Error fetching videos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">🎬 Video Scraper</h1>
      <input
        type="text"
        placeholder="Enter website URL"
        className="border p-2 w-full mb-4 rounded-md"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        onClick={fetchVideos}
        disabled={loading}
      >
        {loading ? 'Scraping...' : 'Scrape Videos'}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {videos.map((video, idx) => (
          <video key={idx} controls className="rounded-md shadow-md w-80">
            <source src={video.src} type="video/mp4" />
          </video>
        ))}
      </div>
    </div>
  );
}
