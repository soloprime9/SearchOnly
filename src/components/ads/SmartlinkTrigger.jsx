"use client";

import { useEffect } from "react";
import { ADS_CONFIG } from "@/data/adsConfig";

export default function SmartlinkTrigger() {
  useEffect(() => {
    if (!ADS_CONFIG.enabled || !ADS_CONFIG.smartlink.enabled) return;

    const STORAGE_KEY = "fondpeace_adsterra_sl_last";
    const cooldownMs = (ADS_CONFIG.smartlink.cooldownMinutes || 1) * 60 * 1000;

    let triggeredInThisInteraction = false;

    const triggerSmartlink = () => {
      if (!ADS_CONFIG.enabled || !ADS_CONFIG.smartlink.enabled) return;
      if (triggeredInThisInteraction) return;

      try {
        const lastTrigger = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
        const now = Date.now();

        if (lastTrigger && now - Number(lastTrigger) < cooldownMs) {
          return;
        }

        triggeredInThisInteraction = true;
        setTimeout(() => {
          triggeredInThisInteraction = false;
        }, 1500);

        sessionStorage.setItem(STORAGE_KEY, String(now));
        localStorage.setItem(STORAGE_KEY, String(now));

        // Open in new tab synchronously within user interaction
        const win = window.open(ADS_CONFIG.smartlink.url, "_blank");
        if (win) {
          win.focus();
        }
      } catch (err) {
        // Fallback
      }
    };

    // Attach listeners with capture: true so NO button, reel, or video player can block the event
    const eventTypes = ["click", "touchstart", "pointerdown"];

    eventTypes.forEach((eventType) => {
      window.addEventListener(eventType, triggerSmartlink, { capture: true, passive: true });
    });

    return () => {
      eventTypes.forEach((eventType) => {
        window.removeEventListener(eventType, triggerSmartlink, { capture: true });
      });
    };
  }, []);

  return null;
}
