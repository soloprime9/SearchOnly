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
  Play
} from "lucide-react";
import { playPop, playTap } from "@/utils/soundEffects";
import { API_BASE } from "@/utils/apiConfig";
import { useThemeBackground } from "@/context/ThemeBackgroundContext";
import { toast } from "@/utils/toast";

const Profile = ({ username: propUsername, initialProfile = null }) => {
  const { bgTheme } = useThemeBackground();
  const [profile, setProfile] = useState(initialProfile || null);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(!initialProfile);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState("all"); // "all" | "shorts" | "photos"

  // Check token expiration on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (!token) return;

    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return localStorage.removeItem("token");
      if (decoded.exp * 1000 < Date.now()) localStorage.removeItem("token");
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

      if (token) {
        try {
          loggedUserId = JSON.parse(atob(token.split('.')[1]))?.UserId;
        } catch (_) {}
      }

      // If initialProfile was provided and matches target user, reuse and sync follow state
      if (initialProfile?.user && (initialProfile.user.username?.toLowerCase() === cleanName.toLowerCase() || initialProfile.user._id === cleanName)) {
        if (!profile) setProfile(initialProfile);
        if (loggedUserId && Array.isArray(initialProfile.user.Followers)) {
          setIsFollowing(initialProfile.user.Followers.some(id => String(id) === String(loggedUserId)));
        }
        setLoading(false);
        return;
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
                OwnerId: Boolean(loggedUserId && String(loggedUserId) === String(targetUser._id)),
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

          if (typeof resolvedProfile.OwnerId === 'undefined') {
            resolvedProfile.OwnerId = Boolean(loggedUserId && String(loggedUserId) === String(resolvedProfile.user._id));
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

  // Handle follow / unfollow
  const handleFollow = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (!token) return alert("Please log in to follow creators.");

    let loggedUserId = null;
    try {
      loggedUserId = JSON.parse(atob(token.split('.')[1]))?.UserId;
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
          text: `Check out ${profile?.user?.name || profile?.user?.username}'s creator profile on FondPeace!`,
          url,
        });
        return;
      } catch (_) {}
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied to clipboard! 📋");
      } catch (_) {
        toast.info("Could not copy link");
      }
    }
  };

  // Calculate total likes and media counts
  const { totalLikes, videoPosts, photoPosts } = useMemo(() => {
    const posts = profile?.posts || [];
    let likes = 0;
    const vids = [];
    const photos = [];

    posts.forEach((p) => {
      if (Array.isArray(p.likes)) likes += p.likes.length;
      const isVideo = p.media?.endsWith(".mp4") || p.mediaType?.startsWith("video");
      if (isVideo) vids.push(p);
      else photos.push(p);
    });

    return { totalLikes: likes, videoPosts: vids, photoPosts: photos };
  }, [profile?.posts]);

  // Filter posts based on active tab
  const filteredPosts = useMemo(() => {
    const posts = profile?.posts || [];
    if (activeMediaTab === "shorts") return videoPosts;
    if (activeMediaTab === "photos") return photoPosts;
    return posts;
  }, [activeMediaTab, profile?.posts, videoPosts, photoPosts]);

  // 1. ERROR (Creator not found) STATE
  if (error) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-5 shadow-xl">
          <UserX size={36} className="text-[var(--text-secondary)] opacity-60" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight text-[var(--text-primary)]">
          Creator Not Found
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mb-8 leading-relaxed">
          The creator profile <span className="font-bold text-[var(--text-primary)]">@{error.username || "user"}</span> doesn&apos;t exist or may have changed their handle.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={() => playTap()}
            className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>Back to Feed</span>
          </Link>
          <Link
            href="/search"
            onClick={() => playTap()}
            className="px-5 py-2.5 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-xs transition-all flex items-center gap-2"
          >
            <Compass size={14} />
            <span>Discover Creators</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. LOADING SKELETON
  if (loading || !profile) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Loading Creator Profile...
        </span>
      </div>
    );
  }

  const { user, posts = [], OwnerId } = profile;
  const isDefaultAvatar = !user.profilePicture || user.profilePicture === "/Fondpeace.jpg" || user.profilePicture === "";
  const rawBio = user.bio ? user.bio.trim() : "";
  const isDefaultBio = !rawBio || rawBio === "Add About You";
  const userInitial = (user.username?.[0] || user.name?.[0] || "C").toUpperCase();

  return (
    <div className="w-full pb-36 transition-colors duration-200">
      
      {/* ══════════════════════════════════════════════════════════
          1. HERO COVER BANNER (Adaptive Theme Gradients)
      ══════════════════════════════════════════════════════════ */}
      <div className="relative h-44 sm:h-56 md:h-64 w-full rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-xl group">
        
        {/* Cover Photo or Dynamic Gradient Background */}
        {user.coverImage ? (
          <img
            src={user.coverImage}
            alt="Cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className={`w-full h-full relative overflow-hidden ${
            bgTheme === "white"
              ? "bg-gradient-to-tr from-blue-100 via-indigo-50 to-purple-100"
              : "bg-gradient-to-tr from-slate-950 via-indigo-950/80 to-blue-900/60"
          }`}>
            {/* Ambient Aura Spheres */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:20px_20px]" />
          </div>
        )}

        {/* Floating Top Header Navigation */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
          {/* Back Button */}
          <Link
            href="/"
            onClick={() => playTap()}
            className="px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold border border-white/15 transition-all active:scale-95 shadow-md flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Feed</span>
          </Link>

          {/* Share & Edit Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white text-xs font-bold border border-white/15 transition-all active:scale-95 shadow-md flex items-center gap-1"
              title="Share profile"
              aria-label="Share profile"
            >
              <Share2 size={14} />
            </button>

            {OwnerId && (
              <Link
                href={`/edit/${user.username}`}
                onClick={() => playTap()}
                className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold border border-white/25 transition-all active:scale-95 shadow-md flex items-center gap-1"
              >
                <Edit3 size={13} />
                <span className="hidden sm:inline">Edit Cover</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. CREATOR PROFILE INFO CARD (Glassmorphic & Themed)
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-5 sm:p-7 shadow-xl relative -mt-14 sm:-mt-16 z-20 backdrop-blur-xl mb-6">
        
        {/* Avatar & Main Action Buttons Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          
          {/* Avatar with Illuminated Ring & Monogram Fallback */}
          <div className="relative group shrink-0 self-center sm:self-auto">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full ring-4 ring-[var(--bg-canvas)] shadow-2xl overflow-hidden bg-[var(--bg-subtle)] border-2 border-white/20 relative">
              {!isDefaultAvatar ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-3xl sm:text-4xl shadow-inner uppercase select-none">
                  {userInitial}
                </div>
              )}
            </div>

            {/* Verified Creator Shield Badge */}
            {user.isVerified && (
              <div 
                className="absolute bottom-1 right-1 p-1.5 bg-blue-600 rounded-full text-white shadow-lg ring-2 ring-[var(--bg-surface)]" 
                title="Verified Creator 💎"
              >
                <ShieldCheck size={16} />
              </div>
            )}
          </div>

          {/* Action Buttons (Follow / Edit Profile / Share) */}
          <div className="flex items-center justify-center sm:justify-end gap-2.5 w-full sm:w-auto">
            {OwnerId ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href={`/edit/${user.username}`}
                  onClick={() => playTap()}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] rounded-full text-xs font-bold border border-[var(--border-subtle)] transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Edit3 size={13} />
                  <span>Edit Profile</span>
                </Link>
                <Link
                  href="/upload"
                  onClick={() => playTap()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold transition-all active:scale-95 shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Create</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`flex-1 sm:flex-none px-7 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${
                    isFollowing
                      ? "bg-[var(--bg-subtle)] hover:bg-rose-950/40 text-[var(--text-primary)] hover:text-rose-400 border border-[var(--border-subtle)]"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                  }`}
                >
                  {followLoading ? (
                    <span>Processing...</span>
                  ) : isFollowing ? (
                    <span>✓ Following</span>
                  ) : (
                    <span>+ Follow</span>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                  title="Share profile"
                  aria-label="Share creator profile"
                >
                  <Share2 size={15} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Creator Name, Badges, Category */}
        <div className="mt-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              {user.name || user.username}
            </h1>
            {user.isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-blue-500/15 text-blue-500 border border-blue-500/30">
                <ShieldCheck size={13} />
                <span>Verified</span>
              </span>
            )}
            {user.category && user.category !== "General" && (
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-full">
                {user.category}
              </span>
            )}
          </div>

          {/* Handle */}
          <p className="text-sm font-semibold text-[var(--text-secondary)] mt-0.5">
            @{user.username}
          </p>

          {/* Tagline */}
          {user.tagline && (
            <p className="text-sm font-semibold text-blue-400 mt-2 italic max-w-xl">
              &ldquo;{user.tagline}&rdquo;
            </p>
          )}

          {/* Bio (Zero Dummy Text) */}
          <div className="mt-3 max-w-2xl">
            {!isDefaultBio ? (
              <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {rawBio}
              </p>
            ) : OwnerId ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
                <span>✨ Add a bio to tell your community about yourself.</span>
                <Link href={`/edit/${user.username}`} className="underline font-bold hover:text-blue-300">
                  Edit
                </Link>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)] italic">
                ✨ Creator on the FondPeace community.
              </p>
            )}
          </div>

          {/* Website Link */}
          {user.website && (
            <div className="mt-3">
              <a
                href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:underline"
              >
                <Globe size={13} />
                <span>{user.website.replace(/^https?:\/\//, "")}</span>
                <ExternalLink size={11} className="opacity-70" />
              </a>
            </div>
          )}

          {/* Social Links Row */}
          {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3.5 flex-wrap">
              {user.socialLinks.instagram && (
                <a
                  href={user.socialLinks.instagram.startsWith("http") ? user.socialLinks.instagram : `https://instagram.com/${user.socialLinks.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-full text-xs font-semibold text-pink-400 flex items-center gap-1.5 transition-colors"
                >
                  <Instagram size={13} />
                  <span>Instagram</span>
                </a>
              )}
              {user.socialLinks.twitter && (
                <a
                  href={user.socialLinks.twitter.startsWith("http") ? user.socialLinks.twitter : `https://x.com/${user.socialLinks.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-full text-xs font-semibold text-sky-400 flex items-center gap-1.5 transition-colors"
                >
                  <Twitter size={13} />
                  <span>X</span>
                </a>
              )}
              {user.socialLinks.youtube && (
                <a
                  href={user.socialLinks.youtube.startsWith("http") ? user.socialLinks.youtube : `https://youtube.com/${user.socialLinks.youtube.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-full text-xs font-semibold text-red-400 flex items-center gap-1.5 transition-colors"
                >
                  <Youtube size={13} />
                  <span>YouTube</span>
                </a>
              )}
            </div>
          )}

          {/* Interactive Stats Grid (Followers, Following, Posts, Total Likes) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-6 pt-5 border-t border-[var(--border-subtle)]">
            <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-center transition-all hover:border-blue-500/30">
              <p className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                {user.Followers?.length || 0}
              </p>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Followers
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-center transition-all hover:border-blue-500/30">
              <p className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                {user.Followings?.length || 0}
              </p>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Following
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-center transition-all hover:border-blue-500/30">
              <p className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                {posts.length}
              </p>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Posts
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-center transition-all hover:border-blue-500/30">
              <p className="text-lg sm:text-xl font-black text-rose-500">
                {totalLikes}
              </p>
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Total Likes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          3. MEDIA NAVIGATION TABS (Segmented Pill Switcher)
      ══════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 pb-2 mb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            playTap();
            setActiveMediaTab("all");
          }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMediaTab === "all"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)]"
          }`}
        >
          <Grid size={14} />
          <span>All Posts ({posts.length})</span>
        </button>

        <button
          onClick={() => {
            playTap();
            setActiveMediaTab("shorts");
          }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMediaTab === "shorts"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)]"
          }`}
        >
          <Film size={14} />
          <span>Shorts & Videos ({videoPosts.length})</span>
        </button>

        <button
          onClick={() => {
            playTap();
            setActiveMediaTab("photos");
          }}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMediaTab === "photos"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)]"
          }`}
        >
          <Sparkles size={14} />
          <span>Photos & Articles ({photoPosts.length})</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          4. POSTS GRID (Rich Cards & Empty States)
      ══════════════════════════════════════════════════════════ */}
      <div>
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4.5">
            {filteredPosts.map((post) => {
              const isVideo = post.media?.endsWith(".mp4") || post.mediaType?.startsWith("video");
              const postTitle = post.title || post.caption || "Community Post";

              return (
                <Link
                  key={post._id}
                  href={isVideo ? `/short/${post._id}` : `/post/${post._id}`}
                  onClick={() => playTap()}
                  className="group block rounded-2xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative aspect-[4/5] shadow-md hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  {isVideo ? (
                    <div className="w-full h-full relative bg-zinc-950">
                      <video
                        src={post.media}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <div className="w-10 h-10 rounded-full bg-blue-600/80 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                          <Play size={18} className="ml-0.5 fill-white" />
                        </div>
                      </div>
                    </div>
                  ) : post.media ? (
                    <img
                      src={post.media}
                      alt={postTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    // Typographic discussion card if no media
                    <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-blue-600/10 via-[var(--bg-surface)] to-purple-600/10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                        Discussion
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] line-clamp-4 leading-relaxed">
                        {postTitle}
                      </p>
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                        View post →
                      </span>
                    </div>
                  )}

                  {/* Gradient Overlay with Badges & Stats */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between pointer-events-none">
                    {/* Top Type Badge */}
                    <span className="self-end px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                      {isVideo ? <Film size={10} /> : <Sparkles size={10} />}
                      <span>{isVideo ? "Video" : "Photo"}</span>
                    </span>

                    {/* Bottom Title & Stats */}
                    <div>
                      <p className="text-white text-xs font-bold line-clamp-1 mb-1.5 drop-shadow-md">
                        {postTitle}
                      </p>
                      <div className="flex items-center justify-between text-[11px] font-bold text-white">
                        <span className="flex items-center gap-1 text-gray-200">
                          <Eye size={12} />
                          <span>{post.views || 0}</span>
                        </span>
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center gap-1 text-rose-400">
                            <Heart size={11} className="fill-rose-400" />
                            <span>{post.likes?.length || 0}</span>
                          </span>
                          <span className="flex items-center gap-1 text-sky-400">
                            <MessageCircle size={11} />
                            <span>{post.comments?.length || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          // Empty State for Selected Tab
          <div className="text-center py-16 px-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-3">
              <Sparkles size={24} className="text-[var(--text-secondary)] opacity-60" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
              No posts in this category yet
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto mb-5 leading-relaxed">
              {OwnerId
                ? "Share your first video, short, or thoughtful post with the FondPeace community."
                : `Stay tuned! ${user.name || user.username} hasn't uploaded any content in this section yet.`}
            </p>
            {OwnerId && (
              <Link
                href="/upload"
                onClick={() => playTap()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 active:scale-95"
              >
                <Plus size={14} />
                <span>Create Your First Post</span>
              </Link>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
