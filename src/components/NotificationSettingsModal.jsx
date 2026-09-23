"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import { toast } from "@/utils/toast";
import { playPop, playChime } from "@/utils/soundEffects";
import { X, Sliders, Bell, Heart, MessageCircle, AtSign, UserPlus, Repeat } from "lucide-react";

export default function NotificationSettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    likes: true,
    comments: true,
    mentions: true,
    follows: true,
    reposts: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const apiBase = getApiBase();
        const res = await axios.get(`${apiBase}/user/notification-settings`, {
          headers: getAuthHeaders(),
        });
        if (isMounted && res.data?.success && res.data?.settings) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        console.error("Error loading notification preferences:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    playPop();
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    playPop();
    try {
      const apiBase = getApiBase();
      const res = await axios.put(
        `${apiBase}/user/notification-settings`,
        { settings },
        { headers: getAuthHeaders() }
      );
      if (res.data?.success) {
        playChime();
        toast.success("Notification preferences saved");
        onClose();
      } else {
        toast.error("Failed to update settings");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving preferences");
    } finally {
      setSaving(false);
    }
  };

  const items = [
    { key: "likes", label: "Likes on your posts", icon: Heart, color: "text-rose-500" },
    { key: "comments", label: "Comments & Replies", icon: MessageCircle, color: "text-emerald-500" },
    { key: "mentions", label: "@Mentions in posts", icon: AtSign, color: "text-blue-500" },
    { key: "follows", label: "New followers", icon: UserPlus, color: "text-purple-500" },
    { key: "reposts", label: "Reposts of your content", icon: Repeat, color: "text-indigo-500" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-gray-950 border border-black/[0.08] dark:border-white/[0.12] shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Notification Preferences
              </h3>
              <p className="text-xs text-gray-500">Choose what alerts you receive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle List */}
        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            items.map((item) => {
              const Icon = item.icon;
              const enabled = !!settings[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => handleToggle(item.key)}
                  className="flex items-center justify-between p-3 rounded-2xl border border-black/[0.05] dark:border-white/[0.06] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      {item.label}
                    </span>
                  </div>
                  {/* Switch */}
                  <div
                    className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                      enabled ? "bg-blue-600 justify-end" : "bg-gray-300 dark:bg-gray-700 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-5 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-black/[0.05] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
