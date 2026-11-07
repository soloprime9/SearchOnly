"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, Sparkles } from "lucide-react";
import { isPushSupported, getNotificationPermission, requestPushPermission } from "@/utils/pushNotifications";
import { playTap, playPop, playChime } from "@/utils/soundEffects";
import { getApiBase } from "@/utils/apiConfig";
import toast from "react-hot-toast";

/**
 * Non-Intrusive, Micro Glass Banner for Guest Push Alerts.
 * Strictly respects user peace:
 * - Appears only after genuine user engagement (e.g. 2+ reels scrolled or 20s active)
 * - Auto-silenced for 7 days if user clicks [✕]
 * - Never shows if user is already logged in or permission is already set
 */
export default function GuestSoftPushPrompt({ triggerCount = 0 }) {
  const [visible, setVisible] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) return;
    if (getNotificationPermission() !== "default") return;

    // Check if user is logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) return;

    // Check 7-day cooldown dismissal
    const dismissedAt = typeof window !== "undefined" ? localStorage.getItem("fond_guest_push_dismissed") : null;
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) return;
    }

    // Trigger after 2 reels watched OR after 25s timer
    if (triggerCount >= 2) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [triggerCount]);

  if (!visible) return null;

  const handleDismiss = () => {
    playPop();
    setVisible(false);
    try {
      localStorage.setItem("fond_guest_push_dismissed", String(Date.now()));
      const apiBase = getApiBase();
      fetch(`${apiBase}/analytics/track-activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "push_prompt_dismissed",
          path: typeof window !== "undefined" ? window.location.pathname : "/shorts",
          metadata: { reason: "cut_button_clicked", triggerCount }
        })
      }).catch(() => {});
    } catch (_) {}
  };

  const handleEnable = async () => {
    playTap();
    setActivating(true);
    try {
      const perm = await requestPushPermission();
      if (perm === "granted") {
        playChime();
        toast.success("🔔 Alerts enabled! You'll catch trending drops first.");
        setVisible(false);
        try {
          const apiBase = getApiBase();
          fetch(`${apiBase}/analytics/track-activity`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "push_prompt_granted",
              path: typeof window !== "undefined" ? window.location.pathname : "/shorts",
              metadata: { source: "soft_pill", triggerCount }
            })
          }).catch(() => {});
        } catch (_) {}
      } else {
        handleDismiss();
      }
    } catch (e) {
      console.error(e);
      handleDismiss();
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[9990] w-[92%] max-w-sm animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
      <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.6)] text-white">
        {/* Bell Icon */}
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
          <Bell className="w-4 h-4 animate-bounce" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-bold leading-tight truncate">
            Never miss trending reels 🔥
          </p>
          <p className="text-[10px] text-gray-400 truncate mt-0.5">
            Turn on quick alerts (no account needed)
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleEnable}
            disabled={activating}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-bold shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            {activating ? "Enabling..." : "Turn On"}
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

