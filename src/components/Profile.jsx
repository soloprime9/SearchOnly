'use client';

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Sparkles, 
  Youtube, 
  Instagram, 
  Twitter, 
  Globe, 
  Eye, 
  Film, 
  Grid, 
  ExternalLink, 
  UserX, 
  Compass, 
  ArrowLeft, 
  Share2, 
  Edit3, 
  Heart, 
  MessageCircle, 
  Plus,
  Play,
  Camera,
  ArrowUpRight
} from "lucide-react";
import { playPop, playTap } from "@/utils/soundEffects";
import { API_BASE } from "@/utils/apiConfig";
import { useThemeBackground } from "@/context/ThemeBackgroundContext";
import { toast } from "@/utils/toast";

/**
 * Resolves post visuals, handling:
 * 1. Direct video files (.mp4)
 * 2. Uploaded image media / thumbnails
 * 3. YouTube link previews & auto-extracted YouTube video thumbnails
 * 4. Cleaning out raw URL strings from titles
 */
const resolvePostVisuals = (post) => {
  if (!post) {
    return {
      isDirectVideo: false,
      isVideo: false,
      ytVideoId: null,
      displayImage: null,
      cleanTitle: "Post",
      siteName: "",
    };
  }

  const isDirectVideo = Boolean(
    (post.media && (post.media.endsWith(".mp4") || post.media.includes("/videos/"))) ||
    (post.mediaType && post.mediaType.startsWith("video"))
  );

  // Check for YouTube link in linkPreview.url, title, or media
  const combinedText = `${post.linkPreview?.url || ""} ${post.title || ""} ${post.media || ""}`;
  const ytMatch = combinedText.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  const ytVideoId = ytMatch ? ytMatch[1] : null;

  // Resolve thumbnail/preview image
  let displayImage = null;
  if (!isDirectVideo) {
    if (post.media && !post.media.endsWith(".mp4")) {
      displayImage = post.media;
    } else if (post.thumbnail) {
      displayImage = post.thumbnail;
    } else if (post.linkPreview?.image) {
      displayImage = post.linkPreview.image;
    } else if (ytVideoId) {
      displayImage = `https://i.ytimg.com/vi/${ytVideoId}/hqdefault.jpg`;
    }
  }

  // Resolve clean title (remove raw URL strings from title)
  let rawTitle = post.linkPreview?.title || post.title || post.caption || "Community Post";
  let cleanTitle = String(rawTitle).replace(/https?:\/\/[^\s]+/g, "").trim();
  if (!cleanTitle && post.linkPreview?.title) {
    cleanTitle = post.linkPreview.title;
  }
  if (!cleanTitle) {
    cleanTitle = ytVideoId ? "YouTube Video" : "Shared Post";
  }

  const isVideo = isDirectVideo || Boolean(ytVideoId) || post.linkPreview?.siteName?.toLowerCase() === "youtube";
  const siteName = post.linkPreview?.siteName || (ytVideoId ? "YouTube" : "");

  return {
    isDirectVideo,
    isVideo,
    ytVideoId,
    displayImage,
    cleanTitle,
    siteName,
  };
};

const Profile = ({ username: propUsername, initialProfile = null }) => {
  const { bgTheme } = useThemeBackground();
  const [profile, setProfile] = useState(initialProfile || null);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(!initialProfile);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState("all"); // "all" | "shorts" | "photos" | "links" | "discussions" | "liked"
  const [fetchedLikedPosts, setFetchedLikedPosts] = useState(null);
  const [fetchedDiscussionPosts, setFetchedDiscussionPosts] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [authSession, setAuthSession] = useState({
    userId: null,
    username: null,
  });

  // Decode and check token on client mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (!token) return;

    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        localStorage.removeItem("token");
        return;
      }
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return;
      }

      const uid = decoded.UserId || decoded.userId || decoded._id || decoded.id || null;
      const uname = decoded.username || null;
      setAuthSession({ userId: uid, username: uname });
    } catch {
      localStorage.removeItem("token");
    }
  }, []);

  // Fetch or revalidate profile
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      const pathParts = typeof window !== 'undefined' ? window.location.pathname.split("/").filter(Boolean) : [];
      const targetName = propUsername || pathParts[pathParts.length - 1] || "";
      if (!targetName) return;

      const cleanName = decodeURIComponent(targetName).replace(/^@/, "").trim();
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      let loggedUserId = null;
      let loggedUsername = null;

      if (token) {
        try {
          const decoded = jwt.decode(token);
          loggedUserId = decoded?.UserId || decoded?.userId || decoded?._id || decoded?.id;
          loggedUsername = decoded?.username;
        } catch (_) {}
      }

      // Immediately render initialProfile if available so UI appears instantly without blank flash
      if (initialProfile?.user && (initialProfile.user.username?.toLowerCase() === cleanName.toLowerCase() || initialProfile.user._id === cleanName)) {
        if (!profile) setProfile(initialProfile);
        if (loggedUserId && Array.isArray(initialProfile.user.Followers)) {
          setIsFollowing(initialProfile.user.Followers.some(id => String(id) === String(loggedUserId)));
        }
      }

      try {
        setLoading(true);
        let resolvedProfile = null;

        // Tier 1: Try authenticated endpoint if logged in
        if (token) {
          try {
            const res = await axios.get(`${API_BASE}/user/profile/${encodeURIComponent(cleanName)}`, {
              headers: { "x-auth-token": token },
            });
            if (res.data?.Profile?.user) {
              resolvedProfile = res.data.Profile;
            }
          } catch (_) {}
        }

        // Tier 2: Try public endpoint
        if (!resolvedProfile) {
          try {
            const res = await axios.get(`${API_BASE}/user/profile-public/${encodeURIComponent(cleanName)}`);
            if (res.data?.Profile?.user) {
              resolvedProfile = res.data.Profile;
            }
          } catch (_) {}
        }

        // Tier 3: Resilient mango directory + posts fallback (resolves uppercase usernames like 'Tonyreduce')
        if (!resolvedProfile) {
          try {
            const [usersRes, postsRes] = await Promise.all([
              axios.get(`${API_BASE}/user/mango/getall`),
              axios.get(`${API_BASE}/post/mango/getall`).catch(() => ({ data: [] })),
            ]);

            const users = usersRes.data;
            const targetUser = Array.isArray(users)
              ? users.find((u) => {
                  const uName = u.username ? u.username.trim().toLowerCase() : "";
                  const query = cleanName.toLowerCase();
                  return uName === query || u._id === cleanName;
                })
              : null;

            if (targetUser) {
              const allPosts = Array.isArray(postsRes.data) ? postsRes.data : [];
              const userPosts = allPosts.filter((p) => {
                const pUid = typeof p.userId === "object" ? p.userId?._id : p.userId;
                const pUname = typeof p.userId === "object" ? p.userId?.username : null;
                return (
                  (pUid && String(pUid) === String(targetUser._id)) ||
                  (pUname && pUname.trim().toLowerCase() === targetUser.username?.trim().toLowerCase())
                );
              });
              userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

              resolvedProfile = {
                user: targetUser,
                posts: userPosts,
              };
            }
          } catch (_) {}
        }

        if (!isMounted) return;

        if (resolvedProfile?.user) {
          if (Array.isArray(resolvedProfile.posts)) {
            resolvedProfile.posts = [...resolvedProfile.posts].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
          }
          if (Array.isArray(resolvedProfile.likedPosts)) {
            resolvedProfile.likedPosts = [...resolvedProfile.likedPosts].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
          }
          if (Array.isArray(resolvedProfile.discussionPosts)) {
            resolvedProfile.discussionPosts = [...resolvedProfile.discussionPosts].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
          }

          setProfile(resolvedProfile);
          setError(null);

          if (loggedUserId && Array.isArray(resolvedProfile.user?.Followers)) {
            setIsFollowing(resolvedProfile.user.Followers.some(id => String(id) === String(loggedUserId)));
          }
        } else {
          setError({ notFound: true, username: cleanName });
        }
      } catch (err) {
        if (!isMounted) return;
        setError({ notFound: true, username: cleanName, message: err.message });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [propUsername, initialProfile]);

  // Live listener: sync updated profile data when saved from EditProfile
  useEffect(() => {
    const handleProfileUpdated = (e) => {
      const updated = e.detail;
      if (updated && profile?.user) {
        setProfile((prev) => prev ? {
          ...prev,
          user: {
            ...prev.user,
            ...updated
          }
        } : prev);
      }
    };
    window.addEventListener("user_profile_updated", handleProfileUpdated);
    return () => window.removeEventListener("user_profile_updated", handleProfileUpdated);
  }, [profile]);

  // Lazy fetch for liked and discussion posts on tab selection if not pre-populated
  useEffect(() => {
    if (!profile?.user?.username) return;
    const clean = profile.user.username;

    if (activeMediaTab === "liked" && fetchedLikedPosts === null && (!profile.likedPosts || profile.likedPosts.length === 0)) {
      setTabLoading(true);
      axios.get(`${API_BASE}/user/profile-public/${encodeURIComponent(clean)}/liked`)
        .then(res => {
          if (Array.isArray(res.data?.posts)) {
            setFetchedLikedPosts(res.data.posts);
          } else {
            setFetchedLikedPosts([]);
          }
        })
        .catch(() => setFetchedLikedPosts([]))
        .finally(() => setTabLoading(false));
    }

    if (activeMediaTab === "discussions" && fetchedDiscussionPosts === null && (!profile.discussionPosts || profile.discussionPosts.length === 0)) {
      setTabLoading(true);
      axios.get(`${API_BASE}/user/profile-public/${encodeURIComponent(clean)}/discussions`)
        .then(res => {
          if (Array.isArray(res.data?.posts)) {
            setFetchedDiscussionPosts(res.data.posts);
          } else {
            setFetchedDiscussionPosts([]);
          }
        })
        .catch(() => setFetchedDiscussionPosts([]))
        .finally(() => setTabLoading(false));
    }
  }, [activeMediaTab, profile?.user?.username, profile?.likedPosts, profile?.discussionPosts, fetchedLikedPosts, fetchedDiscussionPosts]);

  // Handle follow / unfollow
  const handleFollow = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (!token) return alert("Please log in to follow creators.");

    let loggedUserId = null;
    try {
      const decoded = jwt.decode(token);
      loggedUserId = decoded?.UserId || decoded?.userId || decoded?._id || decoded?.id;
    } catch (_) {}

    try {
      setFollowLoading(true);
      playPop();
      await axios.post(
        `${API_BASE}/user/follow/${profile.user._id}`,
        {},
        { headers: { "x-auth-token": token } }
      );

      setIsFollowing(!isFollowing);

      setProfile((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          Followers: isFollowing
            ? (prev.user.Followers || []).filter((id) => String(id) !== String(loggedUserId))
            : [...(prev.user.Followers || []), loggedUserId],
        },
      }));
    } catch (_) {
      toast.error("Error updating follow state");
    } finally {
      setFollowLoading(false);
    }
  };

  // Share profile
  const handleShare = async () => {
    playTap();
    const url = typeof window !== 'undefined' ? window.location.href : `https://fondpeace.com/profile/${profile?.user?.username}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.user?.name || profile?.user?.username} on FondPeace`,
          text: `Check out ${profile?.user?.name || profile?.user?.username}'s profile on FondPeace!`,
          url,
        });
        return;
      } catch (_) {}
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied! 📋");
      } catch (_) {
        toast.info("Could not copy link");
      }
    }
  };

  // 1. Resolve Owner state reliably (compares token username & userId with creator profile)
  const isOwner = useMemo(() => {
    const user = profile?.user;
    if (!user) return false;

    const myName = (authSession.username || "").trim().toLowerCase();
    const targetName = (user.username || "").trim().toLowerCase();
    if (myName && targetName && myName === targetName) return true;

    const myId = String(authSession.userId || "");
    const targetId = String(user._id || "");
    if (myId && targetId && myId === targetId) return true;

    if (Boolean(profile?.OwnerId)) return true;

    return false;
  }, [profile, authSession]);

  // Calculate total likes and media categories (integrates video files, photos, links & discussions)
  const { totalLikes, videoPosts, photoPosts, linkPosts, derivedDiscussionPosts } = useMemo(() => {
    const posts = profile?.posts || [];
    let likes = 0;
    const vids = [];
    const photos = [];
    const links = [];
    const discs = [];

    posts.forEach((p) => {
      if (Array.isArray(p.likes)) likes += p.likes.length;
      const { isVideo, ytVideoId } = resolvePostVisuals(p);
      const isLink = Boolean(p.linkPreview?.url || ytVideoId || p.mediaType === "link");
      const isDiscussion = Boolean(
        p.poll?.question ||
        p.mediaType === "discussion" ||
        p.mediaType === "text" ||
        (!p.media && !p.linkPreview) ||
        (Array.isArray(p.comments) && p.comments.length > 0)
      );

      if (isVideo) vids.push(p);
      if (isLink) links.push(p);
      if (isDiscussion) discs.push(p);
      if (!isVideo && !isLink && (p.media || p.thumbnail || p.mediaType === "image" || p.mediaType === "photo")) {
        photos.push(p);
      }
    });

    return { totalLikes: likes, videoPosts: vids, photoPosts: photos, linkPosts: links, derivedDiscussionPosts: discs };
  }, [profile?.posts]);

  // Effective liked posts list
  const effectiveLikedPosts = useMemo(() => {
    if (Array.isArray(profile?.likedPosts) && profile.likedPosts.length > 0) return profile.likedPosts;
    if (Array.isArray(fetchedLikedPosts)) return fetchedLikedPosts;
    return [];
  }, [profile?.likedPosts, fetchedLikedPosts]);

  // Effective discussion posts list
  const effectiveDiscussionPosts = useMemo(() => {
    if (Array.isArray(profile?.discussionPosts) && profile.discussionPosts.length > 0) return profile.discussionPosts;
    if (Array.isArray(fetchedDiscussionPosts) && fetchedDiscussionPosts.length > 0) return fetchedDiscussionPosts;
    return derivedDiscussionPosts;
  }, [profile?.discussionPosts, fetchedDiscussionPosts, derivedDiscussionPosts]);

  // Filter posts based on active tab
  const filteredPosts = useMemo(() => {
    const posts = profile?.posts || [];
    if (activeMediaTab === "shorts") return videoPosts;
    if (activeMediaTab === "photos") return photoPosts;
    if (activeMediaTab === "links") return linkPosts;
    if (activeMediaTab === "discussions") return effectiveDiscussionPosts;
    if (activeMediaTab === "liked") return effectiveLikedPosts;
    return posts;
  }, [activeMediaTab, profile?.posts, videoPosts, photoPosts, linkPosts, effectiveDiscussionPosts, effectiveLikedPosts]);

  // 1. ERROR (Creator not found) STATE
  if (error) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-4 shadow-sm">
          <UserX size={30} className="text-[var(--text-secondary)] opacity-60" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black mb-2 tracking-tight text-[var(--text-primary)]">
          Creator Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mb-6 leading-relaxed">
          The creator profile <span className="font-bold text-[var(--text-primary)]">@{error.username || "user"}</span> doesn&apos;t exist or may have changed their handle.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={() => playTap()}
            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>Back to Feed</span>
          </Link>
          <Link
            href="/search"
            onClick={() => playTap()}
            className="px-5 py-2 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-xs transition-all flex items-center gap-2"
          >
            <Compass size={14} />
            <span>Explore</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. LOADING STATE
  if (loading || !profile) {
    return (
      <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide">
          Loading creator...
        </span>
      </div>
    );
  }

  const { user, posts = [] } = profile;
  const userPhoto = user.profilePicture || user.profilePic || user.avatar || "";
  const isDefaultAvatar = !userPhoto || userPhoto === "/Fondpeace.jpg" || userPhoto.trim() === "";
  const rawBio = user.bio ? user.bio.trim() : "";
  const isDefaultBio = !rawBio || rawBio === "Add About You";
  const userInitial = (user.username?.[0] || user.name?.[0] || "C").toUpperCase();
  const displayName = user.name || user.username;

  return (
    <div className="w-full max-w-3xl mx-auto pb-32 transition-colors duration-200">
      
      {/* ══════════════════════════════════════════════════════════
          1. COMPACT SLEEK COVER (Slim & Panoramic)
      ══════════════════════════════════════════════════════════ */}
      {user.coverImage ? (
        <div className="relative h-28 sm:h-36 md:h-44 w-full rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-xs group mb-3">
          <img
            src={user.coverImage}
            alt="Cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Nav Buttons on Cover */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <Link
              href="/"
              onClick={() => playTap()}
              className="px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 transition-all active:scale-95 flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>Feed</span>
            </Link>
            <div className="flex items-center gap-1.5">
              {isOwner && (
                <Link
                  href={`/edit/${user.username}`}
                  onClick={() => playTap()}
                  className="px-2.5 py-1 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 transition-all active:scale-95 flex items-center gap-1"
                >
                  <Camera size={12} />
                  <span>Cover</span>
                </Link>
              )}
              <button
                onClick={handleShare}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-[11px] border border-white/20 transition-all active:scale-95"
                title="Share profile"
              >
                <Share2 size={13} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Slim Minimalist Top Bar when no cover */
        <div className="flex items-center justify-between py-2 px-1 mb-2 border-b border-[var(--border-subtle)]">
          <Link
            href="/"
            onClick={() => playTap()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            <ArrowLeft size={14} />
            <span>Feed</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[var(--text-secondary)] font-medium">
              @{user.username}
            </span>
            {isOwner && (
              <Link
                href={`/edit/${user.username}`}
                onClick={() => playTap()}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition"
              >
                <Edit3 size={11} />
                <span>Edit</span>
              </Link>
            )}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
              title="Share profile"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          2. CREATOR PROFILE HEADER (Instagram / Threads Style)
      ══════════════════════════════════════════════════════════ */}
      <div className="px-1 sm:px-2 pt-1 pb-4">
        
        {/* Top Profile Row: Avatar + Stats / Actions */}
        <div className="flex items-start justify-between gap-4 sm:gap-6">
          
          {/* Avatar (Left) */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full ring-2 ring-[var(--border-subtle)] p-0.5 overflow-hidden bg-[var(--bg-surface)] shadow-sm">
              {!isDefaultAvatar ? (
                <img
                  src={userPhoto}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.username || "creator")}`;
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white font-black text-2xl sm:text-3xl shadow-inner select-none">
                  {userInitial}
                </div>
              )}
            </div>

            {/* Verified Creator Shield Badge */}
            {user.isVerified && (
              <div 
                className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full text-white shadow-md ring-2 ring-[var(--bg-canvas)]" 
                title="Verified Creator 💎"
              >
                <ShieldCheck size={14} />
              </div>
            )}
          </div>

          {/* Right Header: Desktop stats & Action Buttons */}
          <div className="flex-1 min-w-0 pt-1">
            
            {/* Desktop Row: Name, Handle, Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
                    {displayName}
                  </h1>
                  {user.isVerified && (
                    <ShieldCheck size={18} className="text-blue-500 fill-blue-500/20 shrink-0" />
                  )}
                  {user.category && user.category !== "General" && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full">
                      {user.category}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5">
                  @{user.username}
                </p>
              </div>

              {/* Action Buttons (Desktop inline) */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                {isOwner ? (
                  <>
                    <Link
                      href={`/edit/${user.username}`}
                      onClick={() => playTap()}
                      className="px-4 py-1.5 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-bold border border-[var(--border-subtle)] transition active:scale-95 shadow-xs flex items-center gap-1.5"
                    >
                      <Edit3 size={13} />
                      <span>Edit Profile</span>
                    </Link>
                    <Link
                      href="/upload"
                      onClick={() => playTap()}
                      className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition active:scale-95 shadow-sm shadow-blue-500/25 flex items-center gap-1"
                    >
                      <Plus size={14} />
                      <span>Upload</span>
                    </Link>
                    <button
                      onClick={handleShare}
                      className="p-1.5 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                      title="Share Profile"
                    >
                      <Share2 size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`px-5 py-1.5 rounded-full text-xs font-bold transition active:scale-95 shadow-xs cursor-pointer ${
                        isFollowing
                          ? "bg-[var(--bg-surface)] hover:bg-rose-950/20 text-[var(--text-primary)] hover:text-rose-400 border border-[var(--border-subtle)] hover:border-rose-800/40"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                      }`}
                    >
                      {followLoading ? "..." : isFollowing ? "✓ Following" : "+ Follow"}
                    </button>
                    <Link
                      href={`/messages?userId=${user._id}&name=${encodeURIComponent(user.username || user.name || "")}`}
                      onClick={() => playTap()}
                      className="px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-bold transition active:scale-95 shadow-xs flex items-center gap-1.5"
                      title="Send Encrypted Message"
                    >
                      <MessageCircle size={13} className="text-blue-500" />
                      <span>Message</span>
                    </Link>
                    <button
                      onClick={handleShare}
                      className="p-1.5 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                      title="Share Profile"
                    >
                      <Share2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Desktop Inline Stats Row */}
            <div className="hidden sm:flex items-center gap-6 mt-3 text-xs sm:text-sm">
              <span className="text-[var(--text-secondary)]">
                <strong className="font-extrabold text-[var(--text-primary)] mr-1">{posts.length}</strong>
                posts
              </span>
              <span className="text-[var(--text-secondary)]">
                <strong className="font-extrabold text-[var(--text-primary)] mr-1">{user.Followers?.length || 0}</strong>
                followers
              </span>
              <span className="text-[var(--text-secondary)]">
                <strong className="font-extrabold text-[var(--text-primary)] mr-1">{user.Followings?.length || 0}</strong>
                following
              </span>
              <span className="text-[var(--text-secondary)]">
                <strong className="font-extrabold text-rose-500 mr-1">{totalLikes}</strong>
                likes
              </span>
            </div>

          </div>
        </div>

        {/* Mobile Stats Row (Instagram Style: 3 Columns) */}
        <div className="flex sm:hidden items-center justify-around py-3 mt-3 border-y border-[var(--border-subtle)] text-center">
          <div>
            <p className="text-sm font-black text-[var(--text-primary)]">{posts.length}</p>
            <span className="text-[10px] font-medium text-[var(--text-secondary)]">Posts</span>
          </div>
          <div>
            <p className="text-sm font-black text-[var(--text-primary)]">{user.Followers?.length || 0}</p>
            <span className="text-[10px] font-medium text-[var(--text-secondary)]">Followers</span>
          </div>
          <div>
            <p className="text-sm font-black text-[var(--text-primary)]">{user.Followings?.length || 0}</p>
            <span className="text-[10px] font-medium text-[var(--text-secondary)]">Following</span>
          </div>
          <div>
            <p className="text-sm font-black text-rose-500">{totalLikes}</p>
            <span className="text-[10px] font-medium text-[var(--text-secondary)]">Likes</span>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-3 text-xs sm:text-sm max-w-xl">
          {!isDefaultBio ? (
            <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap font-normal">
              {rawBio}
            </p>
          ) : isOwner ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-500">
              <span>Introduce yourself to your community</span>
              <Link href={`/edit/${user.username}`} className="underline font-bold hover:text-blue-400">
                Add Bio
              </Link>
            </div>
          ) : (
            <p className="text-[var(--text-secondary)] italic">
              Creator on FondPeace.
            </p>
          )}

          {/* Website Link */}
          {user.website && (
            <a
              href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:underline mt-1.5"
            >
              <Globe size={12} />
              <span>{user.website.replace(/^https?:\/\//, "")}</span>
              <ExternalLink size={10} className="opacity-70" />
            </a>
          )}

          {/* Social Links Chips */}
          {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {user.socialLinks.instagram && (
                <a
                  href={user.socialLinks.instagram.startsWith("http") ? user.socialLinks.instagram : `https://instagram.com/${user.socialLinks.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[11px] font-semibold text-pink-500 flex items-center gap-1"
                >
                  <Instagram size={11} />
                  <span>Instagram</span>
                </a>
              )}
              {user.socialLinks.twitter && (
                <a
                  href={user.socialLinks.twitter.startsWith("http") ? user.socialLinks.twitter : `https://x.com/${user.socialLinks.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[11px] font-semibold text-sky-500 flex items-center gap-1"
                >
                  <Twitter size={11} />
                  <span>X</span>
                </a>
              )}
              {user.socialLinks.youtube && (
                <a
                  href={user.socialLinks.youtube.startsWith("http") ? user.socialLinks.youtube : `https://youtube.com/${user.socialLinks.youtube.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[11px] font-semibold text-red-500 flex items-center gap-1"
                >
                  <Youtube size={11} />
                  <span>YouTube</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Mobile Action Buttons (Full-Width Bottom Bar) */}
        <div className="flex sm:hidden items-center gap-2 mt-3.5">
          {isOwner ? (
            <>
              <Link
                href={`/edit/${user.username}`}
                onClick={() => playTap()}
                className="flex-1 py-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-bold border border-[var(--border-subtle)] text-center shadow-xs flex items-center justify-center gap-1.5"
              >
                <Edit3 size={13} />
                <span>Edit Profile</span>
              </Link>
              <Link
                href="/upload"
                onClick={() => playTap()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold text-center shadow-sm flex items-center justify-center gap-1"
              >
                <Plus size={14} />
                <span>Upload</span>
              </Link>
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                title="Share"
              >
                <Share2 size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-xs cursor-pointer ${
                  isFollowing
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                    : "bg-blue-600 text-white shadow-blue-500/25"
                }`}
              >
                {followLoading ? "..." : isFollowing ? "✓ Following" : "+ Follow"}
              </button>
              <Link
                href={`/messages?userId=${user._id}&name=${encodeURIComponent(user.username || user.name || "")}`}
                onClick={() => playTap()}
                className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1.5 shadow-xs"
                title="Send Encrypted Message"
              >
                <MessageCircle size={14} className="text-blue-500" />
                <span>Message</span>
              </Link>
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                title="Share"
              >
                <Share2 size={15} />
              </button>
            </>
          )}
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          3. MODERN MINIMAL TABS (Posts, Shorts, Photos, Links, Discussions, Liked)
      ══════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-start sm:justify-around border-b border-[var(--border-subtle)] mt-2 overflow-x-auto no-scrollbar scroll-smooth gap-1 sm:gap-2 px-1">
        <button
          onClick={() => {
            playTap();
            setActiveMediaTab("all");
          }}
          className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer relative shrink-0 ${
            activeMediaTab === "all"
              ? "text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Grid size={15} />
          <span>Posts ({posts.length})</span>
          {activeMediaTab === "all" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)] rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            playTap();
            setActiveMediaTab("shorts");
          }}
          className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer relative shrink-0 ${
            activeMediaTab === "shorts"
              ? "text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Film size={15} />
          <span>Shorts ({videoPosts.length})</span>
          {activeMediaTab === "shorts" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)] rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            playTap();
            setActiveMediaTab("photos");
          }}
          className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer relative shrink-0 ${
            activeMediaTab === "photos"
              ? "text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Sparkles size={15} />
          <span>Photos ({photoPosts.length})</span>
          {activeMediaTab === "photos" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)] rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            playTap();
            setActiveMediaTab("links");
          }}
          className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer relative shrink-0 ${
            activeMediaTab === "links"
              ? "text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Globe size={15} />
          <span>Links ({linkPosts.length})</span>
          {activeMediaTab === "links" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)] rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            playTap();
            setActiveMediaTab("discussions");
          }}
          className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer relative shrink-0 ${
            activeMediaTab === "discussions"
              ? "text-[var(--text-primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <MessageCircle size={15} />
          <span>Discussions ({effectiveDiscussionPosts.length})</span>
          {activeMediaTab === "discussions" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)] rounded-full" />
          )}
        </button>

        <button
          onClick={() => {
            playTap();
            setActiveMediaTab("liked");
          }}
          className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer relative shrink-0 ${
            activeMediaTab === "liked"
              ? "text-rose-500"
              : "text-[var(--text-secondary)] hover:text-rose-400"
          }`}
        >
          <Heart size={15} className={activeMediaTab === "liked" ? "fill-rose-500" : ""} />
          <span>Liked ({effectiveLikedPosts.length})</span>
          {activeMediaTab === "liked" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          4. POSTS GALLERY GRID (Rich Link Previews & Media Cards)
      ══════════════════════════════════════════════════════════ */}
      <div className="mt-3">
        {tabLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[var(--text-secondary)] font-medium">Loading posts...</span>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 md:gap-3">
            {filteredPosts.map((post) => {
              const { isDirectVideo, isVideo, ytVideoId, displayImage, cleanTitle, siteName } = resolvePostVisuals(post);
              const isTargetShort = Boolean(isDirectVideo || isVideo || post.mediaType === "video");
              const targetHref = isTargetShort ? `/short/${post._id}` : `/post/${post._id}`;

              return (
                <Link
                  key={post._id}
                  href={targetHref}
                  onClick={() => playTap()}
                  className="group block rounded-md sm:rounded-xl overflow-hidden bg-[var(--bg-subtle)] relative aspect-[4/5] sm:aspect-[4/5] shadow-2xs hover:shadow-xl hover:ring-2 hover:ring-blue-500/50 transition-all duration-300 cursor-pointer"
                  title={`Click to open ${isTargetShort ? "Short" : "Post"}: ${cleanTitle}`}
                >
                  {/* Visual Render: Direct Video vs Image / Link Thumbnail vs Discussion Card */}
                  {isDirectVideo ? (
                    <div className="w-full h-full relative bg-black">
                      <video
                        src={post.media}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      {/* Top Left Badge */}
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold flex items-center gap-1 border border-white/10 shadow-xs">
                        <Film size={10} className="text-rose-400" />
                        <span>Short</span>
                      </div>
                      {/* Top Right "Watch" Affordance */}
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-blue-600/90 text-white text-[9px] sm:text-[10px] font-bold flex items-center gap-0.5 shadow-xs">
                        <span>Watch</span>
                        <ArrowUpRight size={10} />
                      </div>
                    </div>
                  ) : displayImage ? (
                    <div className="w-full h-full relative overflow-hidden bg-black">
                      <img
                        src={displayImage}
                        alt={cleanTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      {/* Top Left Badge: Video / YouTube vs Link vs Photo */}
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold flex items-center gap-1 border border-white/10 shadow-xs">
                        {isVideo ? (
                          <>
                            <Play size={9} className="fill-red-500 text-red-500" />
                            <span>{siteName || "Video"}</span>
                          </>
                        ) : post.linkPreview ? (
                          <>
                            <Globe size={9} className="text-blue-400" />
                            <span>{siteName || "Link"}</span>
                          </>
                        ) : (
                          <>
                            <Camera size={9} className="text-emerald-400" />
                            <span>Photo</span>
                          </>
                        )}
                      </div>
                      {/* Top Right "Open" Affordance */}
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 group-hover:bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold flex items-center gap-0.5 transition-colors shadow-xs">
                        <span>{isTargetShort ? "Watch" : "Open"}</span>
                        <ArrowUpRight size={10} />
                      </div>
                    </div>
                  ) : (
                    // Typographic Card for discussions without media
                    <div className="w-full h-full p-2.5 sm:p-4 flex flex-col justify-between bg-gradient-to-br from-blue-600/10 via-[var(--bg-surface)] to-indigo-600/10 border border-[var(--border-subtle)] relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-500 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider">
                          {post.poll ? "Poll" : "Discussion"}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-blue-500 flex items-center gap-0.5">
                          <span>Read</span>
                          <ArrowUpRight size={10} />
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs font-bold text-[var(--text-primary)] line-clamp-3 sm:line-clamp-4 leading-snug my-1">
                        {cleanTitle}
                      </p>
                      <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-[var(--text-secondary)] font-medium">
                        <span>{post.comments?.length || 0} comments</span>
                        <span>{post.likes?.length || 0} likes</span>
                      </div>
                    </div>
                  )}

                  {/* Dark gradient overlay on hover (Desktop) */}
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 sm:p-3 flex flex-col justify-between pointer-events-none z-10">
                    <p className="text-white text-[11px] sm:text-xs font-bold line-clamp-2 drop-shadow-md">
                      {cleanTitle}
                    </p>
                    <div>
                      <div className="flex items-center justify-between text-white text-[10px] sm:text-[11px] font-bold mb-2">
                        <span className="flex items-center gap-1 text-rose-400">
                          <Heart size={11} className="fill-rose-400" />
                          <span>{post.likes?.length || 0}</span>
                        </span>
                        <span className="flex items-center gap-1 text-blue-300">
                          <MessageCircle size={11} />
                          <span>{post.comments?.length || 0}</span>
                        </span>
                        <span className="flex items-center gap-1 text-zinc-300">
                          <Eye size={11} />
                          <span>{post.views || 0}</span>
                        </span>
                      </div>
                      <div className="w-full py-1.5 rounded-lg bg-blue-600 text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 shadow-md">
                        <span>{isTargetShort ? "Watch Short" : "Open Post"}</span>
                        <ArrowUpRight size={12} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Clean Minimalist Empty State */
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-3">
              <Camera size={22} className="text-[var(--text-secondary)] opacity-60" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
              No Posts Yet
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto mb-4 leading-relaxed">
              {isOwner
                ? "Share your first video, short, or link post."
                : `When ${displayName} posts, you'll see them here.`}
            </p>
            {isOwner && (
              <Link
                href="/upload"
                onClick={() => playTap()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
              >
                <Plus size={14} />
                <span>Create Post</span>
              </Link>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
