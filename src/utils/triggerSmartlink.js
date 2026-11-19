import { ADS_CONFIG, isAdsBlockedPath } from "@/data/adsConfig";

export function fireSmartlinkRedirect(force = false) {
  if (typeof window === "undefined") return;
  if (isAdsBlockedPath(window.location.pathname)) return;
  if (!ADS_CONFIG.enabled || !ADS_CONFIG.smartlink.enabled) return;

  const url = ADS_CONFIG.smartlink.url;
  if (!url) return;

  const STORAGE_KEY = "fondpeace_sl_timestamp";
  const cooldownMs = (ADS_CONFIG.smartlink.cooldownMinutes || 1) * 60 * 1000;

  if (!force) {
    try {
      const last = sessionStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      if (last && now - Number(last) < cooldownMs) {
        return;
      }
      sessionStorage.setItem(STORAGE_KEY, String(now));
    } catch (e) {}
  }

  try {
    // Open sponsor smartlink in background new tab so user never loses their FondPeace page
    window.open(url, "_blank");
  } catch (err) {
    /* noop */
  }
}
