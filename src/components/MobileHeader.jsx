"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { playTap } from "@/utils/soundEffects";
import { FaBell, FaBookmark, FaSearch } from "react-icons/fa";
import NotificationDrawer from "./NotificationDrawer";
import SavedPostsDrawer from "./SavedPostsDrawer";
import ThemeBackgroundToggle from "./ThemeBackgroundToggle";

export default function MobileHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 w-full bg-[var(--bg-canvas)]/95 backdrop-blur-2xl border-b border-[var(--border-subtle)] px-3.5 py-2.5 flex items-center justify-between transition-colors">
        {/* Logo & Brand */}
        <Link
          href="/"
          onClick={() => playTap()}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-md shadow-white/20">
            <span className="text-black font-black text-sm leading-none">F</span>
          </div>
          <span className="font-black text-base tracking-tight text-[var(--text-primary)]">
            Fond<span className="text-[var(--text-secondary)]">Peace</span>
          </span>
        </Link>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Dual Theme Background Toggle */}
          <ThemeBackgroundToggle />

          {/* Quick Search Button */}
          <Link
            href="/search"
            onClick={() => playTap()}
            className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center justify-center transition active:scale-95"
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
            className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-amber-400 border border-[var(--border-subtle)] flex items-center justify-center transition active:scale-95 cursor-pointer"
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
            className="relative w-8 h-8 rounded-full bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center justify-center transition active:scale-95 cursor-pointer"
            aria-label="Notifications"
          >
            <FaBell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[var(--bg-canvas)] animate-pulse" />
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
