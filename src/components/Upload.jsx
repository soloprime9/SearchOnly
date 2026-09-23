"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { 
  UploadCloud, 
  Film, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Layers, 
  Hash,
  ArrowRight,
  MessageSquare,
  BarChart2,
  Plus,
  Trash2,
  Clock,
  Link as LinkIcon,
  Globe,
  ExternalLink,
  ShieldCheck,
  MapPin
} from "lucide-react";
import { playTap, playPop, playChime } from "@/utils/soundEffects";
import { triggerConfetti } from "@/utils/confetti";
import { toast } from "@/utils/toast";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";

// ─── Extract thumbnail + metadata from video in browser (Optimized for Free R2 Storage) ────
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
      // 640x360 16:9 is super sharp for mobile/desktop feeds while keeping file size under 35KB (92% R2 saving!)
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const duration = Math.round(video.duration);
      if (duration > 90) {
        URL.revokeObjectURL(url);
        video.remove();
        return reject(new Error(`Video duration (${duration}s) exceeds the 90-second maximum limit for Shorts & Reels.`));
      }
      const resolution = `${video.videoWidth}x${video.videoHeight}`;

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          video.remove();
          if (!blob) return reject(new Error("Canvas toBlob failed"));
          resolve({ thumbnailBlob: blob, duration, resolution });
        },
        "image/jpeg",
        0.72
      );
    });

    video.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load video for thumbnail"));
    });

    video.load();
  });
}

// ─── Client-side Photo Compression (Reduces 10MB camera photos to ~180KB WebP) ────
function compressImageFile(file, maxDimension = 1440, quality = 0.78) {
  return new Promise((resolve) => {
    if (file.type === "image/gif" || file.type === "image/svg+xml") {
      return resolve(file);
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            return resolve(file);
          }
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
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

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED_IMAGE_TYPES = [
  "image/png", "image/jpeg", "image/jpg", "image/webp",
  "image/gif", "image/bmp", "image/svg+xml",
];

const CATEGORIES = [
  "Entertainment", "Technology", "Cricket", "Sports", "TV Shows",
  "Reality Shows", "Celebrity News", "Movie News", "Stock Market",
  "Job Updates", "Health", "Viral News", "Trending News",
];

const STAGE_LABELS = {
  idle: "",
  validating: "Validating content...",
  thumbnail: "Generating HD preview...",
  signing: "Securing upload pipeline...",
  uploading_thumb: "Syncing thumbnail...",
  uploading_video: "Uploading video to cloud...",
  uploading_image: "Uploading image to cloud...",
  saving: "Publishing to FondPeace...",
  done: "Post published successfully!",
  error: "",
};

export default function UploadPost() {
  const [activeMode, setActiveMode] = useState("all"); // "all" | "discussion" | "article" | "poll"
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [articleHeadline, setArticleHeadline] = useState("");
  const [category, setCategory] = useState("Entertainment");
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [fileMeta, setFileMeta] = useState(null); // { duration, resolution, sizeMB, isVideo }
  const fileRef = useRef(null);

  // Poll state
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDurationHours, setPollDurationHours] = useState(24);

  // Live Link Preview state
  const [linkPreviewData, setLinkPreviewData] = useState(null);
  const [fetchingLinkPreview, setFetchingLinkPreview] = useState(false);
  const [dismissedLinkUrl, setDismissedLinkUrl] = useState(null);
  const previewDebounceRef = useRef(null);

  // Post Geolocation state
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const detectCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    playTap();
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const addr = res.data?.address;
          const city = addr?.city || addr?.town || addr?.state_district || addr?.state || "Nearby";
          const country = addr?.country || "";
          const locStr = `${city}${country ? `, ${country}` : ""}`;
          setLocation(locStr);
          setShowLocationInput(true);
          toast.success(`Location set: 📍 ${locStr}`);
        } catch {
          setLocation("India");
          setShowLocationInput(true);
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        toast.error("Please allow location access to auto-detect.");
      },
      { timeout: 8000 }
    );
  };

  // Auto-detect URL in caption/thought and fetch live OpenGraph preview
  useEffect(() => {
    const urlMatch = (title || "").match(/https?:\/\/[^\s]+/i);
    if (!urlMatch) {
      if (linkPreviewData && !dismissedLinkUrl) {
        setLinkPreviewData(null);
      }
      return;
    }

    const detectedUrl = urlMatch[0];
    if (detectedUrl === dismissedLinkUrl) return;
    if (linkPreviewData && linkPreviewData.url === detectedUrl) return;

    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);

    previewDebounceRef.current = setTimeout(async () => {
      setFetchingLinkPreview(true);
      try {
        const API = getApiBase();
        const res = await axios.get(`${API}/post/preview-link?url=${encodeURIComponent(detectedUrl)}`);
        if (res.data?.success && res.data?.preview) {
          setLinkPreviewData(res.data.preview);
        }
      } catch (_) {
        // Quiet failure if URL is not previewable
      } finally {
        setFetchingLinkPreview(false);
      }
    }, 600);

    return () => {
      if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    };
  }, [title, dismissedLinkUrl, linkPreviewData]);

  function processFile(selectedFile) {
    if (!selectedFile) return;
    setErrorMsg("");
    setFileMeta(null);

    const isVideo = ALLOWED_VIDEO_TYPES.includes(selectedFile.type);
    const isImage = ALLOWED_IMAGE_TYPES.includes(selectedFile.type);

    if (!isVideo && !isImage) {
      playPop();
      if (fileRef.current) fileRef.current.value = "";
      return setErrorMsg("Invalid format. Please select an MP4, WebM, JPG, PNG, or WebP file.");
    }

    // ── Pre-check 1: File Size Limit for Free Cloudflare R2 ──
    if (isVideo && selectedFile.size > 50 * 1024 * 1024) {
      playPop();
      if (fileRef.current) fileRef.current.value = "";
      return setErrorMsg(`⚠️ Video size (${(selectedFile.size / 1024 / 1024).toFixed(1)} MB) exceeds the 50MB free-tier storage limit for Shorts & Reels. Please select a shorter video or compress it.`);
    }

    if (isImage && selectedFile.size > 15 * 1024 * 1024) {
      playPop();
      if (fileRef.current) fileRef.current.value = "";
      return setErrorMsg(`⚠️ Image exceeds 15MB limit. Please select a photo under 15MB.`);
    }

    // ── Pre-check 2: Instant Duration Probe for Videos (Before uploading anything to R2) ──
    if (isVideo) {
      const videoProbe = document.createElement("video");
      const tempUrl = URL.createObjectURL(selectedFile);
      videoProbe.preload = "metadata";
      videoProbe.src = tempUrl;

      videoProbe.onloadedmetadata = () => {
        URL.revokeObjectURL(tempUrl);
        const duration = Math.round(videoProbe.duration);

        if (duration > 90) {
          playPop();
          if (fileRef.current) fileRef.current.value = "";
          setFile(null);
          setPreview(null);
          setFileMeta(null);
          return setErrorMsg(`⚠️ Video duration (${duration}s / ${Math.floor(duration / 60)}m ${duration % 60}s) exceeds the 90-second limit for Shorts & Reels. To protect our free cloud storage, please trim the video to 90 seconds or less.`);
        }

        setFileMeta({
          duration,
          resolution: `${videoProbe.videoWidth}x${videoProbe.videoHeight}`,
          sizeMB: (selectedFile.size / 1024 / 1024).toFixed(1),
          isVideo: true,
        });
        setFile(selectedFile);
        playTap();

        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(selectedFile);
      };

      videoProbe.onerror = () => {
        URL.revokeObjectURL(tempUrl);
        playPop();
        if (fileRef.current) fileRef.current.value = "";
        return setErrorMsg("Could not load video metadata. The file may be corrupt or encoded in an unsupported format.");
      };
      return;
    }

    // For images:
    setFileMeta({
      sizeMB: (selectedFile.size / 1024 / 1024).toFixed(1),
      isVideo: false,
    });
    setFile(selectedFile);
    playTap();

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  }

  function handleFileChange(e) {
    processFile(e.target.files[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  }

  function clearSelectedFile() {
    setFile(null);
    setPreview(null);
    setFileMeta(null);
    if (fileRef.current) fileRef.current.value = "";
    playTap();
  }

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      playPop();
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handleRemovePollOption = (idx) => {
    if (pollOptions.length > 2) {
      playPop();
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handlePollOptionChange = (text, idx) => {
    const updated = [...pollOptions];
    updated[idx] = text;
    setPollOptions(updated);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    const hasFile = !!file;
    const hasText = !!title.trim();
    const isPoll = activeMode === "poll";
    const hasPoll = isPoll && !!pollQuestion.trim();

    // Universal validation: Platform accepts Text, Media, or Poll!
    if (!hasFile && !hasText && !hasPoll) {
      playPop();
      return setErrorMsg("Please write a thought/discussion, select a photo/video, or add a poll question.");
    }

    if (isPoll) {
      const validOpts = pollOptions.filter((o) => o.trim().length > 0);
      if (validOpts.length < 2) {
        playPop();
        return setErrorMsg("Poll must have at least 2 non-empty options.");
      }
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please login to create a post");
      return (window.location.href = "/login");
    }

    const API = getApiBase();
    const headers = { "x-auth-token": token, Authorization: `Bearer ${token}` };
    const isVideo = file && ALLOWED_VIDEO_TYPES.includes(file.type);
    playTap();

    try {
      // ─── CASE 1: Pure Text / Discussion or Community Poll (No file upload needed) ───
      if (!hasFile) {
        setStage("saving");
        const extractedTags = (title.match(/#\w+/g) || []).map((t) => t.replace("#", ""));

        let payload = {
          title: title.trim() || (isPoll ? pollQuestion.trim() : "Community Discussion"),
          category,
          tags: extractedTags,
          mediaType: "text",
        };

        if (isPoll) {
          payload.title = pollQuestion.trim() + (title.trim() ? `\n\n${title.trim()}` : "");
          payload.poll = {
            question: pollQuestion.trim(),
            options: pollOptions.filter((o) => o.trim().length > 0).map((opt) => ({ optionText: opt.trim() })),
            durationHours: pollDurationHours,
          };
        } else if (activeMode === "article") {
          payload.title = articleHeadline.trim()
            ? `${articleHeadline.trim()}\n\n${title.trim()}`
            : title.trim();
          payload.postType = "article";
        }

        if (linkPreviewData) {
          payload.linkPreview = linkPreviewData;
        }

        if (location.trim()) {
          payload.location = location.trim();
        }

        await axios.post(`${API}/post/create`, payload, { headers });
      }

      // ─── CASE 2: Video Upload via Presigned R2 Pipeline ───
      else if (isVideo) {
        setStage("thumbnail");
        setProgress(0);
        let thumbnailBlob, duration, resolution;
        try {
          ({ thumbnailBlob, duration, resolution } = await extractVideoMeta(file));
        } catch (metaErr) {
          playPop();
          setStage("idle");
          return setErrorMsg(metaErr.message || "Could not process video. FondPeace limit is 90 seconds.");
        }

        if (duration > 90) {
          playPop();
          setStage("idle");
          return setErrorMsg(`Video duration (${duration}s) exceeds the 90-second maximum limit for Shorts & Reels.`);
        }

        const thumbnailFile = thumbnailBlob
          ? new File([thumbnailBlob], "thumbnail.jpg", { type: "image/jpeg" })
          : null;

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

        if (thumbnailFile) {
          setStage("uploading_thumb");
          await uploadToR2(urls.thumbUpload.url, thumbnailFile, "image/jpeg");
        }

        setStage("uploading_video");
        setProgress(0);
        await uploadToR2(urls.videoUpload.url, file, file.type, setProgress);

        setStage("saving");
        const extractedTags = (title.match(/#\w+/g) || []).map((t) => t.replace("#", ""));
        await axios.post(
          `${API}/demo/confirm`,
          {
            title: title.trim() || `${category} Video`,
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
            location: location.trim() || undefined,
            linkPreview: linkPreviewData || undefined,
          },
          { headers }
        );
      }

      // ─── CASE 3: Photo Upload via Presigned R2 Pipeline (Optimized for Free R2 Storage) ───
      else {
        setStage("validating");
        // Compress client-side to keep R2 bucket storage well within the free tier (saves 85%+ storage)
        const uploadFile = await compressImageFile(file, 1440, 0.78);

        setStage("signing");
        const { data: urlData } = await axios.post(
          `${API}/demo/presign-image`,
          {
            filename: uploadFile.name,
            contentType: uploadFile.type,
            fileSize: uploadFile.size,
          },
          { headers }
        );

        setStage("uploading_image");
        setProgress(0);
        await uploadToR2(urlData.url, uploadFile, uploadFile.type, setProgress);

        setStage("saving");
        const extractedTags = (title.match(/#\w+/g) || []).map((t) => t.replace("#", ""));
        await axios.post(
          `${API}/demo/confirm`,
          {
            title: title.trim() || `${category} Photo`,
            category,
            tags: extractedTags.join(","),
            imageKey: urlData.key,
            imageUrl: urlData.publicUrl,
            mediaType: uploadFile.type,
            fileSize: uploadFile.size,
            location: location.trim() || undefined,
            linkPreview: linkPreviewData || undefined,
          },
          { headers }
        );
      }

      setStage("done");
      setProgress(0);
      playChime();
      triggerConfetti();
      toast.success("Post published successfully! 🎉");

      // Reset form
      setFile(null);
      setTitle("");
      setPreview(null);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setCategory("Entertainment");
      setLinkPreviewData(null);
      setDismissedLinkUrl(null);
      if (fileRef.current) fileRef.current.value = "";

    } catch (error) {
      setStage("error");
      setProgress(0);
      playPop();
      if (error.response) {
        setErrorMsg(`Server Error: ${error.response.data?.error || error.response.data?.message || "Upload failed"}`);
      } else {
        setErrorMsg("Upload failed. Please check your connection and try again.");
      }
    }
  }

  const isBusy = !["idle", "done", "error"].includes(stage);
  const isVideo = file && ALLOWED_VIDEO_TYPES.includes(file.type);
  const isImage = file && ALLOWED_IMAGE_TYPES.includes(file.type);
  const detectedTags = title.match(/#\w+/g) || [];

  const hasContentToPublish =
    !!file ||
    !!title.trim() ||
    (activeMode === "poll" && !!pollQuestion.trim()) ||
    (activeMode === "article" && (!!articleHeadline.trim() || !!title.trim()));

  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12 px-3 sm:px-4">
      {/* Container Card */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-white/90 dark:bg-zinc-950/80 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.4)]">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FondPeace Creator Studio</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-950 dark:text-white">
            Create & Share
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-md mx-auto">
            Share short videos, photos, community discussions, or write long-form articles with zero restrictions.
          </p>
        </div>

        {/* Post Type Selector Tabs */}
        <div className="flex items-center justify-center gap-1.5 p-1.5 bg-gray-100 dark:bg-zinc-900 rounded-2xl mb-6 relative z-10">
          {[
            { id: "all", label: "🌟 Media", desc: "Photo, Video or Text" },
            { id: "discussion", label: "💭 Discussion", desc: "Thoughts & questions" },
            { id: "article", label: "📝 Article / Blog", desc: "Dev.to & Substack style" },
            { id: "poll", label: "📊 Voting Poll", desc: "Interactive community poll" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playTap();
                setActiveMode(tab.id);
                setErrorMsg("");
              }}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeMode === tab.id
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* MEDIA SECTION: Visible when in 'all' mode */}
          {activeMode === "all" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Attach Photo / Video <span className="text-gray-400 font-normal capitalize">(Optional)</span>
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Remove file
                  </button>
                )}
              </div>

              {!preview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[0.99]"
                      : "border-black/15 dark:border-white/15 hover:border-blue-500/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept={[...ALLOWED_VIDEO_TYPES, ...ALLOWED_IMAGE_TYPES].join(",")}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isBusy}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    Drop photo or video here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    Reels & Shorts up to 90s & 50MB • Photos up to 15MB (Auto-compressed) • 100% Free Cloud Storage
                  </p>
                </div>
              ) : (
                <div className="relative rounded-3xl overflow-hidden bg-black/90 border border-black/10 dark:border-white/10 shadow-md">
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    disabled={isBusy}
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="relative aspect-video max-h-80 w-full flex items-center justify-center overflow-hidden">
                    {isVideo ? (
                      <video
                        src={preview}
                        controls
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={preview}
                        alt="Upload Preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {file && (
                    <div className="px-4 py-3 bg-zinc-950/90 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-300 border-t border-white/10">
                      <div className="flex items-center gap-2 truncate">
                        {isVideo ? <Film className="w-4 h-4 text-pink-400 shrink-0" /> : <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />}
                        <span className="truncate font-medium">{file.name}</span>
                        <span className="text-gray-400 shrink-0 font-mono text-[11px]">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>

                      {fileMeta?.isVideo ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                            <Clock className="w-3 h-3" />
                            {fileMeta.duration}s / 90s max
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-semibold">
                            <ShieldCheck className="w-3 h-3" />
                            R2 Safe ({fileMeta.sizeMB}MB / 50MB)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                            <Sparkles className="w-3 h-3" />
                            Client Auto-Compressed (~180KB)
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* R2 Cloud Storage Safeguard Note */}
              <div className="mt-2.5 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/5 dark:bg-blue-400/5 border border-blue-500/15 text-[11px] text-gray-500 dark:text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>
                  <strong>Cloudflare R2 Free Shield Active:</strong> Reels capped at 90s & 50MB, images compressed on-device. Zero cost & unlimited views!
                </span>
              </div>
            </div>
          )}

          {/* POLL BUILDER SECTION: Visible when in 'poll' mode */}
          {activeMode === "poll" && (
            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-700 dark:text-indigo-400">
                <BarChart2 className="w-4 h-4" />
                <span>Create Interactive Poll</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Poll Question *
                </label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ask the community a question..."
                  className="w-full p-3 rounded-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Voting Options (2 to 4)
                </label>
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-5 text-center">{i + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handlePollOptionChange(e.target.value, i)}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(i)}
                        className="text-gray-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddPollOption}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Option
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Poll Duration:
                </span>
                <select
                  value={pollDurationHours}
                  onChange={(e) => setPollDurationHours(Number(e.target.value))}
                  className="text-xs font-bold bg-white dark:bg-zinc-900 p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700"
                >
                  <option value={24}>24 Hours</option>
                  <option value={72}>3 Days</option>
                  <option value={168}>7 Days</option>
                </select>
              </div>
            </div>
          )}

          {/* Caption / Title / Thought Content Textarea */}
          <div>
            {/* Article Headline Input (Dev.to / Substack Style) */}
            {activeMode === "article" && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Article Headline / Title (H1) *
                </label>
                <input
                  type="text"
                  value={articleHeadline}
                  onChange={(e) => setArticleHeadline(e.target.value)}
                  placeholder="e.g. The Complete Guide to Building Modern Web Apps in 2026"
                  className="w-full p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-base font-bold"
                />
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {activeMode === "article"
                  ? "Article Body / Story Content *"
                  : activeMode === "discussion" 
                  ? "Discussion Thought & Details *" 
                  : activeMode === "poll"
                  ? "Additional Context / Note (Optional)"
                  : file ? "Caption & Hashtags (Optional)" : "Discussion Thought / Caption *"}
              </label>
              {activeMode === "article" && (
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200/50 dark:border-blue-800/40">
                  📖 {title.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              )}
            </div>

            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                activeMode === "article"
                  ? "Write your detailed article, technical guide, or thought here... Supports multi-paragraph stories with headings and links."
                  : activeMode === "discussion"
                  ? "Share your insight, debate, or question with the community... Add #hashtags for visibility!"
                  : activeMode === "poll"
                  ? "Add any extra details or background context about this poll..."
                  : "What's on your mind? Write a thought or caption with #hashtags..."
              }
              rows={activeMode === "article" ? 8 : activeMode === "discussion" ? 5 : 3}
              disabled={isBusy}
              className="w-full p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none text-sm sm:text-base leading-relaxed"
            />
            {detectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-blue-500" />
                  Detected:
                </span>
                {detectedTags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Live Interactive Link Preview Card (X / Twitter Style in Upload Studio) */}
            {fetchingLinkPreview && (
              <div className="mt-3 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40 flex items-center gap-2.5 text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse">
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Fetching live web link preview...</span>
              </div>
            )}

            {linkPreviewData && (
              <div className="mt-3 relative rounded-2xl overflow-hidden border border-blue-200/60 dark:border-blue-800/50 bg-white dark:bg-zinc-900 shadow-sm group">
                <div className="flex items-center justify-between px-3.5 py-2 bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/30 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                  <span className="flex items-center gap-1.5 truncate">
                    <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Live Preview: {linkPreviewData.siteName || "External Link"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setDismissedLinkUrl(linkPreviewData.url);
                      setLinkPreviewData(null);
                    }}
                    className="text-gray-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                    title="Remove Link Preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row">
                  {linkPreviewData.image && (
                    <div className="w-full sm:w-44 h-32 sm:h-auto shrink-0 bg-black/10 overflow-hidden">
                      <img
                        src={linkPreviewData.image}
                        alt={linkPreviewData.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.parentElement.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="p-3.5 flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug">
                      {linkPreviewData.title}
                    </h4>
                    {linkPreviewData.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                        {linkPreviewData.description}
                      </p>
                    )}
                    <div className="mt-2 text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{linkPreviewData.url}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location Tagging Input */}
          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Tag Location <span className="text-gray-400 font-normal">(Optional)</span>
                </span>
              </div>
              <button
                type="button"
                onClick={detectCurrentLocation}
                disabled={detectingLocation || isBusy}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {detectingLocation ? (
                  <>
                    <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <span>🎯 Auto-Detect GPS</span>
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, Maharashtra or New Delhi, India"
                disabled={isBusy}
                className="w-full p-2.5 pr-8 rounded-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-rose-500"
              />
              {location && (
                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    setLocation("");
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 p-0.5 cursor-pointer"
                  title="Clear location"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isBusy}
                className="w-full p-3.5 pr-10 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm font-medium appearance-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
                    {c}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          {(stage === "uploading_video" || stage === "uploading_image") && (
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/40">
              <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">
                <span>{STAGE_LABELS[stage]}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stage status label */}
          {stage !== "idle" && stage !== "uploading_video" && stage !== "uploading_image" && STAGE_LABELS[stage] && (
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>{STAGE_LABELS[stage]}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isBusy || !hasContentToPublish}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isBusy ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{STAGE_LABELS[stage] || "Publishing..."}</span>
              </div>
            ) : (
              <>
                <span>
                  {isVideo
                    ? "Publish Video Reel 🎬"
                    : isImage
                    ? "Publish Photo 📸"
                    : activeMode === "poll"
                    ? "Publish Community Poll 📊"
                    : "Publish Discussion 💬"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
