"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname } from "next/navigation";
import { getApiBase } from "@/utils/apiConfig";
import { getFullDeviceTelemetry } from "@/utils/deviceFingerprint";

/**
 * Categorize path into human-readable action types for the admin audit log.
 * Tracks every single platform surface: homepage, login, signup, shorts, posts, profiles, search, etc.
 */
export function categorizePathAction(fullPath) {
  const clean = (fullPath || "").split("?")[0].toLowerCase().trim();
  if (!clean || clean === "/" || clean === "/home") return "homepage_view";
  if (clean === "/login" || clean.startsWith("/login/")) return "login_page_view";
  if (clean === "/signup" || clean.startsWith("/signup/") || clean === "/register") return "signup_page_view";
  if (clean === "/shorts" || clean.startsWith("/shorts/") || clean.startsWith("/short/")) return "shorts_feed_view";
  if (clean.startsWith("/post/") || clean.startsWith("/p/")) return "single_post_view";
  if (clean.startsWith("/profile/") || clean.startsWith("/users/") || clean.startsWith("/@")) return "profile_view";
  if (clean.startsWith("/search")) return "search_page_view";
  if (clean.startsWith("/admin")) return "admin_page_view";
  if (clean.startsWith("/create") || clean.startsWith("/upload")) return "create_content_view";
  if (clean.startsWith("/village")) return "village_view";
  if (clean.startsWith("/community")) return "community_view";
  if (clean.startsWith("/designs")) return "designs_page_view";
  if (clean.startsWith("/settings")) return "settings_view";
  if (clean.startsWith("/messages")) return "messages_view";
  if (clean.startsWith("/notifications")) return "notifications_view";
  return "page_view";
}

/**
 * Extract UTM & Ad Tracking Parameters (Meta Ads, Google Ads, TikTok Ads)
 */
export function getAdAttribution() {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "ttclid"];
    const found = {};
    let hasAny = false;
    for (const key of utmKeys) {
      if (params.has(key)) {
        found[key] = params.get(key);
        hasAny = true;
      }
    }
    if (hasAny) {
      const attributionData = { ...found, firstTouch: Date.now() };
      localStorage.setItem("fond_ad_attribution", JSON.stringify(attributionData));
      return attributionData;
    }
    const cached = localStorage.getItem("fond_ad_attribution");
    return cached ? JSON.parse(cached) : null;
  } catch (_) {
    return null;
  }
}

/**
 * Universal client-side telemetry sender for non-blocking passive tracking
 */
export async function trackPlatformActivity(action, customMetadata = {}) {
  if (typeof window === "undefined") return;
  try {
    const apiBase = getApiBase();
    const token = localStorage.getItem("token");
    const fullPath = window.location.pathname + window.location.search;
    const referrer = document.referrer || "";
    const screen = `${window.innerWidth}x${window.innerHeight}`;
    const telemetry = await getFullDeviceTelemetry();
    const adAttribution = getAdAttribution();

    const payload = JSON.stringify({
      path: fullPath,
      action: action || categorizePathAction(fullPath),
      referrer,
      screen,
      metadata: {
        title: document.title,
        lang: navigator.language || "en",
        adAttribution,
        ...telemetry,
        ...customMetadata,
      },
      source: "client_activity",
    });

    fetch(`${apiBase}/analytics/track-activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-auth-token": token } : {}),
      },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch (_) {}
}

function TrackerContent() {
  const pathname = usePathname();
  const lastLoggedRef = useRef("");
  const sessionStartRef = useRef(Date.now());
  const exitIntentFiredRef = useRef(false);
  const scrollMilestonesRef = useRef(new Set());
  const clickHistoryRef = useRef([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Attach global helper to window for cross-component access
    window.__trackFondPeaceActivity = trackPlatformActivity;

    const fullPath = (window.location.pathname || pathname) + (window.location.search || "");

    // Reset page-level milestones on route change
    scrollMilestonesRef.current.clear();
    exitIntentFiredRef.current = false;
    sessionStartRef.current = Date.now();

    // Prevent duplicate rapid logging for the same route
    if (lastLoggedRef.current === fullPath) return;
    lastLoggedRef.current = fullPath;

    const timer = setTimeout(async () => {
      try {
        const apiBase = getApiBase();
        const token = localStorage.getItem("token");
        const referrer = document.referrer || "";
        const screen = `${window.innerWidth}x${window.innerHeight}`;
        const action = categorizePathAction(fullPath);
        const telemetry = await getFullDeviceTelemetry();
        const adAttribution = getAdAttribution();

        const payload = JSON.stringify({
          path: fullPath,
          action,
          referrer,
          screen,
          metadata: {
            title: document.title,
            lang: navigator.language || "en",
            adAttribution,
            ...telemetry,
          },
          source: "platform_passive",
        });

        fetch(`${apiBase}/analytics/track-activity`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "x-auth-token": token } : {}),
          },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      } catch (_) {}
    }, 400);

    // 1. Passive Clipboard Interactions (Copy & Paste)
    const handleCopy = () => {
      try {
        const selected = window.getSelection()?.toString() || "";
        if (selected.trim().length > 0) {
          trackPlatformActivity("clipboard_copy", {
            copiedLength: selected.length,
            snippet: selected.slice(0, 60),
            isUrl: /^https?:\/\//i.test(selected.trim())
          });
        }
      } catch (_) {}
    };

    const handlePaste = (e) => {
      try {
        const pastedText = e.clipboardData?.getData("text") || "";
        if (pastedText.trim().length > 0) {
          trackPlatformActivity("clipboard_paste", {
            pastedLength: pastedText.length,
            isUrl: /^https?:\/\//i.test(pastedText.trim()),
            targetTag: e.target?.tagName?.toLowerCase() || "unknown"
          });
        }
      } catch (_) {}
    };

    // 2. Scroll Depth Milestones (25%, 50%, 75%, 100%)
    let scrollThrottle = null;
    const handleScroll = () => {
      if (scrollThrottle) return;
      scrollThrottle = setTimeout(() => {
        scrollThrottle = null;
        try {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (docHeight <= 0) return;
          const scrollPercent = Math.round((scrollTop / docHeight) * 100);

          [25, 50, 75, 100].forEach((threshold) => {
            if (scrollPercent >= threshold && !scrollMilestonesRef.current.has(threshold)) {
              scrollMilestonesRef.current.add(threshold);
              trackPlatformActivity("scroll_milestone", { depthPercent: threshold });
            }
          });
        } catch (_) {}
      }, 300);
    };

    // 3. Rage Click & Rapid Click Detection (User Frustration / High Intent)
    const handleClick = (e) => {
      try {
        const now = Date.now();
        clickHistoryRef.current.push({ time: now, x: e.clientX, y: e.clientY });
        clickHistoryRef.current = clickHistoryRef.current.filter((c) => now - c.time < 800);

        if (clickHistoryRef.current.length >= 3) {
          const first = clickHistoryRef.current[0];
          const isNearby = clickHistoryRef.current.every((c) => Math.hypot(c.x - first.x, c.y - first.y) < 50);
          if (isNearby) {
            clickHistoryRef.current = [];
            trackPlatformActivity("rage_click", {
              targetTag: e.target?.tagName?.toLowerCase() || "unknown",
              targetText: (e.target?.innerText || "").slice(0, 30).trim()
            });
          }
        }
      } catch (_) {}
    };

    // 4. Exit Intent Detection (User moving cursor up to close tab or leave)
    const handleMouseLeave = (e) => {
      try {
        if (e.clientY <= 15 && !exitIntentFiredRef.current) {
          exitIntentFiredRef.current = true;
          trackPlatformActivity("exit_intent", {
            timeOnPageMs: Date.now() - sessionStartRef.current
          });
        }
      } catch (_) {}
    };

    // 5. Tab Visibility & Inactive Background Time
    const handleVisibilityChange = () => {
      try {
        if (document.hidden) {
          trackPlatformActivity("tab_backgrounded", {
            activeSeconds: Math.round((Date.now() - sessionStartRef.current) / 1000)
          });
        } else {
          sessionStartRef.current = Date.now();
          trackPlatformActivity("tab_resumed");
        }
      } catch (_) {}
    };

    // 6. Network Connectivity Fluctuations (Online / Offline detection)
    const handleOnline = () => {
      try {
        trackPlatformActivity("network_reconnected");
      } catch (_) {}
    };

    const handleOffline = () => {
      try {
        trackPlatformActivity("network_disconnected");
      } catch (_) {}
    };

    window.addEventListener("copy", handleCopy, { passive: true });
    window.addEventListener("paste", handlePaste, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("online", handleOnline, { passive: true });
    window.addEventListener("offline", handleOffline, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });

    return () => {
      clearTimeout(timer);
      if (scrollThrottle) clearTimeout(scrollThrottle);
      window.removeEventListener("copy", handleCopy);
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}

export default function PassiveTelemetryTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerContent />
    </Suspense>
  );
}
