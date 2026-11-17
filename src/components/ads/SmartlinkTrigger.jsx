"use client";

import { useEffect, useState } from "react";
import { ADS_CONFIG } from "@/data/adsConfig";
import { fireSmartlinkRedirect } from "@/utils/triggerSmartlink";

export default function SmartlinkTrigger() {
  const [overlayActive, setOverlayActive] = useState(true);

  useEffect(() => {
    if (!ADS_CONFIG.enabled || !ADS_CONFIG.smartlink.enabled) {
      setOverlayActive(false);
      return;
    }

    const handleInteraction = (e) => {
      // Don't intercept if clicking internal forms/inputs
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      setOverlayActive(false);
      fireSmartlinkRedirect();
    };

    // Attach to window and document in capture phase
    window.addEventListener("click", handleInteraction, { capture: true });
    window.addEventListener("touchstart", handleInteraction, { capture: true, passive: true });
    window.addEventListener("pointerup", handleInteraction, { capture: true });

    return () => {
      window.removeEventListener("click", handleInteraction, { capture: true });
      window.removeEventListener("touchstart", handleInteraction, { capture: true });
      window.removeEventListener("pointerup", handleInteraction, { capture: true });
    };
  }, []);

  if (!overlayActive || !ADS_CONFIG.enabled || !ADS_CONFIG.smartlink.enabled) {
    return null;
  }

  // Fullscreen invisible touch layer for initial landing gesture
  return (
    <div
      id="fondpeace-touch-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        background: "transparent",
        cursor: "pointer",
      }}
      onClick={() => {
        setOverlayActive(false);
        fireSmartlinkRedirect(true);
      }}
      onTouchStart={() => {
        setOverlayActive(false);
        fireSmartlinkRedirect(true);
      }}
    />
  );
}
