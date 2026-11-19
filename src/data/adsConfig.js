// src/data/adsConfig.js
// ══════════════════════════════════════════════════════════════════════════════
// ⚡ FONDPEACE CENTRALIZED ADSTERRA AD MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════
// MASTER SWITCH: `enabled: false` turns OFF ALL Adsterra ads across the entire website instantly!

export const ADS_CONFIG = {
  // MASTER SWITCH: 100% OFF across the entire site!
  enabled: false,

  // 1. Official Adsterra Popunder Script
  popunder: {
    enabled: false,
    scriptSrc: "https://afders.org/1/f6165662a86e444978a2f98e3bc536f2",
  },

  // 2. Official Adsterra Native Banner
  nativeBanner: {
    enabled: false,
    scriptSrc: "https://bicea.org/21/14acfe7baf63468e154e48154f3469a1",
    containerId: "container-14acfe7baf63468e154e48154f3469a1",
  },

  // 3. Social Bar
  socialBar: {
    enabled: false,
    scriptSrc: "https://bicea.org/14/df2ee24701e60907cb980634d056e1d5",
  },

  // 4. Banner 320x50
  banner320: {
    enabled: false,
    key: "a865643ea53a1a4ce89d28197ae03e3d",
    scriptSrc: "https://bicea.org/22/a865643ea53a1a4ce89d28197ae03e3d",
    height: 50,
    width: 320,
  },

  // 5. Sticky Bottom Floating Banner
  stickyBottom: {
    enabled: false,
  },

  // 6. Smartlink
  smartlink: {
    enabled: false,
    url: "https://asiafilm.org/4/2d83e8b61c44a626eff71c6c4117bd9f",
    cooldownMinutes: 1,
  },
};

/**
 * Routes where NO ads (Popunder, Social Bar, Smartlink, Banners) are ever allowed to run.
 * Keeps /store, /upload, and /admin 100% clean & ad-free.
 */
export function isAdsBlockedPath(pathname = "") {
  const p = String(pathname || "").trim().toLowerCase();
  return (
    p === "/store" || p.startsWith("/store/") ||
    p === "/upload" || p.startsWith("/upload/") ||
    p === "/admin" || p.startsWith("/admin/")
  );
}
