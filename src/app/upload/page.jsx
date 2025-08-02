"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";

const UploadPost = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // 🔥 NEW STATE

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("Token is not available");
      return (window.location.href = "/login");
    }

    try {
      const decoded = jwt.decode(token);
      console.log("Decoded token data:", decoded);
      if (!decoded || !decoded.exp) {
        console.log("Token or Exp Missing");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      if (decoded.exp * 1000 < Date.now()) {
        console.log("Now Going to Redirect on Login Page");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } catch (err) {
      console.log("Invalid Token:", err);
      localStorage.removeItem("token");
      return (window.location.href = "/login");
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "video/mp4", "video/webm", "video/x-matroska"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage("Invalid file type. Only images (PNG, JPG) and videos (MP4, WEBM) are allowed.");
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => setPreview(event.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !title) {
      setMessage("Please provide both a file and a title.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated.");
        return;
      }

// https://backendk-z915.onrender.com/ https://backend-k.vercel.app/

      const response = await axios.post("https://backendk-z915.onrender.com/demo/upload", formData, {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent); // 🔥 Update Upload Progress
        },
      });

      setMessage("Post uploaded successfully!");
      console.log("Successfully Uploaded Post:", response.data);
      setUploadProgress(0); // Reset progress bar
      // window.location.href = "/upload";
    } catch (error) {
      setMessage("Internal Server Error. Please try again.");
      console.log(error);
      setUploadProgress(0); // Reset on error
    }
  };

  return (
    <div className="mt-40">
      <div className="lg:m-20 border-2 bg-blue-700 text-white font-bold rounded py-4 px-6">
        <h2 className="text-2xl py-2 text-center">Upload a New Post</h2>
        <form onSubmit={handleSubmit} className="flex flex-col items-center">

          {/* 🔹 File Upload Box */}
          <div className="relative border-2 border-dashed rounded-md m-2 h-20 w-full flex items-center justify-center cursor-pointer">
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
            />
            <p className="text-white">Select Media</p>
          </div>

          {/* 🔹 File Preview */}
          {preview && (
            <div className="relative flex justify-center mt-4 w-full h-48 md:h-64">
              {file && file.type.startsWith("image/") ? (
                <img className="border-2 rounded-md border-white object-contain w-full h-full" src={preview} alt="Preview" />
              ) : (
                <video className="border-2 rounded-md border-white object-contain w-full h-full" src={preview} loop controls autoPlay muted />
              )}
            </div>
          )}

          {/* 🔹 Title Input */}
          <input
            type="text"
            className="w-full text-white p-2 text-xl mt-3 focus:outline-none focus:ring-2 focus:ring-white rounded"
            id="title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter title"
          />

          {/* 🔹 Upload Progress Bar */}
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

          {/* 🔹 Upload Button */}
          <button
            type="submit"
            className="w-full border-2 rounded bg-yellow-600 p-2 mt-4 text-xl font-bold hover:bg-red-700 transition"
          >
            Upload Post
          </button>
        </form>

        {/* 🔹 Display Error/Success Message */}
        {message && <p className="text-lg text-center text-red-400 mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default UploadPost;
