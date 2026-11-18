"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ADS_CONFIG, isAdsBlockedPath } from "@/data/adsConfig";
import { fireSmartlinkRedirect } from "@/utils/triggerSmartlink";

export default function SmartlinkTrigger() {
  const pathname = usePathname();

  useEffect(() => {
    if (!ADS_CONFIG.enabled || !ADS_CONFIG.smartlink.enabled || isAdsBlockedPath(pathname)) {
      return;
    }

    const handleInteraction = (e) => {
      if (isAdsBlockedPath(window.location.pathname)) return;
      // Only fire on genuine user-initiated clicks; skip form typing fields so login/comments still work
      if (!e.isTrusted) return;
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      fireSmartlinkRedirect();
    };

    window.addEventListener("click", handleInteraction, { passive: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
    };
  }, [pathname]);

  // Zero fullscreen overlay so videos & content are never occluded for users or Google Video Indexing
  return null;
}
