"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";

const UploadPost = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token not found! Redirecting to login...");
      return (window.location.href = "/login");
    }

    try {
      const decoded = jwt.decode(token);
      console.log("Decoded token:", decoded);

      if (!decoded || !decoded.exp) {
        console.error("Token missing expiration! Removing token and redirecting.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      if (decoded.exp * 1000 < Date.now()) {
        console.warn("Token expired! Redirecting to login...");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Invalid token!", err);
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }, []);


  const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/x-icon",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/x-matroska",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/mpeg",
];

const processFile = (selectedFile) => {
  if (!selectedFile) return;

  if (!allowedTypes.includes(selectedFile.type)) {
    setMessage("Invalid file type!");
    return;
  }

  setFile(selectedFile);

  const reader = new FileReader();
  reader.onload = (e) => setPreview(e.target.result);
  reader.readAsDataURL(selectedFile);
};


  const handleFileChange = (e) => {
  processFile(e.target.files[0]);
};


  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      console.error("No file provided!");
      setMessage("Please select a file to upload.");
      return;
    }

    if (!title) {
      console.error("No title provided!");
      setMessage("Please enter a title.");
      return;
    }

    const extractedTags = title.match(/#\w+/g)?.map((tag) => tag.replace("#", "")) || [];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("tags", extractedTags.join(","));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token missing during upload!");
        setMessage("User is not authenticated.");
        return;
      }

      const response = await axios.post(
        "https://backendk-z915.onrender.com/demo/upload",
        formData,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        }
      );

      console.log("Upload Success:", response.data);
      setMessage("Post uploaded successfully!");
      setUploadProgress(0);
    } catch (error) {
      // Detailed error logging
      if (error.response) {
        // Server responded with a status outside 2xx
        console.error(
          "Server Error:",
          error.response.status,
          error.response.data
        );
        setMessage(
          `Server Error (${error.response.status}): ${JSON.stringify(
            error.response.data
          )}`
        );
      } else if (error.request) {
        // Request made but no response
        console.error("No response received from server:", error.request);
        setMessage(
          "No response from server. Check your network or backend service."
        );
      } else {
        // Something happened in setting up the request
        console.error("Axios Error:", error.message);
        setMessage(`Upload Failed: ${error.message}`);
      }

      setUploadProgress(0);
    }
  };

  const handleDragOver = (e) => {
  e.preventDefault();
  setIsDragging(true);
};

const handleDragLeave = () => {
  setIsDragging(false);
};

const handleDrop = (e) => {
  e.preventDefault();
  setIsDragging(false);
  processFile(e.dataTransfer.files[0]);
};


  return (
    <div className="mt-20 sm:mt-32 lg:mt-40 px-4">
  <div className="lg:m-20 border-2 bg-blue-700 text-white font-bold rounded-lg py-6 px-4 sm:px-6 shadow-lg">
    <h2 className="text-2xl sm:text-3xl py-2 text-center">Upload a New Post</h2>

    <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-2xl mx-auto">
      
      {/* File Input Area */}
      <div
  className={`relative border-2 border-dashed rounded-md m-2 h-24 w-full flex items-center justify-center cursor-pointer transition
    ${isDragging ? "bg-blue-500 border-yellow-400" : "border-white hover:bg-blue-600"}
  `}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>

        <input
          type="file"
          id="file"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
        />
        <p className="text-white text-center">
  Drag & Drop media here or click to upload
</p>

      </div>

      {/* Preview Section */}
      {preview && (
        <div className="relative flex justify-center mt-4 w-full h-48 sm:h-64">
          {file && file.type.startsWith("image/") ? (
            <img
              className="border-2 rounded-md border-white object-contain w-full h-full"
              src={preview}
              alt="Preview"
            />
          ) : (
            <video
              className="border-2 rounded-md border-white object-contain w-full h-full"
              src={preview}
              loop
              controls
              autoPlay
              muted
            />
          )}
        </div>
      )}

     
      {/* Title / Post Text */}
<textarea
  id="title"
  value={title}
  onChange={handleTitleChange}
  placeholder="Write your post..."
  rows={6}
  className="w-full text-white p-3 text-lg sm:text-xl mt-4 
             bg-transparent border-2 border-white 
             placeholder-white/80 focus:outline-none 
             focus:ring-2 focus:ring-yellow-400 
             rounded resize-none"
/>


      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="w-full mt-4">
          <div className="h-4 bg-gray-300 rounded">
            <div
              className="h-4 bg-green-500 rounded"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-center text-white mt-2">{uploadProgress}% uploaded</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full border-2 border-yellow-400 rounded bg-yellow-600 hover:bg-yellow-700 p-3 mt-6 text-lg sm:text-xl font-bold text-white transition duration-200"
      >
        Upload Post
      </button>
    </form>

    {/* Message Display */}
    {message && (
      <p className="text-lg text-center text-green-300 mt-4">{message}</p>
    )}
  </div>
</div>

  );
};

export default UploadPost;
