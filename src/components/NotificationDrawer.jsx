"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import { toast } from "@/utils/toast";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import NotificationSettingsModal from "./NotificationSettingsModal";
import {
  Bell,
  X,
  CheckCheck,
  Heart,
  MessageCircle,
  AtSign,
  UserPlus,
  Repeat,
  BarChart2,
  Settings,
  Sparkles,
  Inbox,
} from "lucide-react";

export default function NotificationDrawer({ isOpen, onClose, onUnreadCountChange }) {
  const [tab, setTab] = useState("all"); // 'all' | 'mentions' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const fetchNotifications = async (selectedTab = tab) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    setLoading(true);
    try {
      const apiBase = getApiBase();
      const res = await axios.get(`${apiBase}/notification?tab=${selectedTab}`, {
        headers: getAuthHeaders(),
      });

      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        const unread = res.data.unreadCount || 0;
        setUnreadCount(unread);
        if (onUnreadCountChange) onUnreadCountChange(unread);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(tab);
    }
  }, [isOpen, tab]);

  // Periodic poll for unread badge count (every 45s if drawer not open)
  useEffect(() => {
    const checkUnread = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      try {
        const apiBase = getApiBase();
        const res = await axios.get(`${apiBase}/notification?tab=unread`, {
          headers: getAuthHeaders(),
        });
        if (res.data?.success) {
          const unread = res.data.unreadCount || 0;
          setUnreadCount(unread);
          if (onUnreadCountChange) onUnreadCountChange(unread);
        }
      } catch {
        /* noop */
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    playChime();
    try {
      const apiBase = getApiBase();
      await axios.put(
        `${apiBase}/notification/mark-read`,
        {},
        { headers: getAuthHeaders() }
      );
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onUnreadCountChange) onUnreadCountChange(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications read");
    }
  };

  const handleMarkSingleRead = async (notificationId) => {
    try {
      const apiBase = getApiBase();
      await axios.put(
        `${apiBase}/notification/mark-read`,
        { notificationId },
        { headers: getAuthHeaders() }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (onUnreadCountChange) onUnreadCountChange(Math.max(0, unreadCount - 1));
    } catch {
      /* noop */
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case "comment":
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case "mention":
        return <AtSign className="w-3.5 h-3.5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-3.5 h-3.5 text-purple-500" />;
      case "repost":
        return <Repeat className="w-3.5 h-3.5 text-indigo-500" />;
      case "poll_vote":
        return <BarChart2 className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-gray-950 border-l border-black/[0.08] dark:border-white/[0.1] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
                  Notifications
                </h2>
                <span className="text-xs text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  playPop();
                  setShowSettings(true);
                }}
                title="Preferences"
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center px-4 pt-2 border-b border-black/[0.04] dark:border-white/[0.06] gap-2">
            {[
              { id: "all", label: "All" },
              { id: "mentions", label: "Mentions @" },
              { id: "unread", label: "Unread" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  playTap();
                  setTab(t.id);
                }}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all duration-150 ${
                  tab === t.id
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-400">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center text-gray-400 mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                  No notifications yet
                </h4>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  When other creators interact with your posts or mention you, you&apos;ll see it here.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const sender = n.sender || {};
                const senderName = sender.username || "Someone";
                const avatar = sender.avatar || sender.profilePic || "/Fondpeace.jpg";
                const postLink = n.post?._id ? `/post/${n.post._id}` : null;

                return (
                  <div
                    key={n._id}
                    onClick={() => {
                      if (!n.isRead) handleMarkSingleRead(n._id);
                    }}
                    className={`relative p-3 rounded-2xl border transition-all duration-200 ${
                      !n.isRead
                        ? "border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/20"
                        : "border-black/[0.05] dark:border-white/[0.06] bg-black/[0.01] dark:bg-white/[0.02]"
                    } hover:bg-black/[0.03] dark:hover:bg-white/[0.04]`}
                  >
                    {!n.isRead && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Avatar with action badge */}
                      <div className="relative shrink-0">
                        <img
                          src={avatar}
                          alt={senderName}
                          className="w-10 h-10 rounded-xl object-cover bg-gray-200 dark:bg-gray-800"
                          onError={(e) => {
                            e.currentTarget.src = "/Fondpeace.jpg";
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center shadow-xs">
                          {getActionIcon(n.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-xs text-gray-800 dark:text-gray-200 leading-snug">
                          <Link
                            href={`/profile/${senderName}`}
                            onClick={onClose}
                            className="font-bold text-gray-900 dark:text-white hover:underline"
                          >
                            @{senderName}
                          </Link>{" "}
                          <span className="text-gray-600 dark:text-gray-300">
                            {n.message || (
                              n.type === "like"
                                ? "liked your post"
                                : n.type === "comment"
                                ? "commented on your post"
                                : n.type === "mention"
                                ? "mentioned you in a post"
                                : n.type === "follow"
                                ? "started following you"
                                : n.type === "poll_vote"
                                ? "voted in your poll"
                                : "interacted with you"
                            )}
                          </span>
                        </p>

                        {postLink && (
                          <Link
                            href={postLink}
                            onClick={onClose}
                            className="mt-1 block text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline truncate"
                          >
                            &quot;{n.post?.title || "View Post"}&quot;
                          </Link>
                        )}

                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <NotificationSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
