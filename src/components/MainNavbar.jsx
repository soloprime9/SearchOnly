"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { playTap } from "@/utils/soundEffects";
import { FaBell, FaBookmark, FaSearch } from "react-icons/fa";
import { User, Upload } from "lucide-react";
import NotificationDrawer from "./NotificationDrawer";
import SavedPostsDrawer from "./SavedPostsDrawer";

export default function MainNavbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [username, setUsername] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded?.username) {
          setUsername(decoded.username);
        }
      }
    } catch (_) {}
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    playTap();
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#080a13]/90 backdrop-blur-2xl border-b border-white/[0.08] transition-colors">
        <div className="max-w-[1280px] mx-auto px-4 h-15 flex items-center justify-between gap-4">
          {/* 1. Brand Logo */}
          <Link
            href="/"
            onClick={() => playTap()}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-[15px] leading-none">F</span>
            </div>
            <span className="font-black text-lg tracking-tight text-white">
              Fond<span className="text-blue-500">Peace</span>
            </span>
          </Link>

          {/* 2. Center Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-md mx-4 relative"
          >
            <div className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-blue-500/40 focus-within:border-blue-500/60 focus-within:bg-white/[0.06] transition-all">
              <FaSearch className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search peace, topics, creators..."
                className="w-full bg-transparent text-xs font-medium text-white placeholder-gray-400 outline-none"
              />
              <span className="text-[10px] font-bold text-gray-500 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/10 shrink-0 hidden sm:inline">
                Ctrl K
              </span>
            </div>
          </form>

          {/* 3. Action Right Pill Controls */}
          <div className="flex items-center gap-2.5">
            {/* Mobile Search Icon */}
            <Link
              href="/search"
              onClick={() => playTap()}
              className="md:hidden w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white flex items-center justify-center transition active:scale-95"
              aria-label="Search"
            >
              <FaSearch className="w-3.5 h-3.5 text-blue-400" />
            </Link>

            {/* Upload Button */}
            <Link
              href="/upload"
              onClick={() => playTap()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition active:scale-95 cursor-pointer shrink-0"
            >
              <Upload size={14} className="stroke-[2.5]" />
              <span className="hidden sm:inline">Upload</span>
            </Link>

            {/* Saved Bookmarks Trigger */}
            <button
              onClick={() => {
                playTap();
                setShowSavedPosts(true);
              }}
              className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-amber-400 flex items-center justify-center transition active:scale-95 cursor-pointer border border-white/[0.06]"
              aria-label="Saved Bookmarks"
              title="Saved Posts"
            >
              <FaBookmark className="w-3.5 h-3.5" />
            </button>

            {/* Notifications Trigger */}
            <button
              onClick={() => {
                playTap();
                setShowNotifications(true);
              }}
              className="relative w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer border border-white/[0.06]"
              aria-label="Notifications"
              title="Notifications"
            >
              <FaBell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#080a13] animate-pulse" />
              )}
            </button>

            {/* Profile Avatar / Login Pill */}
            <Link
              href={username ? `/profile/${username}` : "/login"}
              onClick={() => playTap()}
              className="flex items-center gap-2 pl-1 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm group-hover:scale-105 transition-transform border border-white/20">
                {username ? username[0] : <User size={14} />}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onUnreadCountChange={(count) => setUnreadCount(count)}
      />

      {/* Slide-over Saved Posts Drawer */}
      <SavedPostsDrawer
        isOpen={showSavedPosts}
        onClose={() => setShowSavedPosts(false)}
      />
    </>
  );
}
