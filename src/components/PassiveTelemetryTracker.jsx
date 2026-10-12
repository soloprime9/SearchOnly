"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname } from "next/navigation";
import { getApiBase } from "@/utils/apiConfig";

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
 * Universal client-side telemetry sender for non-blocking passive tracking
 */
export function trackPlatformActivity(action, customMetadata = {}) {
  if (typeof window === "undefined") return;
  try {
    const apiBase = getApiBase();
    const token = localStorage.getItem("token");
    const fullPath = window.location.pathname + window.location.search;
    const referrer = document.referrer || "";
    const screen = `${window.innerWidth}x${window.innerHeight}`;

    const payload = JSON.stringify({
      path: fullPath,
      action: action || categorizePathAction(fullPath),
      referrer,
      screen,
      metadata: {
        title: document.title,
        lang: navigator.language || "en",
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Attach global helper to window for cross-component access
    window.__trackFondPeaceActivity = trackPlatformActivity;

    const fullPath = (window.location.pathname || pathname) + (window.location.search || "");

    // Prevent duplicate rapid logging for the same route
    if (lastLoggedRef.current === fullPath) return;
    lastLoggedRef.current = fullPath;

    const timer = setTimeout(() => {
      try {
        const apiBase = getApiBase();
        const token = localStorage.getItem("token");
        const referrer = document.referrer || "";
        const screen = `${window.innerWidth}x${window.innerHeight}`;
        const action = categorizePathAction(fullPath);

        const payload = JSON.stringify({
          path: fullPath,
          action,
          referrer,
          screen,
          metadata: {
            title: document.title,
            lang: navigator.language || "en",
          },
          source: "platform_passive",
        });

        // Use keepalive fetch with auth headers if present
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

    return () => clearTimeout(timer);
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
