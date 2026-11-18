// src/data/adsConfig.js
// ══════════════════════════════════════════════════════════════════════════════
// ⚡ FONDPEACE CENTRALIZED ADSTERRA AD MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════
// In future, if you ever want to turn off, pause, or remove ads,
// simply change `enabled: false` below. That turns off all ads instantly!

export const ADS_CONFIG = {
  // MASTER SWITCH: Change `enabled: false` to instantly turn OFF ALL Adsterra ads across the entire website!
  enabled: true,

  // 1. Official Adsterra Popunder Script (Highest CPM — automatic multi-device background tab on click)
  popunder: {
    enabled: true,
    scriptSrc: "https://afders.org/1/f6165662a86e444978a2f98e3bc536f2",
  },

  // 2. Official Adsterra Native Banner (High CPM rich native recommendation cards)
  nativeBanner: {
    enabled: true,
    scriptSrc: "https://bicea.org/21/14acfe7baf63468e154e48154f3469a1",
    containerId: "container-14acfe7baf63468e154e48154f3469a1",
  },

  // 3. Social Bar (Highest CTR/CPM interactive push/chat bar across all pages)
  socialBar: {
    enabled: true,
    scriptSrc: "https://bicea.org/14/df2ee24701e60907cb980634d056e1d5",
  },

  // 4. Banner 320x50 (Standard Mobile/Desktop Banner)
  banner320: {
    enabled: true,
    key: "a865643ea53a1a4ce89d28197ae03e3d",
    scriptSrc: "https://bicea.org/22/a865643ea53a1a4ce89d28197ae03e3d",
    height: 50,
    width: 320,
  },

  // 5. Smartlink (Direct high-payout sponsor URL on interaction)
  smartlink: {
    enabled: true,
    url: "https://asiafilm.org/4/2d83e8b61c44a626eff71c6c4117bd9f",
    cooldownMinutes: 1,
  },
};
