"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "https://backendk-z915.onrender.com";

// ─── Extract thumbnail + metadata from video in browser ────────────
// No server needed. Uses canvas to grab a frame.
function extractVideoMeta(videoFile) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(videoFile);
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Math.min(2, video.duration * 0.1);
    });

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      // 16:9 thumbnail
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const duration = Math.round(video.duration);
      const resolution = `${video.videoWidth}x${video.videoHeight}`;

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          video.remove();
          if (!blob) return reject(new Error("Canvas toBlob failed"));
          resolve({ thumbnailBlob: blob, duration, resolution });
        },
        "image/jpeg",
        0.85
      );
    });

    video.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load video for thumbnail"));
    });

    video.load();
  });
}

// ─── Upload a file directly to R2 using a presigned URL ────────────
async function uploadToR2(signedUrl, file, contentType, onProgress) {
  await axios.put(signedUrl, file, {
    headers: { "Content-Type": contentType },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
}

// ─── Allowed types (match backend exactly) ─────────────────────────
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED_IMAGE_TYPES = [
  "image/png", "image/jpeg", "image/jpg", "image/webp",
  "image/gif", "image/bmp", "image/svg+xml",
];

const CATEGORIES = [
  "Entertainment", "TV Shows", "Reality Shows", "Written Updates",
  "Celebrity News", "Movie News", "Cricket", "Stock Market",
  "Technology", "Job Updates", "Health", "Astrology",
  "Viral News", "Trending News",
];

const STAGE_LABELS = {
  idle: "",
  validating: "Checking file...",
  thumbnail: "Generating thumbnail...",
  signing: "Preparing upload...",
  uploading_thumb: "Uploading thumbnail...",
  uploading_video: "Uploading video...",
  uploading_image: "Uploading image...",
  saving: "Saving post...",
  done: "✅ Post uploaded successfully!",
  error: "",
};

export default function UploadPost() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Entertainment");
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef();

  // ── Auth check on mount ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "/login");
    try {
      // Just check expiry — no library needed, decode the payload
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (!payload.exp || payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } catch {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);

  // ── File selection ───────────────────────────────────────────────
  function processFile(selected) {
    if (!selected) return;
    setErrorMsg("");
    setStage("validating");

    const isVideo = ALLOWED_VIDEO_TYPES.includes(selected.type);
    const isImage = ALLOWED_IMAGE_TYPES.includes(selected.type);

    if (!isVideo && !isImage) {
      setErrorMsg("File type not allowed. Use mp4, webm, jpg, png, webp, gif.");
      setStage("idle");
      return;
    }

    const MAX = isVideo ? 200 * 1024 * 1024 : 20 * 1024 * 1024;
    if (selected.size > MAX) {
      setErrorMsg(isVideo ? "Video max size is 200MB." : "Image max size is 20MB.");
      setStage("idle");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setStage("idle");
  }

  function handleFileChange(e) { processFile(e.target.files[0]); }
  function handleDragOver(e) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave() { setIsDragging(false); }
  function handleDrop(e) { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); }

  // ── Submit ───────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!file) return setErrorMsg("Please select a file.");
    if (!title.trim()) return setErrorMsg("Please enter a title.");

    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "/login");

    const headers = { "x-auth-token": token };
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    try {
      if (isVideo) {
        // ── VIDEO FLOW ──────────────────────────────────────────────

        // 1. Extract thumbnail + duration in browser (FREE, no server)
        setStage("thumbnail");
        setProgress(0);
        let thumbnailBlob, duration, resolution;
        try {
          ({ thumbnailBlob, duration, resolution } = await extractVideoMeta(file));
        } catch {
          // thumbnail failed — we'll upload without it
          thumbnailBlob = null;
          duration = 0;
          resolution = "";
        }

        const thumbnailFile = thumbnailBlob
          ? new File([thumbnailBlob], "thumbnail.jpg", { type: "image/jpeg" })
          : null;

        // 2. Ask backend for presigned URLs (returns in <200ms — no timeout)
        setStage("signing");
        const { data: urls } = await axios.post(
          `${API}/demo/presign`,
          {
            video: {
              filename: file.name,
              contentType: file.type,
              fileSize: file.size,
            },
            thumbnail: {
              contentType: "image/jpeg",
              fileSize: thumbnailFile ? thumbnailFile.size : 1,
            },
          },
          { headers }
        );

        // 3. Upload thumbnail first (tiny — instant)
        if (thumbnailFile) {
          setStage("uploading_thumb");
          await uploadToR2(urls.thumbUpload.url, thumbnailFile, "image/jpeg");
        }

        // 4. Upload video directly to R2 (bypasses Render completely)
        setStage("uploading_video");
        setProgress(0);
        await uploadToR2(urls.videoUpload.url, file, file.type, setProgress);

        // 5. Save metadata to MongoDB (returns in <300ms)
        setStage("saving");
        const extractedTags = (title.match(/#\w+/g) || []).map((t) => t.replace("#", ""));
        await axios.post(
          `${API}/demo/confirm`,
          {
            title,
            category,
            tags: extractedTags.join(","),
            videoKey: urls.videoUpload.key,
            videoUrl: urls.videoUpload.publicUrl,
            thumbnailKey: urls.thumbUpload.key,
            thumbnailUrl: thumbnailFile ? urls.thumbUpload.publicUrl : urls.videoUpload.publicUrl,
            mediaType: file.type,
            fileSize: file.size,
            duration,
            resolution,
          },
          { headers }
        );

      } else {
        // ── IMAGE FLOW ──────────────────────────────────────────────

        // 1. Ask backend for presigned URL
        setStage("signing");
        const { data: urlData } = await axios.post(
          `${API}/demo/presign-image`,
          {
            filename: file.name,
            contentType: file.type,
            fileSize: file.size,
          },
          { headers }
        );

        // 2. Upload image directly to R2
        setStage("uploading_image");
        setProgress(0);
        await uploadToR2(urlData.url, file, file.type, setProgress);

        // 3. Save to MongoDB
        setStage("saving");
        const extractedTags = (title.match(/#\w+/g) || []).map((t) => t.replace("#", ""));
        await axios.post(
          `${API}/demo/confirm`,
          {
            title,
            category,
            tags: extractedTags.join(","),
            imageKey: urlData.key,
            imageUrl: urlData.publicUrl,
            mediaType: file.type,
            fileSize: file.size,
          },
          { headers }
        );
      }

      setStage("done");
      setProgress(0);
      // reset form
      setFile(null);
      setTitle("");
      setPreview(null);
      setCategory("Entertainment");
      if (fileRef.current) fileRef.current.value = "";

    } catch (error) {
      setStage("error");
      setProgress(0);
      if (error.response) {
        setErrorMsg(`Error ${error.response.status}: ${error.response.data?.error || "Upload failed"}`);
      } else if (error.request) {
        setErrorMsg("No response from server. Check your internet connection.");
      } else {
        setErrorMsg(`Upload failed: ${error.message}`);
      }
    }
  }

  const isBusy = !["idle", "done", "error"].includes(stage);
  const isVideo = file && ALLOWED_VIDEO_TYPES.includes(file.type);

  return (
    <div className="mt-20 sm:mt-32 lg:mt-40 px-4">
      <div className="lg:m-20 border-2 bg-blue-700 text-white font-bold rounded-lg py-6 px-4 sm:px-6 shadow-lg">
        <h2 className="text-2xl sm:text-3xl py-2 text-center">Upload a New Post</h2>

        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-2xl mx-auto">

          {/* ── Drop zone ── */}
          <div
            className={`relative border-2 border-dashed rounded-md m-2 h-24 w-full flex flex-col items-center justify-center cursor-pointer transition
              ${isDragging ? "bg-blue-500 border-yellow-400" : "border-white hover:bg-blue-600"}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileRef}
              type="file"
              accept={[...ALLOWED_VIDEO_TYPES, ...ALLOWED_IMAGE_TYPES].join(",")}
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
              disabled={isBusy}
            />
            <p className="text-white text-center text-sm">
              Drag & Drop here or click to upload
            </p>
            <p className="text-white/60 text-xs mt-1">
              Video: mp4, webm (max 200MB) · Image: jpg, png, webp, gif (max 20MB)
            </p>
          </div>

          {/* ── File name ── */}
          {file && (
            <p className="text-xs text-white/70 mt-1 self-start">
              {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </p>
          )}

          {/* ── Preview ── */}
          {preview && (
            <div className="relative flex justify-center mt-4 w-full h-48 sm:h-64">
              {isVideo ? (
                <video
                  className="border-2 rounded-md border-white object-contain w-full h-full"
                  src={preview}
                  controls
                  muted
                  playsInline
                />
              ) : (
                <img
                  className="border-2 rounded-md border-white object-contain w-full h-full"
                  src={preview}
                  alt="Preview"
                />
              )}
            </div>
          )}

          {/* ── Title textarea ── */}
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write your post... Use #hashtags for tags"
            rows={4}
            disabled={isBusy}
            className="w-full text-white p-3 text-lg sm:text-xl mt-4
                       bg-transparent border-2 border-white
                       placeholder-white/80 focus:outline-none
                       focus:ring-2 focus:ring-yellow-400
                       rounded resize-none whitespace-pre-wrap
                       disabled:opacity-50"
          />

          {/* ── Category ── */}
          <div className="w-full mt-4">
            <label className="block text-sm font-semibold mb-2">Select Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isBusy}
                className="w-full px-4 py-3 text-sm bg-blue-700 text-white
                           border border-white/60 rounded-lg focus:outline-none
                           focus:ring-2 focus:ring-yellow-400 appearance-none
                           disabled:opacity-50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs">▼</div>
            </div>
          </div>

          {/* ── Progress bar ── */}
          {(stage === "uploading_video" || stage === "uploading_image") && (
            <div className="w-full mt-4">
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-3 bg-green-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm mt-1 font-normal">
                {progress}% uploaded
              </p>
            </div>
          )}

          {/* ── Stage status ── */}
          {stage !== "idle" && STAGE_LABELS[stage] && (
            <p className="text-sm font-normal mt-3 text-yellow-300">
              {STAGE_LABELS[stage]}
              {(stage === "uploading_video" || stage === "uploading_image") && ` ${progress}%`}
            </p>
          )}

          {/* ── Error message ── */}
          {errorMsg && (
            <p className="text-sm font-normal mt-3 text-red-300 text-center">{errorMsg}</p>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={isBusy || !file}
            className="w-full border-2 border-yellow-400 rounded bg-yellow-600
                       hover:bg-yellow-700 p-3 mt-6 text-lg font-bold
                       transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBusy ? STAGE_LABELS[stage] || "Processing..." : "Upload Post"}
          </button>
        </form>
      </div>
    </div>
  );
}










// "use client"; 
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import jwt from "jsonwebtoken";

// const UploadPost = () => {
//   const [file, setFile] = useState(null);
//   const [title, setTitle] = useState("");
//   const [message, setMessage] = useState("");
//   const [preview, setPreview] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [category, setCategory] = useState("Entertainment");

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       console.error("Token not found! Redirecting to login...");
//       return (window.location.href = "/login");
//     }

//     try {
//       const decoded = jwt.decode(token);
//       console.log("Decoded token:", decoded);

//       if (!decoded || !decoded.exp) {
//         console.error("Token missing expiration! Removing token and redirecting.");
//         localStorage.removeItem("token");
//         window.location.href = "/login";
//       }

//       if (decoded.exp * 1000 < Date.now()) {
//         console.warn("Token expired! Redirecting to login...");
//         localStorage.removeItem("token");
//         window.location.href = "/login";
//       }
//     } catch (err) {
//       console.error("Invalid token!", err);
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }
//   }, []);


//   const allowedTypes = [
//   "image/png",
//   "image/jpeg",
//   "image/jpg",
//   "image/webp",
//   "image/gif",
//   "image/svg+xml",
//   "image/bmp",
//   "image/tiff",
//   "image/x-icon",
//   "video/mp4",
//   "video/webm",
//   "video/ogg",
//   "video/x-matroska",
//   "video/quicktime",
//   "video/x-msvideo",
//   "video/x-ms-wmv",
//   "video/mpeg",
// ];

// const processFile = (selectedFile) => {
//   if (!selectedFile) return;

//   if (!allowedTypes.includes(selectedFile.type)) {
//     setMessage("Invalid file type!");
//     return;
//   }

//   setFile(selectedFile);

//   const reader = new FileReader();
//   reader.onload = (e) => setPreview(e.target.result);
//   reader.readAsDataURL(selectedFile);
// };


//   const handleFileChange = (e) => {
//   processFile(e.target.files[0]);
// };


//   const handleTitleChange = (e) => {
//     setTitle(e.target.value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!file) {
//       console.error("No file provided!");
//       setMessage("Please select a file to upload.");
//       return;
//     }

//     if (!title) {
//       console.error("No title provided!");
//       setMessage("Please enter a title.");
//       return;
//     }

//     const extractedTags = title.match(/#\w+/g)?.map((tag) => tag.replace("#", "")) || [];

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("title", title);
//     formData.append("tags", extractedTags.join(","));
//     formData.append("category", category);

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.error("Token missing during upload!");
//         setMessage("User is not authenticated.");
//         return;
//       }

//       const response = await axios.post(
//         "https://backendk-z915.onrender.com/demo/upload",
//         formData,
//         {
//           headers: {
//             "x-auth-token": token,
//             "Content-Type": "multipart/form-data",
//           },
//           onUploadProgress: (progressEvent) => {
//             const percent = Math.round(
//               (progressEvent.loaded * 100) / progressEvent.total
//             );
//             setUploadProgress(percent);
//           },
//         }
//       );

//       console.log("Upload Success:", response.data);
//       setMessage("Post uploaded successfully!");
//       setUploadProgress(0);
//     } catch (error) {
//       // Detailed error logging
//       if (error.response) {
//         // Server responded with a status outside 2xx
//         console.error(
//           "Server Error:",
//           error.response.status,
//           error.response.data
//         );
//         setMessage(
//           `Server Error (${error.response.status}): ${JSON.stringify(
//             error.response.data
//           )}`
//         );
//       } else if (error.request) {
//         // Request made but no response
//         console.error("No response received from server:", error.request);
//         setMessage(
//           "No response from server. Check your network or backend service."
//         );
//       } else {
//         // Something happened in setting up the request
//         console.error("Axios Error:", error.message);
//         setMessage(`Upload Failed: ${error.message}`);
//       }

//       setUploadProgress(0);
//     }
//   };

//   const handleDragOver = (e) => {
//   e.preventDefault();
//   setIsDragging(true);
// };

// const handleDragLeave = () => {
//   setIsDragging(false);
// };

// const handleDrop = (e) => {
//   e.preventDefault();
//   setIsDragging(false);
//   processFile(e.dataTransfer.files[0]);
// };


//   return (
//     <div className="mt-20 sm:mt-32 lg:mt-40 px-4">
//   <div className="lg:m-20 border-2 bg-blue-700 text-white font-bold rounded-lg py-6 px-4 sm:px-6 shadow-lg">
//     <h2 className="text-2xl sm:text-3xl py-2 text-center">Upload a New Post</h2>

//     <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-2xl mx-auto">
      
//       {/* File Input Area */}
//       <div
//   className={`relative border-2 border-dashed rounded-md m-2 h-24 w-full flex items-center justify-center cursor-pointer transition
//     ${isDragging ? "bg-blue-500 border-yellow-400" : "border-white hover:bg-blue-600"}
//   `}
//   onDragOver={handleDragOver}
//   onDragLeave={handleDragLeave}
//   onDrop={handleDrop}
// >

//         <input
//           type="file"
//           id="file"
//           onChange={handleFileChange}
//           className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
//         />
//         <p className="text-white text-center">
//   Drag & Drop media here or click to upload
// </p>

//       </div>

//       {/* Preview Section */}
//       {preview && (
//         <div className="relative flex justify-center mt-4 w-full h-48 sm:h-64">
//           {file && file.type.startsWith("image/") ? (
//             <img
//               className="border-2 rounded-md border-white object-contain w-full h-full"
//               src={preview}
//               alt="Preview"
//             />
//           ) : (
//             <video
//               className="border-2 rounded-md border-white object-contain w-full h-full"
//               src={preview}
//               loop
//               controls
//               autoPlay
//               muted
//             />
//           )}
//         </div>
//       )}

     
//       {/* Title / Post Text */}
// <textarea
//   id="title"
//   value={title}
//   onChange={handleTitleChange}
//   placeholder="Write your post..."
//   rows={6}
//   className="w-full text-white p-3 text-lg sm:text-xl mt-4 
//              bg-transparent border-2 border-white 
//              placeholder-white/80 focus:outline-none 
//              focus:ring-2 focus:ring-yellow-400 
//              rounded resize-none whitespace-pre-wrap"
// />


//       {/* Upload Progress */}
//       {uploadProgress > 0 && (
//         <div className="w-full mt-4">
//           <div className="h-4 bg-gray-300 rounded">
//             <div
//               className="h-4 bg-green-500 rounded"
//               style={{ width: `${uploadProgress}%` }}
//             ></div>
//           </div>
//           <p className="text-center text-white mt-2">{uploadProgress}% uploaded</p>
//         </div>
//       )}

//     <div className="w-full mt-5">
//   <label className="block text-sm sm:text-base font-semibold mb-2 text-white">
//     Select Category
//   </label>

//   <div className="relative">
//     <select
//       value={category}
//       onChange={(e) => setCategory(e.target.value)}
//       className="
//         w-full
//         px-4
//         py-3
//         text-sm sm:text-base
//         bg-blue-700
//         text-white
//         border border-white/60
//         rounded-lg
//         focus:outline-none
//         focus:ring-2 focus:ring-yellow-400
//         focus:border-yellow-400
//         appearance-none
//         transition-all duration-200
//       "
//     >
//       <option value="Entertainment">Entertainment</option> {/* ✅ default first */}

//       <option value="TV Shows">TV Shows</option>
//       <option value="Reality Shows">Reality Shows</option>
//       <option value="Written Updates">Written Updates</option>
//       <option value="Celebrity News">Celebrity News</option>
//       <option value="Movie News">Movie News</option>

//       <option value="Cricket">Cricket</option>
//       <option value="Stock Market">Stock Market</option>
//       <option value="Technology">Technology</option>
//       <option value="Job Updates">Job Updates</option>

//       <option value="Health">Health</option>
//       <option value="Astrology">Astrology</option>

//       <option value="Viral News">Viral News</option>
//       <option value="Trending News">Trending News</option>
//     </select>

//     {/* Arrow */}
//     <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white text-xs sm:text-sm">
//       ▼
//     </div>
//   </div>
// </div>
      
//       {/* Submit Button */}
//       <button
//         type="submit"
//         className="w-full border-2 border-yellow-400 rounded bg-yellow-600 hover:bg-yellow-700 p-3 mt-6 text-lg sm:text-xl font-bold text-white transition duration-200"
//       >
//         Upload Post
//       </button>
//     </form>

//     {/* Message Display */}
//     {message && (
//       <p className="text-lg text-center text-green-300 mt-4">{message}</p>
//     )}
//   </div>
// </div>

//   );
// };

// export default UploadPost;
