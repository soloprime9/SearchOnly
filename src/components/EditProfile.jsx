"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  UploadCloud,
  Trash2,
  User,
  AtSign,
  FileText,
  Sparkles,
  Globe,
  MapPin,
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Check,
  ArrowLeft,
  ExternalLink,
  Save,
  Loader2,
  ShieldCheck,
  Eye,
  AlertCircle
} from "lucide-react";
import { API_BASE, getAuthHeaders } from "@/utils/apiConfig";
import { toast } from "@/utils/toast";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import { useThemeBackground } from "@/context/ThemeBackgroundContext";

const CATEGORIES = [
  "General",
  "Entertainment",
  "Technology",
  "Cricket & Sports",
  "Cinema & Movies",
  "TV & Reality Shows",
  "Music & Audio",
  "Gaming",
  "Viral & Trending",
  "News & Current Affairs",
  "Health & Fitness",
  "Comedy & Memes",
  "Education",
  "Finance & Crypto",
  "Lifestyle & Travel"
];

// Client-side image compression helper to keep storage fast and crisp
async function compressImage(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/")) return resolve(file);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) return resolve(file);
          const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(compressed);
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

export default function EditProfile({ initialUsername }) {
  const router = useRouter();
  const { bgTheme } = useThemeBackground();

  // Loading & Session States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    tagline: "",
    bio: "",
    category: "General",
    website: "",
    location: "",
    profilePicture: "",
    coverImage: "",
    socialLinks: {
      instagram: "",
      twitter: "",
      youtube: "",
      linkedin: "",
      github: ""
    }
  });

  const [initialData, setInitialData] = useState(null);
  const [currentSessionUser, setCurrentSessionUser] = useState(null);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // 1. Authenticate and load profile data
  useEffect(() => {
    const initEditProfile = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setAuthError("Please log in to edit your profile.");
        setLoading(false);
        return;
      }

      let loggedUserId = null;
      let loggedUsername = null;
      try {
        const decoded = jwt.decode(token);
        if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
          localStorage.removeItem("token");
          setAuthError("Your session has expired. Please log in again.");
          setLoading(false);
          return;
        }
        loggedUserId = decoded.UserId || decoded.userId || decoded._id || decoded.id;
        loggedUsername = decoded.username;
        setCurrentSessionUser({ id: loggedUserId, username: loggedUsername });
      } catch {
        setAuthError("Invalid session. Please log in again.");
        setLoading(false);
        return;
      }

      // Target username: URL param or logged in username
      const target = initialUsername || loggedUsername;

      try {
        let profileUser = null;

        // Try authenticated endpoint
        try {
          const res = await axios.get(`${API_BASE}/user/profile/${encodeURIComponent(target)}`, {
            headers: { "x-auth-token": token, Authorization: `Bearer ${token}` }
          });
          if (res.data?.Profile?.user) {
            profileUser = res.data.Profile.user;
          }
        } catch (_) {}

        // Fallback to public profile endpoint
        if (!profileUser) {
          try {
            const res = await axios.get(`${API_BASE}/user/profile-public/${encodeURIComponent(target)}`);
            if (res.data?.Profile?.user) {
              profileUser = res.data.Profile.user;
            }
          } catch (_) {}
        }

        // If user is accessing someone else's edit page, redirect them to their own edit page
        if (profileUser && loggedUsername && profileUser.username?.toLowerCase() !== loggedUsername.toLowerCase()) {
          toast.info(`Redirecting to your own profile settings (@${loggedUsername})...`);
          router.replace(`/edit/${loggedUsername}`);
          return;
        }

        // Populate Form State
        const loaded = {
          name: profileUser?.name || profileUser?.username || loggedUsername || "",
          username: profileUser?.username || loggedUsername || "",
          tagline: profileUser?.tagline || "",
          bio: profileUser?.bio && profileUser.bio !== "Add About You" ? profileUser.bio : "",
          category: profileUser?.category || "General",
          website: profileUser?.website || "",
          location: profileUser?.location || "",
          profilePicture: profileUser?.profilePicture && profileUser.profilePicture !== "/Fondpeace.jpg" ? profileUser.profilePicture : "",
          coverImage: profileUser?.coverImage || "",
          socialLinks: {
            instagram: profileUser?.socialLinks?.instagram || "",
            twitter: profileUser?.socialLinks?.twitter || "",
            youtube: profileUser?.socialLinks?.youtube || "",
            linkedin: profileUser?.socialLinks?.linkedin || "",
            github: profileUser?.socialLinks?.github || ""
          }
        };

        setFormData(loaded);
        setInitialData(loaded);
        setLoading(false);
      } catch (err) {
        console.error("Error loading user profile for edit:", err);
        // Still allow editing with basic session data
        const fallback = {
          name: loggedUsername || "",
          username: loggedUsername || "",
          tagline: "",
          bio: "",
          category: "General",
          website: "",
          location: "",
          profilePicture: "",
          coverImage: "",
          socialLinks: { instagram: "", twitter: "", youtube: "", linkedin: "", github: "" }
        };
        setFormData(fallback);
        setInitialData(fallback);
        setLoading(false);
      }
    };

    initEditProfile();
  }, [initialUsername, router]);

  // Handle Form Change
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  // Upload image to Cloudflare R2 via presigned pipeline
  const handleUploadImage = async (file, type = "avatar") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to upload images.");
      return;
    }

    try {
      if (type === "avatar") setUploadingAvatar(true);
      else setUploadingCover(true);

      // Compress client side
      const maxWidth = type === "cover" ? 1600 : 800;
      const compressedFile = await compressImage(file, maxWidth, 0.85);

      const headers = { "x-auth-token": token, Authorization: `Bearer ${token}` };

      // Get presigned URL from backend
      const { data: urlData } = await axios.post(
        `${API_BASE}/demo/presign-image`,
        {
          filename: compressedFile.name || `${type}-${Date.now()}.jpg`,
          contentType: compressedFile.type || "image/jpeg",
          fileSize: compressedFile.size,
        },
        { headers }
      );

      // Direct PUT upload to Cloudflare R2
      await axios.put(urlData.url, compressedFile, {
        headers: { "Content-Type": compressedFile.type || "image/jpeg" },
      });

      const publicUrl = urlData.publicUrl;

      if (type === "avatar") {
        handleChange("profilePicture", publicUrl);
        toast.success("Profile photo uploaded!");
      } else {
        handleChange("coverImage", publicUrl);
        toast.success("Cover banner uploaded!");
      }
      playPop();
    } catch (err) {
      console.error(`Failed to upload ${type}:`, err);
      toast.error(`Failed to upload ${type}. Please try again.`);
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  // Save Profile Handler
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    playTap();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to save changes.");
      return;
    }

    // Validation
    const cleanUsername = formData.username.trim().replace(/^@/, "");
    if (!cleanUsername) {
      toast.error("Username cannot be empty.");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      toast.error("Username must be 3-30 letters, numbers, or underscores.");
      return;
    }

    const cleanName = formData.name.trim();
    if (!cleanName) {
      toast.error("Full Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const headers = {
        "x-auth-token": token,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const payload = {
        name: cleanName,
        username: cleanUsername,
        tagline: formData.tagline.trim(),
        bio: formData.bio.trim(),
        category: formData.category,
        website: formData.website.trim(),
        location: formData.location.trim(),
        profilePicture: formData.profilePicture,
        coverImage: formData.coverImage,
        socialLinks: {
          instagram: formData.socialLinks.instagram.trim(),
          twitter: formData.socialLinks.twitter.trim(),
          youtube: formData.socialLinks.youtube.trim(),
          linkedin: formData.socialLinks.linkedin.trim(),
          github: formData.socialLinks.github.trim()
        }
      };

      const res = await axios.put(`${API_BASE}/user/profile/update`, payload, { headers });

      // If backend returns a renewed token or updated payload, update storage
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      // Notify other components (like navbar / profile header) of changes
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("user_profile_updated"));
      }

      playChime();
      toast.success("Profile saved successfully! ✨");

      // Redirect to updated live profile after a short moment
      setTimeout(() => {
        router.push(`/profile/${cleanUsername}`);
      }, 700);

    } catch (err) {
      console.error("Profile update failed:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to update profile. Please check your connection.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Render Auth Error State
  if (authError) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-[var(--text-primary)] mb-2">Access Denied</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">{authError}</p>
        <Link
          href={`/login?redirect=/edit/${initialUsername || ""}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <span>Log In to Your Account</span>
        </Link>
      </div>
    );
  }

  // Render Loading State
  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
          Loading Creator Studio Settings...
        </p>
      </div>
    );
  }

  const userInitial = (formData.username?.[0] || formData.name?.[0] || "C").toUpperCase();

  return (
    <div className="w-full max-w-3xl mx-auto pb-32 px-3 sm:px-6">
      
      {/* ══════════════════════════════════════════════════════════
          1. TOP NAVIGATION & HEADER
      ══════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between py-4 mb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <Link
            href={`/profile/${formData.username || initialUsername}`}
            onClick={() => playTap()}
            className="p-2 rounded-full hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
            title="Back to profile"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Edit Profile
            </h1>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Manage your identity, visuals & creator presence on FondPeace
            </p>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition active:scale-95"
          >
            <Eye size={13} />
            <span>{showLivePreview ? "Hide Preview" : "Live Preview"}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. LIVE PREVIEW CARD (TOGGLEABLE)
      ══════════════════════════════════════════════════════════ */}
      {showLivePreview && (
        <div className="mb-6 p-4 rounded-2xl bg-[var(--bg-surface)] border border-blue-500/30 shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-blue-500">
            <span className="flex items-center gap-1">
              <Sparkles size={13} />
              Live Profile Card Preview
            </span>
            <span className="text-[10px] text-[var(--text-secondary)]">How other visitors see you</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-blue-500/30 shrink-0 bg-slate-800">
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl">
                  {userInitial}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[var(--text-primary)] truncate">
                  {formData.name || "Your Name"}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  {formData.category}
                </span>
              </div>
              <p className="text-xs font-medium text-[var(--text-secondary)]">@{formData.username || "username"}</p>
              {formData.tagline && (
                <p className="text-xs text-[var(--text-primary)] mt-0.5 font-medium italic truncate">
                  "{formData.tagline}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* ══════════════════════════════════════════════════════════
            3. VISUAL BRANDING: COVER & AVATAR
        ══════════════════════════════════════════════════════════ */}
        <section className="rounded-2xl p-4 sm:p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
            <Camera size={15} className="text-blue-500" />
            <span>Visual Branding & Aesthetics</span>
          </h2>

          {/* Cover Banner Container */}
          <div className="relative h-32 sm:h-44 w-full rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 group mb-14">
            {formData.coverImage ? (
              <img
                src={formData.coverImage}
                alt="Cover Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                <span>Upload a widescreen banner (16:9 or 3:1)</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors pointer-events-none" />

            {/* Cover Banner Action Buttons */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleUploadImage(e.target.files[0], "cover");
                }}
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {uploadingCover ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <UploadCloud size={13} />
                )}
                <span>{formData.coverImage ? "Change Cover" : "Add Cover"}</span>
              </button>

              {formData.coverImage && (
                <button
                  type="button"
                  onClick={() => handleChange("coverImage", "")}
                  className="p-1.5 rounded-full bg-black/70 hover:bg-rose-900/80 backdrop-blur-md text-white hover:text-rose-300 text-xs border border-white/20 transition-all active:scale-95 cursor-pointer shadow-md"
                  title="Remove cover banner"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Avatar - Positioned overlapping the bottom of the cover banner */}
            <div className="absolute -bottom-10 left-4 sm:left-6 z-20">
              <div className="relative group/avatar">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-[var(--bg-canvas)] overflow-hidden bg-[var(--bg-surface)] shadow-xl">
                  {formData.profilePicture ? (
                    <img
                      src={formData.profilePicture}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white font-black text-3xl">
                      {userInitial}
                    </div>
                  )}

                  {/* Uploading Overlay */}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                      <Loader2 size={24} className="animate-spin mb-1 text-blue-400" />
                      <span className="text-[10px] font-bold">Uploading...</span>
                    </div>
                  )}
                </div>

                {/* Avatar Change Trigger */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleUploadImage(e.target.files[0], "avatar");
                  }}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg ring-2 ring-[var(--bg-canvas)] transition-all active:scale-90 cursor-pointer"
                  title="Upload profile photo"
                >
                  <Camera size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mt-3 pt-2">
            <span>Avatar recommendations: 500x500px square photo</span>
            {formData.profilePicture && (
              <button
                type="button"
                onClick={() => handleChange("profilePicture", "")}
                className="text-rose-500 hover:underline font-semibold text-[11px] cursor-pointer"
              >
                Reset to default initials
              </button>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            4. IDENTITY & CREATOR DETAILS
        ══════════════════════════════════════════════════════════ */}
        <section className="rounded-2xl p-4 sm:p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
            <User size={15} className="text-blue-500" />
            <span>Profile Identity & Information</span>
          </h2>

          {/* Full Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                Full Display Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  maxLength={50}
                  placeholder="e.g. Tony Reduce"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                Your primary display name across posts and recommendations.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                Username / Handle <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-bold text-[var(--text-secondary)]">@</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ""))}
                  maxLength={30}
                  placeholder="tonyreduce"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm font-mono text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                fondpeace.com/profile/{formData.username || "username"}
              </p>
            </div>
          </div>

          {/* Tagline / Catchy Hook */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
              Creator Headline / Tagline
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                maxLength={80}
                placeholder="e.g. Visual Storyteller & Cinema Clips Curator 🎬"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="absolute right-3 top-3 text-[10px] font-mono text-[var(--text-secondary)]">
                {formData.tagline.length}/80
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Short punchy 1-line hook displayed directly under your name.
            </p>
          </div>

          {/* Category / Niche Selection */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
              Content Category / Niche
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                  {cat}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Helps FondPeace feature your profile in Suggested Creators and Topic searches.
            </p>
          </div>

          {/* Bio / About */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[var(--text-primary)]">
                About / Bio
              </label>
              <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                {formData.bio.length}/500
              </span>
            </div>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tell the community what kind of content you post, your background, or upload schedule..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-blue-500 transition-colors resize-y leading-relaxed"
            />
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Supports emojis and multiple paragraphs.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            5. LOCATION & WEBSITE LINK
        ══════════════════════════════════════════════════════════ */}
        <section className="rounded-2xl p-4 sm:p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
            <Globe size={15} className="text-blue-500" />
            <span>Website & Regional Location</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Website */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                Personal Website or Portfolio
              </label>
              <div className="relative flex items-center">
                <Globe size={15} className="absolute left-3.5 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://yourbrand.com or linktr.ee/..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                City / Country Location
              </label>
              <div className="relative flex items-center">
                <MapPin size={15} className="absolute left-3.5 text-rose-500" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="e.g. Mumbai, India / New York, USA"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            6. CONNECTED SOCIAL CHANNELS
        ══════════════════════════════════════════════════════════ */}
        <section className="rounded-2xl p-4 sm:p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
            <Sparkles size={15} className="text-blue-500" />
            <span>Connected Social Profiles</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] -mt-2 mb-3">
            Your connected links appear as clickable verified badges on your creator profile.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* YouTube */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                <Youtube size={14} className="text-red-500" />
                <span>YouTube Channel</span>
              </label>
              <input
                type="text"
                value={formData.socialLinks.youtube}
                onChange={(e) => handleSocialChange("youtube", e.target.value)}
                placeholder="Channel handle (@channel) or URL"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                <Instagram size={14} className="text-pink-500" />
                <span>Instagram Profile</span>
              </label>
              <input
                type="text"
                value={formData.socialLinks.instagram}
                onChange={(e) => handleSocialChange("instagram", e.target.value)}
                placeholder="Instagram username or URL"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {/* X / Twitter */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                <Twitter size={14} className="text-sky-500" />
                <span>X (Twitter) Handle</span>
              </label>
              <input
                type="text"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleSocialChange("twitter", e.target.value)}
                placeholder="Twitter handle or URL"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                <Linkedin size={14} className="text-blue-500" />
                <span>LinkedIn Profile</span>
              </label>
              <input
                type="text"
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                placeholder="LinkedIn URL"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* GitHub */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5 flex items-center gap-1.5">
                <Github size={14} className="text-[var(--text-primary)]" />
                <span>GitHub Profile</span>
              </label>
              <input
                type="text"
                value={formData.socialLinks.github}
                onChange={(e) => handleSocialChange("github", e.target.value)}
                placeholder="GitHub username or URL"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            7. BOTTOM ACTION BUTTONS
        ══════════════════════════════════════════════════════════ */}
        <div className="sticky bottom-4 z-30 p-3 sm:p-4 rounded-2xl bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] shadow-2xl flex items-center justify-between gap-4">
          <Link
            href={`/profile/${formData.username || initialUsername}`}
            onClick={() => playTap()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
