"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  FaHome,
  FaSearch,
  FaUser,
  FaVideo,
  FaUpload,
  FaShareAlt,
  FaBell,
  FaBookmark,
  FaCoins,
} from "react-icons/fa";
import NotificationDrawer from "./NotificationDrawer";
import SavedPostsDrawer from "./SavedPostsDrawer";
import { playTap } from "@/utils/soundEffects";

export default function LeftSidebar({ sticky = false }) {
  const [username, setUsername] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded?.username) {
          setUsername(decoded.username);
        }
      }
    } catch (_) {
      /* noop */
    }
  }, []);

  const menu = [
    { icon: FaHome,     label: "Home",    href: "/" },
    { icon: FaSearch,   label: "Explore", href: "/search" },
    { icon: FaVideo,    label: "Shorts",  href: "/short/698c432d0a8059958d20a4f4" },
    { icon: FaUpload,   label: "Upload",  href: "/upload" },
    { icon: FaCoins,    label: "Monetize", href: "/monetization" },
    {
      icon: FaUser,
      label: "Profile",
      href: username ? `/profile/${username}` : "/login",
    },
    { icon: FaShareAlt, label: "About",   href: "/aboutus" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          DESKTOP SIDEBAR (Modern Gen-Z Glassmorphic)
      ═══════════════════════════════════════════════════ */}
      <div
        className={`hidden lg:block relative ${sticky ? "sticky top-0" : "fixed left-0 top-0"} h-screen w-[68px] z-40 shrink-0`}
      >
        <aside
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          className={`
            flex flex-col absolute left-0 top-0 h-screen z-40
            bg-black/95 backdrop-blur-2xl
            border-r border-white/[0.1]
            transition-all duration-300 ease-in-out
            overflow-hidden
            ${expanded ? "w-56 shadow-[8px_0_30px_rgba(0,0,0,0.7)]" : "w-[68px]"}
          `}
        >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-black/[0.06] dark:border-white/[0.08] shrink-0">
          <Link href="/" onClick={() => playTap()} className="flex items-center">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
              <span className="text-white font-black text-[15px] leading-none">F</span>
            </div>
            <span
              className={`
                ml-3 font-black text-[17px] tracking-tight text-gray-900 dark:text-white whitespace-nowrap
                transition-all duration-200
                ${expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"}
              `}
            >
              Fond<span className="text-blue-500">Peace</span>
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 mt-3 px-2 flex-1 overflow-hidden">
          {menu.map((item, i) => {
            const active = isActive(item.href);
            return (
              <Link
                key={i}
                href={item.href}
                onClick={() => playTap()}
                className={`
                  relative flex items-center gap-3.5
                  h-11 px-2.5 rounded-xl
                  transition-all duration-150
                  group
                  ${
                    active
                      ? "bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                      : "text-gray-600 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white"
                  }
                `}
              >
                {/* Active Glowing Indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
                )}

                <item.icon
                  className={`
                    shrink-0 text-[18px] ml-0.5
                    transition-transform duration-200
                    ${active ? "text-black" : "group-hover:scale-110 text-zinc-400 group-hover:text-white"}
                  `}
                />

                <span
                  className={`
                    text-[13.5px] whitespace-nowrap
                    transition-all duration-200
                    ${expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3 pointer-events-none w-0"}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Notifications Button */}
          <button
            onClick={() => {
              playTap();
              setShowNotifications(true);
            }}
            className="relative flex items-center gap-3.5 h-11 px-2.5 rounded-xl transition-all duration-150 text-gray-600 dark:text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white group w-full text-left"
          >
            <div className="relative">
              <FaBell className="shrink-0 text-[18px] ml-0.5 group-hover:scale-110 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#070a13] animate-pulse" />
              )}
            </div>
            <span
              className={`text-[13.5px] font-medium whitespace-nowrap transition-all duration-200 flex items-center justify-between flex-1 ${
                expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3 pointer-events-none w-0"
              }`}
            >
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500 text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </span>
          </button>

          {/* Saved / Bookmarks Button */}
          <button
            onClick={() => {
              playTap();
              setShowSavedPosts(true);
            }}
            className="relative flex items-center gap-3.5 h-11 px-2.5 rounded-xl transition-all duration-150 text-gray-600 dark:text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white group w-full text-left"
          >
            <FaBookmark className="shrink-0 text-[17px] ml-0.5 group-hover:scale-110 transition-transform text-amber-500" />
            <span
              className={`text-[13.5px] font-medium whitespace-nowrap transition-all duration-200 ${
                expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3 pointer-events-none w-0"
              }`}
            >
              Saved Posts
            </span>
          </button>
        </nav>

        {/* Bottom profile pill */}
        <div className="px-2 pb-4 shrink-0">
          <Link
            href={username ? `/profile/${username}` : "/login"}
            onClick={() => playTap()}
            className={`
              flex items-center gap-3 px-2.5 py-2.5 rounded-xl border border-transparent
              ${expanded ? "bg-black/[0.03] dark:bg-white/[0.05] border-black/[0.04] dark:border-white/[0.06]" : ""}
              transition-all duration-200 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]
            `}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              <span className="text-white font-bold text-[12px] uppercase">
                {username?.[0] || "?"}
              </span>
            </div>
            <div
              className={`
                flex flex-col min-w-0
                transition-all duration-200
                ${expanded ? "opacity-100" : "opacity-0 w-0 pointer-events-none"}
              `}
            >
              <span className="text-[12px] font-bold text-gray-900 dark:text-white truncate leading-tight">
                {username || "Guest"}
              </span>
              <span className="text-[10.5px] text-gray-400 dark:text-gray-500">
                {username ? "View profile →" : "Log in →"}
              </span>
            </div>
          </Link>
        </div>
      </aside>
      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION (Glassmorphic)
      ═══════════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-black/90 backdrop-blur-2xl border-t border-white/[0.1]">
        {/* Safe area for notched phones */}
        <div className="flex items-center justify-around px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
          {menu.slice(0, 4).map((item, i) => {
            const active = isActive(item.href);
            return (
              <Link
                key={i}
                href={item.href}
                onClick={() => playTap()}
                className={`
                  flex flex-col items-center justify-center gap-1
                  min-w-[52px] py-1 rounded-xl
                  transition-all duration-150 active:scale-90
                  ${active ? "text-white font-extrabold" : "text-zinc-400"}
                `}
              >
                <div
                  className={`
                    relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200
                    ${active ? "bg-white text-black scale-110 shadow-md shadow-white/20" : ""}
                  `}
                >
                  <item.icon className={`text-[18px] transition-colors ${active ? "text-black" : "text-zinc-400"}`} />
                  {active && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-black rounded-full" />
                  )}
                </div>
                <span className="text-[9.5px] transition-colors">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Mobile Notifications button */}
          <button
            onClick={() => {
              playTap();
              setShowNotifications(true);
            }}
            className="flex flex-col items-center justify-center gap-1 min-w-[52px] py-1 rounded-xl transition-all duration-150 active:scale-90 text-gray-500 dark:text-gray-400"
          >
            <div className="relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200">
              <FaBell className="text-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className="text-[9.5px] font-medium">Alerts</span>
          </button>
        </div>
      </nav>

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
