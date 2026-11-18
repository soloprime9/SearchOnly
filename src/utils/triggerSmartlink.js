import { ADS_CONFIG } from "@/data/adsConfig";

export function fireSmartlinkRedirect(force = false) {
  if (typeof window === "undefined") return;
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
    // Try opening in new window/tab
    const win = window.open(url, "_blank");
    // If popup was blocked by mobile browser (win is null or undefined), redirect directly!
    if (!win || win.closed || typeof win.closed === "undefined") {
      window.location.href = url;
    }
  } catch (err) {
    window.location.href = url;
  }
}
