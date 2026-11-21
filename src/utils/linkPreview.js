import axios from "axios";
import { getApiBase } from "./apiConfig";

export function sanitizeLinkUrl(raw) {
  if (!raw || typeof raw !== "string") return "";
  let clean = raw.trim();
  // If user pasted over an existing URL or got a double URL string, pick the last complete URL
  const urls = clean.match(/https?:\/\/[^\s"'<>!]+/gi);
  if (urls && urls.length > 0) {
    clean = urls[urls.length - 1];
  } else if (!/^https?:\/\//i.test(clean)) {
    clean = `https://${clean}`;
  }
  clean = clean.replace(/[\\]+$/, "").replace(/[),;.]+$/, "");
  return clean;
}

export function getFallbackLinkPreview(rawUrl) {
  const url = sanitizeLinkUrl(rawUrl);
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./i, "");
    const parts = host.split(".");
    const brand = parts.length > 1 ? parts[parts.length - 2].toUpperCase() : host;

    // Build title from pathname slug
    const pathParts = parsed.pathname.split("/").filter((p) => Boolean(p) && !/^(news|p|post|article|story|status|posts)$/i.test(p));
    let title = "";
    if (pathParts.length > 0) {
      const last = pathParts[pathParts.length - 1].replace(/\.(html?|php|aspx?)$/i, "");
      title = last.replace(/[-_+]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
    }
    if (!title || title.length < 3) {
      title = `${brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase()} Link`;
    }

    return {
      url,
      title,
      description: `View content and updates directly from ${host}`,
      image: "",
      siteName: brand,
      domain: host,
      favicon: `https://www.google.com/s2/favicons?domain=${host}&sz=128`,
    };
  } catch (_) {
    return {
      url,
      title: "External Link",
      description: "Click to visit this link on the web",
      image: "",
      siteName: "Web",
      domain: "web",
      favicon: "",
    };
  }
}

export async function fetchLinkPreview(rawUrl) {
  const clean = sanitizeLinkUrl(rawUrl);
  if (!clean) return null;

  // 1. Try local fast Next.js API route (/api/link-preview)
  try {
    const localRes = await axios.get(`/api/link-preview?url=${encodeURIComponent(clean)}`, {
      timeout: 7000,
    });
    if (localRes.data?.success && localRes.data?.preview) {
      return localRes.data.preview;
    }
  } catch (_) {
    // proceed to backend fallback
  }

  // 2. Fallback to BackendK (/post/preview/link)
  try {
    const API = getApiBase();
    const remoteRes = await axios.get(`${API}/post/preview/link?url=${encodeURIComponent(clean)}`, {
      timeout: 8000,
    });
    if (remoteRes.data?.success && remoteRes.data?.preview) {
      return remoteRes.data.preview;
    }
  } catch (_) {
    // proceed to client fallback
  }

  // 3. Fallback client-side generator (never leaves the user stranded with blank UI)
  return getFallbackLinkPreview(clean);
}
