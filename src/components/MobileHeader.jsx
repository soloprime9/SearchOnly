"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { playTap } from "@/utils/soundEffects";
import { FaBell, FaBookmark, FaSearch } from "react-icons/fa";
import NotificationDrawer from "./NotificationDrawer";
import SavedPostsDrawer from "./SavedPostsDrawer";

export default function MobileHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 w-full bg-black/95 backdrop-blur-2xl border-b border-white/[0.1] px-3.5 py-2.5 flex items-center justify-between transition-colors">
        {/* Logo & Brand */}
        <Link
          href="/"
          onClick={() => playTap()}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-md shadow-white/20">
            <span className="text-black font-black text-sm leading-none">F</span>
          </div>
          <span className="font-black text-base tracking-tight text-white">
            Fond<span className="text-zinc-400">Peace</span>
          </span>
        </Link>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          {/* Quick Search Button */}
          <Link
            href="/search"
            onClick={() => playTap()}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white flex items-center justify-center transition active:scale-95"
            aria-label="Search"
          >
            <FaSearch className="w-3.5 h-3.5 text-blue-400" />
          </Link>

          {/* Saved Posts Drawer Trigger */}
          <button
            onClick={() => {
              playTap();
              setShowSavedPosts(true);
            }}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-amber-400 flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label="Saved Bookmarks"
          >
            <FaBookmark className="w-3.5 h-3.5" />
          </button>

          {/* Notifications Drawer Trigger */}
          <button
            onClick={() => {
              playTap();
              setShowNotifications(true);
            }}
            className="relative w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label="Notifications"
          >
            <FaBell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#090b14] animate-pulse" />
            )}
          </button>
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
