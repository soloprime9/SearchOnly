"use client";

import { useEffect } from "react";
import { ADS_CONFIG } from "@/data/adsConfig";
import { fireSmartlinkRedirect } from "@/utils/triggerSmartlink";

export default function SmartlinkTrigger() {
  useEffect(() => {
    if (!ADS_CONFIG.enabled || !ADS_CONFIG.smartlink.enabled) {
      return;
    }

    const handleInteraction = (e) => {
      // Only fire on genuine user-initiated clicks, never intercept inputs/forms/video controls
      if (!e.isTrusted) return;
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || tag === "video") return;

      fireSmartlinkRedirect();
    };

    window.addEventListener("click", handleInteraction, { passive: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
    };
  }, []);

  // Zero fullscreen overlay so videos & content are never occluded for users or Google Video Indexing
  return null;
}
