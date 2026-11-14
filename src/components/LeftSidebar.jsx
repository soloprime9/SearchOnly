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
  FaCommentDots,
  FaDownload,
  FaShoppingBag,
} from "react-icons/fa";
import axios from "axios";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import NotificationDrawer from "./NotificationDrawer";
import SavedPostsDrawer from "./SavedPostsDrawer";
import ThemeBackgroundToggle from "./ThemeBackgroundToggle";
import { playTap } from "@/utils/soundEffects";

export default function LeftSidebar({ sticky = false }) {
  const [username, setUsername] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded?.username) {
          setUsername(decoded.username);
          const cached = localStorage.getItem(`fondpeace_profile_${decoded.username.toLowerCase()}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.profilePicture && parsed.profilePicture !== "/Fondpeace.jpg") {
              setProfilePicture(parsed.profilePicture);
            }
          }
        }

        // Live server sync from /user/me
        const apiBase = getApiBase();
        axios
          .get(`${apiBase}/user/me`, { headers: getAuthHeaders() })
          .then((res) => {
            if (res.data?.success && res.data.user) {
              const u = res.data.user;
              if (u.username) setUsername(u.username);
              const pic = u.profilePicture || u.profilePic || u.avatar;
              if (pic && pic !== "/Fondpeace.jpg" && pic.trim() !== "") {
                setProfilePicture(pic);
              }
            }
          })
          .catch(() => {});
      }
    } catch (_) {
      /* noop */
    }

    const handleProfileUpdate = (e) => {
      if (e.detail?.profilePicture) {
        setProfilePicture(e.detail.profilePicture);
      }
    };
    window.addEventListener("user_profile_updated", handleProfileUpdate);

    // Live unread notification sync
    const fetchUnread = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      try {
        const apiBase = getApiBase();
        const res = await axios.get(`${apiBase}/notification?tab=unread`, {
          headers: getAuthHeaders(),
        });
        if (res.data?.success) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (_) {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 25000);

    // Live unread chat messages sync
    const fetchChatUnread = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      try {
        const apiBase = getApiBase();
        const res = await axios.get(`${apiBase}/chat/unread-count`, {
          headers: getAuthHeaders(),
        });
        if (res.data?.success) {
          setUnreadChatCount(res.data.unreadCount || 0);
        }
      } catch (_) {}
    };

    fetchChatUnread();
    const chatInterval = setInterval(fetchChatUnread, 15000);

    const handleNotificationsSeen = () => {
      setUnreadCount(0);
    };
    const handleNotificationsUpdated = (e) => {
      if (typeof e.detail?.unreadCount === "number") {
        setUnreadCount(e.detail.unreadCount);
      }
    };
    const handleChatRead = () => {
      setUnreadChatCount(0);
    };

    window.addEventListener("notifications_seen", handleNotificationsSeen);
    window.addEventListener("notifications_updated", handleNotificationsUpdated);
    window.addEventListener("chat_messages_seen", handleChatRead);

    return () => {
      clearInterval(interval);
      clearInterval(chatInterval);
      window.removeEventListener("notifications_seen", handleNotificationsSeen);
      window.removeEventListener("notifications_updated", handleNotificationsUpdated);
      window.removeEventListener("chat_messages_seen", handleChatRead);
      window.removeEventListener("user_profile_updated", handleProfileUpdate);
    };
  }, []);

  const menu = [
    { icon: FaHome,        label: "Home",     href: "/" },
    { icon: FaSearch,      label: "Explore",  href: "/search" },
    { icon: FaVideo,       label: "Shorts",   href: "/shorts" },
    { icon: FaShoppingBag, label: "Store",    href: "/store" },
    { icon: FaCommentDots, label: "Messages", href: "/messages", badge: unreadChatCount },
    { icon: FaUpload,      label: "Upload",   href: "/upload" },
    { icon: FaCoins,       label: "Monetize", href: "/monetization" },
    {
      icon: FaUser,
      label: "Profile",
      href: username ? `/profile/${username}` : "/login",
    },
    { icon: FaShareAlt,    label: "About",    href: "/aboutus" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    if (href === "/shorts") return pathname?.startsWith("/short");
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          DESKTOP SIDEBAR (Modern Gen-Z Glassmorphic)
      ═══════════════════════════════════════════════════ */}
      <div
        className={`hidden lg:block ${sticky ? "sticky top-0" : "fixed left-0 top-0"} h-screen w-[68px] z-40 shrink-0`}
      >
        <aside
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          className={`
            flex flex-col ${sticky ? "sticky top-0" : "fixed left-0 top-0"} h-screen z-40
            bg-white/95 dark:bg-[#0c0d12]/95 backdrop-blur-2xl
            border-r border-black/10 dark:border-white/10
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
            const isStore = item.href === "/store";
            return (
              <Link
                key={i}
                href={item.href}
                className={`
                  relative flex items-center gap-3.5
                  h-11 px-2.5 rounded-xl
                  transition-all duration-150
                  group
                  ${
                    active
                      ? isStore
                        ? "bg-amber-500/20 text-amber-400 font-extrabold border border-amber-500/40 shadow-xs"
                        : "bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                      : isStore
                      ? "text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 font-bold"
                      : "text-gray-600 dark:text-zinc-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white"
                  }
                `}
              >
                {/* Active Glowing Indicator */}
                {active && (
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full ${
                    isStore ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]" : "bg-blue-500"
                  }`} />
                )}

                <div className="relative shrink-0">
                  <item.icon
                    className={`
                      shrink-0 text-[18px] ml-0.5
                      transition-transform duration-200
                      ${
                        isStore
                          ? "text-amber-400 group-hover:scale-110 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                          : active
                          ? "text-blue-600 dark:text-blue-400"
                          : "group-hover:scale-110 text-zinc-400 group-hover:text-white"
                      }
                    `}
                  />
                  {/* Glowing Beacon on Store Icon */}
                  {isStore && (
                    <>
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white dark:ring-[#070a13] animate-ping" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
                    </>
                  )}
                  {item.badge > 0 && !isStore && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-white dark:ring-[#070a13] animate-pulse" />
                  )}
                </div>

                <span
                  className={`
                    text-[13.5px] whitespace-nowrap
                    transition-all duration-200 flex items-center justify-between flex-1
                    ${expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3 pointer-events-none w-0"}
                  `}
                >
                  <span className={isStore ? "text-amber-400 font-extrabold" : ""}>{item.label}</span>
                  {isStore ? (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[9.5px] rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black uppercase tracking-wider shadow-sm animate-pulse">
                      HOT
                    </span>
                  ) : item.badge > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-blue-600 text-white font-bold">
                      {item.badge}
                    </span>
                  )}
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

          {/* Install PWA App Button */}
          <button
            onClick={() => {
              playTap();
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-pwa-install"));
              }
            }}
            className="relative flex items-center gap-3.5 h-11 px-2.5 rounded-xl transition-all duration-150 text-gray-600 dark:text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white group w-full text-left"
            title="Install FondPeace App"
          >
            <FaDownload className="shrink-0 text-[15px] ml-0.5 group-hover:scale-110 transition-transform text-sky-400" />
            <span
              className={`text-[13.5px] font-medium whitespace-nowrap transition-all duration-200 ${
                expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3 pointer-events-none w-0"
              }`}
            >
              Install App
            </span>
          </button>
        </nav>

        {/* Background Appearance Switcher (Dim vs Black) */}
        <div className="px-2 pb-2 shrink-0">
          <ThemeBackgroundToggle variant={expanded ? "full" : "icon"} />
        </div>

        {/* Bottom profile pill */}
        <div className="px-2 pb-4 shrink-0">
          <Link
            href={username ? `/profile/${username}` : "/login"}
            onClick={() => playTap()}
            className={`
              flex items-center gap-3 px-2.5 py-2.5 rounded-xl border border-transparent
              ${expanded ? "bg-white/[0.05] border-white/[0.08]" : ""}
              transition-all duration-200 hover:bg-white/[0.08]
            `}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
              {profilePicture && profilePicture !== "/Fondpeace.jpg" ? (
                <img src={profilePicture} alt={username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-[12px] uppercase">
                  {username?.[0] || "?"}
                </span>
              )}
            </div>
            <div
              className={`
                flex flex-col min-w-0
                transition-all duration-200
                ${expanded ? "opacity-100" : "opacity-0 w-0 pointer-events-none"}
              `}
            >
              <span className="text-[12px] font-bold text-white truncate leading-tight">
                {username || "Guest"}
              </span>
              <span className="text-[10.5px] text-zinc-400">
                {username ? "View profile →" : "Log in →"}
              </span>
            </div>
          </Link>
        </div>
      </aside>
      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION (Exact 4 Core Tabs: Home, Shorts, FondPeace Store, Profile)
      ═══════════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[var(--bg-canvas)] backdrop-blur-2xl border-t border-[var(--border-subtle)]">
        {/* Safe area for notched phones - 4 Core Actions */}
        <div className="flex items-center justify-around px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
          {/* 1. Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 rounded-xl transition-all duration-150 active:scale-90 ${
              pathname === "/" ? "text-white font-extrabold" : "text-zinc-400"
            }`}
          >
            <div className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
              pathname === "/" ? "bg-white text-black scale-110 shadow-md shadow-white/20" : ""
            }`}>
              <FaHome className={`text-[18px] transition-colors ${pathname === "/" ? "text-black" : "text-zinc-400"}`} />
            </div>
            <span className="text-[9.5px]">Home</span>
          </Link>

          {/* 2. Shorts */}
          <Link
            href="/shorts"
            className={`flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 rounded-xl transition-all duration-150 active:scale-90 ${
              pathname?.startsWith("/short") ? "text-white font-extrabold" : "text-zinc-400"
            }`}
          >
            <div className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 ${
              pathname?.startsWith("/short") ? "bg-white text-black scale-110 shadow-md shadow-white/20" : ""
            }`}>
              <FaVideo className={`text-[18px] transition-colors ${pathname?.startsWith("/short") ? "text-black" : "text-zinc-400"}`} />
            </div>
            <span className="text-[9.5px]">Shorts</span>
          </Link>

          {/* 3. FONDPEACE STORE (PROMINENT GLOWING BEACON) */}
          <Link
            href="/store"
            className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[76px] py-1 rounded-xl transition-all duration-150 active:scale-95 group ${
              pathname?.startsWith("/store") ? "text-amber-400 font-black scale-105" : "text-amber-400/95"
            }`}
          >
            <div
              className={`
                relative w-9 h-8 flex items-center justify-center rounded-xl transition-all duration-200
                bg-gradient-to-tr from-amber-500/25 via-orange-500/20 to-yellow-500/25
                border border-amber-400/60 shadow-[0_0_14px_rgba(245,158,11,0.45)]
                ${pathname?.startsWith("/store") ? "bg-amber-400 text-black scale-110 shadow-lg shadow-amber-400/60 border-amber-300" : "group-hover:border-amber-400 group-hover:scale-105"}
              `}
            >
              <FaShoppingBag
                className={`text-[16px] transition-colors ${
                  pathname?.startsWith("/store") ? "text-black" : "text-amber-400"
                }`}
              />
              {/* Pulsing Beacon Dot */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white dark:ring-[#070a13] animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full shadow-xs" />
            </div>
            <span className="text-[9.5px] font-black tracking-tight text-amber-400 flex items-center gap-0.5 whitespace-nowrap">
              <span>FondPeace Store</span>
              <span className="text-[7.5px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-black">⚡</span>
            </span>
          </Link>

          {/* 4. Mobile Profile / Sign-in navigation item */}
          {(() => {
            const profileHref = username ? `/profile/${username}` : "/login";
            const isProfileActive = username
              ? pathname?.startsWith(`/profile/${username}`) || pathname === "/profile"
              : pathname === "/login" || pathname === "/signup";
            const profileLabel = username ? "Profile" : "Sign In";

            return (
              <Link
                href={profileHref}
                onClick={() => playTap()}
                className={`
                  flex flex-col items-center justify-center gap-1
                  min-w-[52px] py-1 rounded-xl
                  transition-all duration-150 active:scale-90
                  ${isProfileActive ? "text-white font-extrabold" : "text-zinc-400"}
                `}
                aria-label={profileLabel}
              >
                <div
                  className={`
                    relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200
                    ${isProfileActive ? "bg-white text-black scale-110 shadow-md shadow-white/20" : ""}
                  `}
                >
                  {profilePicture && profilePicture !== "/Fondpeace.jpg" ? (
                    <img
                      src={profilePicture}
                      alt={username || "User"}
                      className={`w-6 h-6 rounded-full object-cover ring-1.5 ${
                        isProfileActive ? "ring-black" : "ring-white/30"
                      }`}
                    />
                  ) : (
                    <FaUser
                      className={`text-[17px] transition-colors ${
                        isProfileActive ? "text-black" : "text-zinc-400"
                      }`}
                    />
                  )}
                  {isProfileActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-black rounded-full" />
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-[9.5px] transition-colors font-medium truncate max-w-[56px]">
                  {profileLabel}
                </span>
              </Link>
            );
          })()}
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
