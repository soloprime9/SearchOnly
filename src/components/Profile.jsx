'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import { ShieldCheck, Sparkles, Youtube, Instagram, Twitter, Globe, Eye, Film, Grid, ExternalLink } from "lucide-react";
import { playPop, playTap } from "@/utils/soundEffects";
import { API_BASE } from "@/utils/apiConfig";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState("all"); // "all" | "shorts" | "photos"

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return localStorage.removeItem("token");
      if (decoded.exp * 1000 < Date.now()) localStorage.removeItem("token");
    } catch {
      localStorage.removeItem("token");
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const username = window.location.pathname.split("/").pop();
      let loggedUserId = null;

      if (token) {
        try {
          loggedUserId = JSON.parse(atob(token.split('.')[1]))?.UserId;
        } catch (_) {}
      }

      try {
        const result = await axios.get(
          `${API_BASE}/user/profile/${username}`,
          token ? { headers: { "x-auth-token": token } } : {}
        );

        const data = result.data.Profile;

        // Proper sort (latest first)
        if (Array.isArray(data.posts)) {
          data.posts = [...data.posts].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        }

        setProfile(data);
        if (loggedUserId && Array.isArray(data.user?.Followers)) {
          setIsFollowing(data.user.Followers.some(id => String(id) === String(loggedUserId)));
        }
      } catch (err) {
        setError(err.message || "Unable to fetch profile");
      }
    };

    fetchProfile();
  }, []);

  const handleFollow = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login to follow users.");

    let loggedUserId = null;
    try {
      loggedUserId = JSON.parse(atob(token.split('.')[1]))?.UserId;
    } catch (_) {}

    try {
      setLoading(true);
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
      alert("Error updating follow state");
    } finally {
      setLoading(false);
    }
  };

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-[#090a0f] text-white">
        <h1 className="text-xl font-bold text-gray-300">{error}</h1>
      </div>
    );

  if (!profile)
    return (
      <div className="flex justify-center items-center h-screen bg-[#090a0f] text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400 font-bold">Loading Creator Profile...</span>
        </div>
      </div>
    );

  const { user, posts = [], OwnerId } = profile;

  const filteredPosts = posts.filter((post) => {
    const isVideo = post.media?.endsWith(".mp4") || post.mediaType?.startsWith("video");
    if (activeMediaTab === "shorts") return isVideo;
    if (activeMediaTab === "photos") return !isVideo;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#090a0f] text-white selection:bg-blue-600 selection:text-white pb-24">
      {/* 1. RADIANT FLUID HERO BANNER */}
      <div className="relative h-44 sm:h-56 w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 overflow-hidden shadow-2xl">
        {/* Ambient Gradient Mesh Aura */}
        <div className="absolute -inset-10 bg-gradient-to-tr from-cyan-500/25 via-blue-500/30 to-purple-500/25 blur-3xl pointer-events-none opacity-80" />
        
        {/* Subtle Wave Dot Pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Back Button */}
        <a
          href="/"
          onClick={() => playTap()}
          className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold border border-white/10 transition-all active:scale-95 shadow-md flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Feed</span>
        </a>
      </div>

      {/* 2. CREATOR PROFILE INFO CARD */}
      <div className="max-w-4xl mx-auto px-4 relative -mt-16 sm:-mt-20 z-20">
        <div className="flex flex-col items-center sm:items-start sm:flex-row sm:justify-between gap-4">
          
          {/* Avatar with Illuminated Ring */}
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-[#090a0f] overflow-hidden shadow-2xl bg-zinc-900 border-2 border-white/20">
              <img
                src={user.profilePicture || "/Fondpeace.jpg"}
                alt={user.username}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.currentTarget.src = "/Fondpeace.jpg"; }}
              />
            </div>
            {user.isVerified && (
              <div className="absolute bottom-1 right-1 p-1 bg-blue-600 rounded-full text-white shadow-lg" title="Verified Creator">
                <ShieldCheck size={16} />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2 sm:pt-14">
            {OwnerId ? (
              <a
                href={`/edit/${user.username}`}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-md"
              >
                Edit Profile
              </a>
            ) : (
              <button
                onClick={handleFollow}
                disabled={loading}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all active:scale-95 shadow-md cursor-pointer ${
                  isFollowing
                    ? "bg-zinc-800 hover:bg-rose-950/40 text-gray-200 hover:text-rose-400 border border-zinc-700"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                }`}
              >
                {loading ? "Processing..." : isFollowing ? "✓ Following" : "+ Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Name, Handles, Badges */}
        <div className="mt-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {user.name || user.username}
            </h1>
            {user.isVerified && (
              <ShieldCheck size={20} className="text-blue-500 fill-blue-500/20 shrink-0" title="Official Verified Creator 💎" />
            )}
            {user.isEmailVerified && (
              <ShieldCheck size={18} className="text-emerald-500 fill-emerald-500/20 shrink-0" title="Email Verified 🛡️" />
            )}
            {user.category && user.category !== "General" && (
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-full">
                {user.category}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-gray-400 mt-0.5">@{user.username}</p>

          {/* Tagline */}
          {user.tagline && (
            <p className="text-sm font-semibold text-blue-400 mt-2 italic max-w-xl">
              &ldquo;{user.tagline}&rdquo;
            </p>
          )}

          {/* Bio */}
          <p className="text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed whitespace-pre-wrap">
            {user.bio || "Creator on FondPeace community."}
          </p>

          {/* Website */}
          {user.website && (
            <a
              href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:underline mt-2.5"
            >
              <Globe size={13} />
              <span>{user.website.replace(/^https?:\/\//, "")}</span>
              <ExternalLink size={11} className="opacity-70" />
            </a>
          )}

          {/* Connected Social Links */}
          {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
            <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-3 flex-wrap">
              {user.socialLinks.instagram && (
                <a
                  href={user.socialLinks.instagram.startsWith("http") ? user.socialLinks.instagram : `https://instagram.com/${user.socialLinks.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-semibold text-pink-400 flex items-center gap-1.5 transition-colors"
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
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-semibold text-sky-400 flex items-center gap-1.5 transition-colors"
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
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-semibold text-red-400 flex items-center gap-1.5 transition-colors"
                >
                  <Youtube size={13} />
                  <span>YouTube</span>
                </a>
              )}
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-center sm:justify-start gap-8 mt-6 pt-4 border-t border-white/10">
            <div>
              <p className="text-xl font-black text-white">{user.Followers?.length || 0}</p>
              <span className="text-gray-400 text-xs font-medium">Followers</span>
            </div>
            <div>
              <p className="text-xl font-black text-white">{user.Followings?.length || 0}</p>
              <span className="text-gray-400 text-xs font-medium">Following</span>
            </div>
            <div>
              <p className="text-xl font-black text-white">{posts.length}</p>
              <span className="text-gray-400 text-xs font-medium">Posts</span>
            </div>
          </div>
        </div>

        {/* 3. MEDIA NAVIGATION TABS */}
        <div className="flex items-center gap-2 mt-10 border-b border-white/10 pb-2">
          <button
            onClick={() => {
              playTap();
              setActiveMediaTab("all");
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMediaTab === "all"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
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
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMediaTab === "shorts"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Film size={14} />
            <span>Shorts & Videos</span>
          </button>
          <button
            onClick={() => {
              playTap();
              setActiveMediaTab("photos");
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMediaTab === "photos"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles size={14} />
            <span>Photos</span>
          </button>
        </div>

        {/* 4. POSTS GRID */}
        <div className="mt-6">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredPosts.map((post) => {
                const isVideo = post.media?.endsWith(".mp4") || post.mediaType?.startsWith("video");
                return (
                  <a
                    key={post._id}
                    href={isVideo ? `/short/${post._id}` : `/post/${post._id}`}
                    className="group block rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 relative aspect-[4/5] shadow-md hover:border-blue-500/50 transition-all hover:scale-[1.02]"
                  >
                    {isVideo ? (
                      <video
                        src={post.media}
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={post.media}
                        alt={post.title || "Post"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}

                    {/* Gradient Overlay with Views Badge */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between pointer-events-none">
                      <span className="self-end px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-white flex items-center gap-1">
                        {isVideo ? <Film size={10} /> : <Sparkles size={10} />}
                        <span>{isVideo ? "Video" : "Photo"}</span>
                      </span>

                      <div className="flex items-center justify-between text-[11px] font-bold text-white">
                        <span className="flex items-center gap-1">
                          <Eye size={12} className="text-gray-300" />
                          <span>{post.views || 0}</span>
                        </span>
                        <span className="text-rose-400">❤️ {post.likes?.length || 0}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Sparkles size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No posts in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
