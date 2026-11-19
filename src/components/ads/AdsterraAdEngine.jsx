"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { ADS_CONFIG, isAdsBlockedPath } from "@/data/adsConfig";
import StickyBottomBanner from "./StickyBottomBanner";
import SmartlinkTrigger from "./SmartlinkTrigger";

/**
 * ⚡ FONDPEACE MASTER ADSTERRA ENGINE
 * Single unified wrapper for all global monetization.
 * To disable ALL ads across the entire website:
 * change `ADS_CONFIG.enabled = false` in src/data/adsConfig.js
 * OR remove this single <AdsterraAdEngine /> component from layout.js!
 *
 * Protected routes (/store, /upload, /admin) are strictly 100% ad-free.
 */
export default function AdsterraAdEngine() {
  const pathname = usePathname();
  const blocked = isAdsBlockedPath(pathname);

  // If master switch is OFF, or route is blocked, render ZERO ads!
  if (!ADS_CONFIG.enabled || blocked) {
    return null;
  }

  return (
    <>
      {/* 1. Official Adsterra Popunder Script (Highest CPM format) */}
      {ADS_CONFIG.popunder?.enabled && (
        <Script
          id="adsterra-popunder"
          strategy="afterInteractive"
          src={ADS_CONFIG.popunder.scriptSrc}
          data-cfasync="false"
        />
      )}

      {/* 2. Official Adsterra Social Bar (Highest CTR floating push/chat format) */}
      {ADS_CONFIG.socialBar?.enabled && (
        <Script
          id="adsterra-social-bar"
          strategy="afterInteractive"
          src={ADS_CONFIG.socialBar.scriptSrc}
          data-cfasync="false"
        />
      )}

      {/* 3. Smartlink Interaction Trigger */}
      <SmartlinkTrigger />

      {/* 4. High-Impression Sticky Bottom Floating Banner (Mobile & Desktop) */}
      <StickyBottomBanner />
    </>
  );
}
