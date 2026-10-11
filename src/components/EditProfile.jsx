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
  AlertCircle,
  Palette,
  Link as LinkIcon,
  X,
  Upload,
  Image as ImageIcon
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

const PRESET_BANNERS = [
  { name: "Cosmic Nebula", url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80", bg: "from-purple-900 via-indigo-950 to-blue-900" },
  { name: "Cyber Neon", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=80", bg: "from-cyan-900 via-slate-950 to-fuchsia-900" },
  { name: "Sunset Horizon", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80", bg: "from-amber-700 via-rose-900 to-indigo-950" },
  { name: "Aurora Glow", url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&auto=format&fit=crop&q=80", bg: "from-emerald-900 via-teal-950 to-slate-900" },
  { name: "Minimalist Dark", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80", bg: "from-zinc-900 via-neutral-900 to-black" },
  { name: "Electric Violet", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1600&auto=format&fit=crop&q=80", bg: "from-violet-900 via-purple-950 to-slate-950" }
];

const PRESET_AVATARS = [
  { name: "Cyber Peace", url: "https://api.dicebear.com/7.x/bottts/svg?seed=FondPeace" },
  { name: "Aura Spark", url: "https://api.dicebear.com/7.x/identicon/svg?seed=AuraSpark&backgroundColor=0284c7" },
  { name: "Cosmic Pulse", url: "https://api.dicebear.com/7.x/identicon/svg?seed=CosmicPulse&backgroundColor=7c3aed" },
  { name: "Minimal Geometric", url: "https://api.dicebear.com/7.x/shapes/svg?seed=FondMinimal" },
  { name: "Neon Bot", url: "https://api.dicebear.com/7.x/bottts/svg?seed=NeonPeace" },
  { name: "Emerald Aura", url: "https://api.dicebear.com/7.x/identicon/svg?seed=EmeraldAura&backgroundColor=059669" }
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

  // Drag-and-drop & Rich Media Customization States
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [showBannerPresets, setShowBannerPresets] = useState(false);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const [urlModalType, setUrlModalType] = useState(null); // 'avatar' | 'cover' | null
  const [customUrlInput, setCustomUrlInput] = useState("");

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

      // 1. Check localStorage cache first so existing details appear instantly without blank flash
      let cachedData = null;
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(`fondpeace_profile_${(target || loggedUsername || "").toLowerCase()}`);
          if (raw) {
            cachedData = JSON.parse(raw);
            setFormData((prev) => ({ ...prev, ...cachedData }));
            setInitialData(cachedData);
          }
        } catch (_) {}
      }

      try {
        let profileUser = null;

        // Tier 0: Direct authenticated /user/me (Primary source of truth for logged-in user)
        try {
          const meRes = await axios.get(`${API_BASE}/user/me`, {
            headers: { "x-auth-token": token, Authorization: `Bearer ${token}` }
          });
          if (meRes.data?.success && meRes.data?.user) {
            profileUser = meRes.data.user;
            if (profileUser.username) {
              loggedUsername = profileUser.username;
              setCurrentSessionUser({ id: profileUser._id, username: profileUser.username });
            }
          }
        } catch (_) {}

        // Tier 1: Try authenticated endpoint /user/profile/:username
        if (!profileUser && target) {
          try {
            const res = await axios.get(`${API_BASE}/user/profile/${encodeURIComponent(target)}`, {
              headers: { "x-auth-token": token, Authorization: `Bearer ${token}` }
            });
            if (res.data?.Profile?.user) {
              profileUser = res.data.Profile.user;
            }
          } catch (_) {}
        }

        // Tier 2: Try authenticated endpoint by loggedUserId
        if (!profileUser && loggedUserId) {
          try {
            const res = await axios.get(`${API_BASE}/user/profile/${encodeURIComponent(loggedUserId)}`, {
              headers: { "x-auth-token": token, Authorization: `Bearer ${token}` }
            });
            if (res.data?.Profile?.user) {
              profileUser = res.data.Profile.user;
            }
          } catch (_) {}
        }

        // Tier 3: Try public endpoint /user/profile-public/:username
        if (!profileUser && target) {
          try {
            const res = await axios.get(`${API_BASE}/user/profile-public/${encodeURIComponent(target)}`);
            if (res.data?.Profile?.user) {
              profileUser = res.data.Profile.user;
            }
          } catch (_) {}
        }

        // Tier 4: Try public endpoint by loggedUserId
        if (!profileUser && loggedUserId) {
          try {
            const res = await axios.get(`${API_BASE}/user/profile-public/${encodeURIComponent(loggedUserId)}`);
            if (res.data?.Profile?.user) {
              profileUser = res.data.Profile.user;
            }
          } catch (_) {}
        }

        // Tier 5: Direct Mango Directory fallback (/user/mango/getall)
        // Resolves MongoDB case-sensitivity issues and always returns complete user document
        if (!profileUser) {
          try {
            const res = await axios.get(`${API_BASE}/user/mango/getall`);
            if (Array.isArray(res.data)) {
              const query = (target || loggedUsername || "").trim().toLowerCase();
              const found = res.data.find((u) => {
                const uName = (u.username || "").trim().toLowerCase();
                const uId = u._id ? String(u._id) : "";
                return (
                  uName === query ||
                  (loggedUserId && uId === String(loggedUserId)) ||
                  (loggedUsername && uName === loggedUsername.trim().toLowerCase())
                );
              });
              if (found) {
                profileUser = found;
              }
            }
          } catch (_) {}
        }

        // If user is accessing someone else's edit page, redirect them to their own edit page
        if (profileUser && loggedUsername && profileUser.username?.toLowerCase() !== loggedUsername.toLowerCase()) {
          // If profileUser._id matches loggedUserId, they just updated their handle, so do not redirect away
          if (!loggedUserId || String(profileUser._id) !== String(loggedUserId)) {
            toast.info(`Redirecting to your own profile settings (@${loggedUsername})...`);
            router.replace(`/edit/${loggedUsername}`);
            return;
          }
        }

        if (profileUser) {
          const userAvatar = profileUser?.profilePicture || profileUser?.profilePic || profileUser?.avatar || "";
          const resolvedPic = (userAvatar && userAvatar !== "/Fondpeace.jpg" && userAvatar.trim() !== "") ? userAvatar : (cachedData?.profilePicture || "");
          const resolvedCover = profileUser?.coverImage || cachedData?.coverImage || "";

          // Populate Form State with live data, falling back to cache if specific field was cached
          const loaded = {
            name: profileUser?.name || profileUser?.username || loggedUsername || "",
            username: profileUser?.username || loggedUsername || "",
            tagline: profileUser?.tagline || cachedData?.tagline || "",
            bio: (profileUser?.bio && profileUser.bio !== "Add About You") ? profileUser.bio : (cachedData?.bio || ""),
            category: profileUser?.category || cachedData?.category || "General",
            website: profileUser?.website || cachedData?.website || "",
            location: profileUser?.location || profileUser?.city || cachedData?.location || "",
            profilePicture: resolvedPic,
            coverImage: resolvedCover,
            socialLinks: {
              instagram: profileUser?.socialLinks?.instagram || cachedData?.socialLinks?.instagram || "",
              twitter: profileUser?.socialLinks?.twitter || cachedData?.socialLinks?.twitter || "",
              youtube: profileUser?.socialLinks?.youtube || cachedData?.socialLinks?.youtube || "",
              linkedin: profileUser?.socialLinks?.linkedin || cachedData?.socialLinks?.linkedin || "",
              github: profileUser?.socialLinks?.github || cachedData?.socialLinks?.github || ""
            }
          };

          setFormData(loaded);
          setInitialData(loaded);

          if (typeof window !== "undefined") {
            localStorage.setItem(
              `fondpeace_profile_${(profileUser.username || loggedUsername || "").toLowerCase()}`,
              JSON.stringify(loaded)
            );
          }
        } else if (cachedData) {
          setFormData(cachedData);
          setInitialData(cachedData);
        } else {
          // Fallback to basic session data
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
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading user profile for edit:", err);
        if (cachedData) {
          setFormData(cachedData);
          setInitialData(cachedData);
        }
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

  // Drag & Drop Handlers
  const handleAvatarDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAvatar(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleUploadImage(file, "avatar");
    }
  };

  const handleCoverDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleUploadImage(file, "cover");
    }
  };

  // Apply Direct Image URL
  const handleApplyUrl = (type) => {
    if (!customUrlInput.trim()) return;
    try {
      new URL(customUrlInput.trim());
    } catch {
      toast.error("Please enter a valid image URL starting with http:// or https://");
      return;
    }
    if (type === "avatar") {
      handleChange("profilePicture", customUrlInput.trim());
      toast.success("Profile photo updated!");
    } else {
      handleChange("coverImage", customUrlInput.trim());
      toast.success("Cover banner updated!");
    }
    playPop();
    setUrlModalType(null);
    setCustomUrlInput("");
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

      // Safeguard: Never overwrite saved images with empty strings if user didn't clear them
      const resolvedProfilePic = formData.profilePicture || initialData?.profilePicture || "";
      const resolvedCoverImg = formData.coverImage || initialData?.coverImage || "";

      const payload = {
        name: cleanName,
        username: cleanUsername,
        tagline: formData.tagline.trim(),
        bio: formData.bio.trim(),
        category: formData.category,
        website: formData.website.trim(),
        location: formData.location.trim(),
        profilePicture: resolvedProfilePic,
        coverImage: resolvedCoverImg,
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
      if (typeof window !== "undefined") {
        localStorage.setItem(`fondpeace_profile_${cleanUsername.toLowerCase()}`, JSON.stringify(payload));
        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);
        }
        // Notify other components (like navbar, profile header) of changes with full payload
        window.dispatchEvent(new CustomEvent("user_profile_updated", { detail: payload }));
      }

      setInitialData(payload);
      setFormData(payload);

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
              <Camera size={15} className="text-blue-500" />
              <span>Visual Branding & Aesthetics</span>
            </h2>
            <span className="text-[11px] text-[var(--text-secondary)] hidden sm:inline">
              Drag &amp; drop images directly onto banner or avatar
            </span>
          </div>

          {/* 1. Cover Banner Container (Standalone Overflow-Hidden, with Drag & Drop) */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingCover(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDraggingCover(false);
            }}
            onDrop={handleCoverDrop}
            className={`relative h-36 sm:h-52 w-full rounded-2xl overflow-hidden border transition-all duration-300 ${
              isDraggingCover
                ? "border-blue-500 ring-4 ring-blue-500/30 scale-[1.008]"
                : "border-[var(--border-subtle)]"
            } bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 group`}
          >
            {formData.coverImage ? (
              <img
                src={formData.coverImage}
                alt="Cover Banner"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-400 font-medium p-4 text-center">
                <UploadCloud size={28} className="text-slate-500 mb-1.5 opacity-60" />
                <span>Upload a widescreen banner (16:9 or 3:1)</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Drag &amp; drop banner image anywhere here</span>
              </div>
            )}

            {/* Dragging State Overlay */}
            {isDraggingCover && (
              <div className="absolute inset-0 bg-blue-600/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 animate-in fade-in">
                <UploadCloud size={36} className="animate-bounce mb-2" />
                <span className="text-sm font-black tracking-wide">Drop Widescreen Banner Here</span>
                <span className="text-xs opacity-90">16:9 or 3:1 recommended</span>
              </div>
            )}

            {/* Uploading Overlay */}
            {uploadingCover && (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-white z-20">
                <Loader2 size={28} className="animate-spin mb-1.5 text-blue-400" />
                <span className="text-xs font-bold">Uploading Banner...</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors pointer-events-none" />

            {/* Cover Banner Action Toolbar */}
            <div className="absolute top-3 right-3 flex items-center flex-wrap gap-1.5 z-10">
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
                title="Upload banner image"
              >
                {uploadingCover ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <UploadCloud size={13} />
                )}
                <span>{formData.coverImage ? "Change Cover" : "Add Cover"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowBannerPresets(!showBannerPresets);
                  setShowAvatarPresets(false);
                }}
                className="px-2.5 py-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-xs font-medium border border-white/20 transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-md"
                title="Choose from curated wallpapers"
              >
                <Palette size={13} className="text-purple-300" />
                <span className="hidden sm:inline">Presets</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUrlModalType("cover");
                  setCustomUrlInput(formData.coverImage || "");
                }}
                className="px-2.5 py-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-xs font-medium border border-white/20 transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-md"
                title="Paste image link"
              >
                <LinkIcon size={13} className="text-emerald-300" />
                <span className="hidden sm:inline">URL</span>
              </button>

              {formData.coverImage && (
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    handleChange("coverImage", "");
                    toast.success("Cover banner removed");
                  }}
                  className="p-1.5 rounded-full bg-black/70 hover:bg-rose-900/80 backdrop-blur-md text-white hover:text-rose-300 text-xs border border-white/20 transition-all active:scale-95 cursor-pointer shadow-md"
                  title="Remove cover banner"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Banner Presets Tray (Expandable) */}
          {showBannerPresets && (
            <div className="mt-3 p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Palette size={13} className="text-purple-400" />
                  Select Curated Banner Theme
                </span>
                <button
                  type="button"
                  onClick={() => setShowBannerPresets(false)}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_BANNERS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      playPop();
                      handleChange("coverImage", preset.url);
                      setShowBannerPresets(false);
                      toast.success(`Applied ${preset.name} banner!`);
                    }}
                    className="relative group/preset h-16 rounded-lg overflow-hidden border border-[var(--border-subtle)] hover:border-blue-500 transition-all active:scale-95 text-left"
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover/preset:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-1.5">
                      <span className="text-[10px] font-bold text-white truncate drop-shadow-xs">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. UNCLIPPED Overlapping Avatar & Action Row */}
          <div className="relative -mt-12 sm:-mt-16 px-2 sm:px-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-20">
            <div className="flex items-end gap-3 sm:gap-4">
              {/* Avatar Circle with Dropzone and Camera Badge */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingAvatar(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingAvatar(false);
                }}
                onDrop={handleAvatarDrop}
                className={`relative group/avatar cursor-pointer rounded-full transition-transform ${
                  isDraggingAvatar ? "scale-105" : ""
                }`}
              >
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full ring-4 ring-[var(--bg-canvas)] overflow-hidden bg-[var(--bg-surface)] shadow-2xl relative transition-all duration-300 ${
                    isDraggingAvatar ? "ring-4 ring-blue-500" : ""
                  }`}
                >
                  {formData.profilePicture ? (
                    <img
                      src={formData.profilePicture}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white font-black text-3xl sm:text-4xl select-none">
                      {userInitial}
                    </div>
                  )}

                  {/* Hover Overlay with Change Prompt */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200">
                    <Camera size={22} className="text-white mb-0.5" />
                    <span className="text-[10px] font-bold tracking-wide">Change</span>
                  </div>

                  {/* Dragging State Overlay */}
                  {isDraggingAvatar && (
                    <div className="absolute inset-0 bg-blue-600/85 backdrop-blur-xs flex flex-col items-center justify-center text-white text-center p-1 z-20">
                      <Upload size={22} className="animate-bounce mb-1" />
                      <span className="text-[10px] font-black leading-tight">Drop Photo</span>
                    </div>
                  )}

                  {/* Uploading Overlay */}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-white z-20">
                      <Loader2 size={24} className="animate-spin mb-1 text-blue-400" />
                      <span className="text-[10px] font-bold">Uploading...</span>
                    </div>
                  )}
                </div>

                {/* Always-Visible Camera Badge */}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    avatarInputRef.current?.click();
                  }}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 p-2 sm:p-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl ring-3 ring-[var(--bg-canvas)] transition-all transform hover:scale-110 active:scale-95 cursor-pointer z-30"
                  title="Upload profile photo"
                >
                  <Camera size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Avatar Action Buttons */}
              <div className="flex flex-col gap-1.5 pb-1">
                <div className="flex items-center flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Upload size={12} className="text-blue-500" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAvatarPresets(!showAvatarPresets);
                      setShowBannerPresets(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium transition flex items-center gap-1 active:scale-95 cursor-pointer shadow-xs"
                    title="Choose from preset avatars"
                  >
                    <Palette size={12} className="text-purple-400" />
                    <span>Presets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUrlModalType("avatar");
                      setCustomUrlInput(formData.profilePicture || "");
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium transition flex items-center gap-1 active:scale-95 cursor-pointer shadow-xs"
                    title="Paste direct photo link"
                  >
                    <LinkIcon size={12} className="text-emerald-400" />
                    <span>URL</span>
                  </button>

                  {formData.profilePicture && (
                    <button
                      type="button"
                      onClick={() => {
                        playPop();
                        handleChange("profilePicture", "");
                        toast.success("Profile photo reset to default monogram");
                      }}
                      className="p-1.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-rose-500/10 text-rose-500 border border-[var(--border-subtle)] text-xs transition active:scale-95 cursor-pointer"
                      title="Reset to default initials monogram"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                  Drag &amp; drop square photo or browse (JPG, PNG, WebP)
                </p>
              </div>
            </div>
          </div>

          {/* Avatar Presets Tray (Expandable) */}
          {showAvatarPresets && (
            <div className="mt-4 p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Palette size={13} className="text-purple-400" />
                  Select Avatar Style
                </span>
                <button
                  type="button"
                  onClick={() => setShowAvatarPresets(false)}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      playPop();
                      handleChange("profilePicture", preset.url);
                      setShowAvatarPresets(false);
                      toast.success(`Selected ${preset.name} avatar!`);
                    }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-blue-500 transition-all active:scale-95 group/av"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 ring-2 ring-[var(--border-subtle)] group-hover/av:ring-blue-500 transition-all">
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover/av:text-[var(--text-primary)] truncate max-w-[70px]">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Direct Image URL Input Modal / Tray */}
          {urlModalType && (
            <div className="mt-4 p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-blue-500/30 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
                  <LinkIcon size={13} />
                  Paste Direct Image URL for {urlModalType === "avatar" ? "Profile Photo" : "Cover Banner"}
                </span>
                <button
                  type="button"
                  onClick={() => setUrlModalType(null)}
                  className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-blue-500 text-xs text-[var(--text-primary)] outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyUrl(urlModalType);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleApplyUrl(urlModalType)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
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
