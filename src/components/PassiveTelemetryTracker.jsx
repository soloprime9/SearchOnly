"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname } from "next/navigation";
import { getApiBase } from "@/utils/apiConfig";

function TrackerContent() {
  const pathname = usePathname();
  const lastLoggedRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fullPath = (window.location.pathname || pathname) + (window.location.search || "");

    // Prevent duplicate rapid logging
    if (lastLoggedRef.current === fullPath) return;
    lastLoggedRef.current = fullPath;

    const timer = setTimeout(() => {
      try {
        const apiBase = getApiBase();
        const token = localStorage.getItem("token");
        const referrer = document.referrer || "";
        const screen = `${window.innerWidth}x${window.innerHeight}`;

        const payload = JSON.stringify({
          path: fullPath,
          action: fullPath.startsWith("/short") ? "shorts_view" : "page_view",
          referrer,
          screen,
          metadata: {
            title: document.title,
            lang: navigator.language || "en",
          },
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
    }, 450);

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
