// src/data/adsConfig.js
// ══════════════════════════════════════════════════════════════════════════════
// ⚡ FONDPEACE CENTRALIZED ADSTERRA AD MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════
// In future, if you ever want to turn off, pause, or remove ads,
// simply change `enabled: false` below. That turns off all ads instantly!

export const ADS_CONFIG = {
  // MASTER SWITCH: Set to false to instantly turn off all ads across the entire website
  enabled: true,

  // 1. Social Bar (High CPM interactive push/chat bar across all pages)
  socialBar: {
    enabled: true,
    scriptSrc: "https://bicea.org/14/df2ee24701e60907cb980634d056e1d5",
  },

  // 2. Banner 320x50 (Standard Mobile & In-Feed Banner)
  banner320: {
    enabled: true,
    key: "a865643ea53a1a4ce89d28197ae03e3d",
    scriptSrc: "https://bicea.org/22/a865643ea53a1a4ce89d28197ae03e3d",
    height: 50,
    width: 320,
  },

  // 3. Smartlink (Opens high-paying sponsor offer in new tab on user clicks)
  smartlink: {
    enabled: true,
    url: "https://asiafilm.org/4/2d83e8b61c44a626eff71c6c4117bd9f",
    // Cooldown in minutes before opening again on interaction (set to 1 for high trigger rate)
    cooldownMinutes: 1,
  },
};
