"use client";

import { useEffect, useState } from "react";
import { ADS_CONFIG } from "@/data/adsConfig";

export default function SmartlinkTrigger() {
  const [overlayActive, setOverlayActive] = useState(true);

  useEffect(() => {
    if (!ADS_CONFIG.enabled || !ADS_CONFIG.smartlink.enabled) {
      setOverlayActive(false);
      return;
    }

    const STORAGE_KEY = "fondpeace_sl_triggered";
    const cooldownMs = (ADS_CONFIG.smartlink.cooldownMinutes || 1) * 60 * 1000;

    const shouldTrigger = () => {
      try {
        const last = sessionStorage.getItem(STORAGE_KEY);
        if (last && Date.now() - Number(last) < cooldownMs) {
          return false;
        }
        return true;
      } catch (e) {
        return true;
      }
    };

    const fireSmartlink = () => {
      try {
        sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
        setOverlayActive(false);

        // Open in new background tab synchronously with user gesture
        const win = window.open(ADS_CONFIG.smartlink.url, "_blank");
        if (win) {
          win.focus();
        }
      } catch (err) {
        // Fallback
      }
    };

    // 1. Invisible First-Touch Handler across document
    const handleFirstGesture = (e) => {
      if (!shouldTrigger()) {
        setOverlayActive(false);
        return;
      }
      fireSmartlink();
    };

    // 2. Back Button / Exit Intent Handler
    // When a user lands from social media and tries to press "Back" to exit without doing anything:
    try {
      window.history.pushState({ fp_ad: 1 }, "", window.location.href);
      const handlePopState = (e) => {
        if (ADS_CONFIG.enabled && ADS_CONFIG.smartlink.enabled) {
          window.location.href = ADS_CONFIG.smartlink.url;
        }
      };
      window.addEventListener("popstate", handlePopState, { once: true });
    } catch (e) {}

    // Global capture listeners
    const events = ["click", "touchstart", "pointerdown"];
    events.forEach((ev) => {
      window.addEventListener(ev, handleFirstGesture, { capture: true, passive: true });
    });

    return () => {
      events.forEach((ev) => {
        window.removeEventListener(ev, handleFirstGesture, { capture: true });
      });
    };
  }, []);

  if (!overlayActive || !ADS_CONFIG.enabled || !ADS_CONFIG.smartlink.enabled) {
    return null;
  }

  // Transparent full-screen overlay for the very first interaction
  return (
    <div
      id="fondpeace-touch-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        background: "transparent",
        cursor: "default",
      }}
      onClick={() => {
        try {
          sessionStorage.setItem("fondpeace_sl_triggered", String(Date.now()));
          setOverlayActive(false);
          window.open(ADS_CONFIG.smartlink.url, "_blank");
        } catch (e) {}
      }}
      onTouchStart={() => {
        try {
          sessionStorage.setItem("fondpeace_sl_triggered", String(Date.now()));
          setOverlayActive(false);
          window.open(ADS_CONFIG.smartlink.url, "_blank");
        } catch (e) {}
      }}
    />
  );
}
