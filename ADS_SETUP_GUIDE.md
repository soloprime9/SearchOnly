# ⚡ FondPeace Adsterra Ads Setup & Control Guide

This guide documents the centralized Adsterra monetization setup across **FondPeace.com**, including how to turn off or remove ads in seconds without touching multiple files.

---

## 🎛️ 1. Master Switch: How to Turn Off All Ads (1-Second Killswitch)

All ads on the website are controlled from a single configuration file:
👉 **`src/data/adsConfig.js`**

### To Turn OFF All Ads Instantly:
Open `src/data/adsConfig.js` and change `enabled: true` to `false`:
```javascript
export const ADS_CONFIG = {
  enabled: false, // 🛑 Set to false to instantly shut down all ads site-wide!
  ...
};
```
That's it! When `enabled: false`, zero scripts will load, zero banners will render, and zero redirects will trigger.

---

## ⚙️ 2. Individual Ad Unit Controls

In `src/data/adsConfig.js`, you can also toggle individual ad units independently:

```javascript
export const ADS_CONFIG = {
  enabled: true,

  // 1. Social Bar (Interactive Push/Alert Bar across all pages)
  socialBar: {
    enabled: true, // Set false to disable only the Social Bar
    scriptSrc: "https://bicea.org/14/df2ee24701e60907cb980634d056e1d5",
  },

  // 2. Mobile/In-Feed Banner (320x50)
  banner320: {
    enabled: true, // Set false to disable only the 320x50 banner
    key: "a865643ea53a1a4ce89d28197ae03e3d",
    scriptSrc: "https://bicea.org/22/a865643ea53a1a4ce89d28197ae03e3d",
    height: 50,
    width: 320,
  },

  // 3. Smartlink (Click Redirection)
  smartlink: {
    enabled: true, // Set false to disable click redirects
    url: "https://asiafilm.org/4/2d83e8b61c44a626eff71c6c4117bd9f",
    cooldownMinutes: 5, // Cooldown in minutes before opening again on click
  },
};
```

---

## 📁 3. Where Everything Lives in the Codebase

All monetization code is cleanly isolated inside dedicated components:

| Feature | Component / File Path | Mounted At |
|---|---|---|
| **Central Config** | `src/data/adsConfig.js` | Imported by all ad components |
| **Social Bar** | `src/components/ads/AdsterraSocialBar.jsx` | `src/app/layout.js` (Global) |
| **Smartlink Click Trigger** | `src/components/ads/SmartlinkTrigger.jsx` | `src/app/layout.js` (Global) |
| **Banner 320x50** | `src/components/ads/AdsterraBanner320.jsx` | `src/components/Village.jsx` (Home Feed at post 4) & `src/app/post/[id]/page.jsx` (Single Post) |

---

## 🗑️ 4. How to Completely Remove Ads in the Future

If you ever want to completely delete ads from the codebase:

1. **Delete the directory:** `src/components/ads/`
2. **Delete the config:** `src/data/adsConfig.js`
3. **In `src/app/layout.js`:** Remove `<AdsterraSocialBar />` and `<SmartlinkTrigger />` (and their imports).
4. **In `src/components/Village.jsx`:** Remove `<AdsterraBanner320 />` at post 4.
5. **In `src/app/post/[id]/page.jsx`:** Remove `<AdsterraBanner320 />`.

---

## 🛡️ Safety & Anti-Ban Features
- **Frequency Capping:** The Smartlink click trigger includes a 5-minute cooldown timer stored in browser storage. This prevents rapid popup triggers that cause Adsterra fraud penalties or Chrome popup blocks.
- **Zero Layout Shift:** The 320x50 banner container has fixed `min-height: 50px` to maintain Google Core Web Vitals and prevent screen jumping.
- **Store & Studio Protected:** Commercial checkout at `/store` and creation studio at `/create` remain clean and distraction-free.
