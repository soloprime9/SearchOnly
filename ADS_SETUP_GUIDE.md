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
That's it! When `enabled: false`, zero scripts will load, zero banners will render, zero popunders will inject, and zero redirects will trigger.

---

## ⚙️ 2. Active Ad Units & Central Configuration

In `src/data/adsConfig.js`, you can configure and toggle each ad unit independently:

```javascript
export const ADS_CONFIG = {
  enabled: true,

  // 1. Official Adsterra Popunder Script (Automatic background tab on tap/click)
  popunder: {
    enabled: true,
    scriptSrc: "https://afders.org/1/f6165662a86e444978a2f98e3bc536f2",
  },

  // 2. Official Adsterra Native Banner (Large, rich sponsored recommendation cards)
  nativeBanner: {
    enabled: true,
    scriptSrc: "https://bicea.org/21/14acfe7baf63468e154e48154f3469a1",
    containerId: "container-14acfe7baf63468e154e48154f3469a1",
  },

  // 3. Social Bar (Interactive Push/Alert Bar across all pages)
  socialBar: {
    enabled: true,
    scriptSrc: "https://bicea.org/14/df2ee24701e60907cb980634d056e1d5",
  },

  // 4. Banner 320x50 (Standard Mobile Banner)
  banner320: {
    enabled: true,
    key: "a865643ea53a1a4ce89d28197ae03e3d",
    scriptSrc: "https://bicea.org/22/a865643ea53a1a4ce89d28197ae03e3d",
    height: 50,
    width: 320,
  },

  // 5. Smartlink (Direct high-payout sponsor redirect)
  smartlink: {
    enabled: true,
    url: "https://asiafilm.org/4/2d83e8b61c44a626eff71c6c4117bd9f",
    cooldownMinutes: 1,
  },
};
```

---

## 📁 3. Where Everything Lives in the Codebase

All monetization code is cleanly isolated inside dedicated components:

| Feature | Component / File Path | Mounted At |
|---|---|---|
| **Central Config** | `src/data/adsConfig.js` | Imported by all ad components |
| **Official Popunder** | `src/components/ads/AdsterraPopunder.jsx` | `src/app/layout.js` (Global) |
| **Social Bar** | `src/components/ads/AdsterraSocialBar.jsx` | `src/app/layout.js` (Global) |
| **Smartlink Click Trigger** | `src/components/ads/SmartlinkTrigger.jsx` | `src/app/layout.js` (Global) & `src/components/ReelsFeed.jsx` |
| **Native Banner Card** | `src/components/ads/AdsterraNativeBanner.jsx` | `src/components/Village.jsx` (Post Feed) & `src/app/post/[id]/page.jsx` |
| **Banner 320x50** | `src/components/ads/AdsterraBanner320.jsx` | `src/components/Village.jsx` (Top ATF) & `src/app/post/[id]/page.jsx` |

---

## ⚠️ 4. Adsterra Dashboard Status Notice: "Inactive" Units

In your Adsterra Publisher Dashboard (`beta.publishers.adsterra.com/websites`):
- `Popunder` (ID: 27584821) and `Native Banner` (ID: 27584834) are showing **`Inactive`** with a red **`↻ RESUBMIT`** button.
- **Action Required in Adsterra:** Click **`↻ RESUBMIT`** next to both units in your dashboard. Adsterra will activate them within minutes so ads render on your site.
- The 6 new banners (`300x250`, `728x90`, etc.) and `Social Bar` are already **`Active`**.

---

## 🗑️ 5. How to Completely Remove Ads in the Future

If you ever want to completely delete ads from the codebase:

1. **Delete the directory:** `src/components/ads/`
2. **Delete the config:** `src/data/adsConfig.js`
3. **In `src/app/layout.js`:** Remove `<AdsterraSocialBar />`, `<AdsterraPopunder />`, and `<SmartlinkTrigger />`.
4. **In `src/components/Village.jsx`:** Remove `<AdsterraBanner320 />` and `<AdsterraNativeBanner />`.
5. **In `src/app/post/[id]/page.jsx`:** Remove `<AdsterraBanner320 />` and `<AdsterraNativeBanner />`.

---

## 🛡️ Safety & Anti-Ban Features
- **Frequency Capping:** Avoids rapid repeated pops that trigger browser blocks.
- **Zero Layout Shift:** Banner containers have fixed minimum heights to maintain Google Core Web Vitals.
- **Store & Studio Protected:** Commercial checkout at `/store` and creation studio at `/create` remain clean and distraction-free.
