"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { playNotificationPing, playChime } from "@/utils/soundEffects";

export default function NetworkSentinel() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
      playNotificationPing();
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      playChime();

      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);

      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[999999] pointer-events-none animate-slideDown">
      {isOffline && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/90 dark:bg-amber-600/90 backdrop-blur-xl text-white text-xs font-bold shadow-lg shadow-amber-500/20">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>You are offline • Browsing cached content</span>
        </div>
      )}

      {showReconnected && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/90 backdrop-blur-xl text-white text-xs font-bold shadow-lg shadow-emerald-500/20">
          <Wifi className="w-3.5 h-3.5" />
          <span>Back online! Feed synchronized</span>
        </div>
      )}
    </div>
  );
}
