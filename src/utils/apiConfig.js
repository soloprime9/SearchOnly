const RENDER_API = "https://backendk-z915.onrender.com";
const VERCEL_API = "https://backend-k.vercel.app";

export const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return RENDER_API;
};

export const API_BASE = getApiBase();

/**
 * Returns ordered, deduplicated backend origins for resilient SSR & read requests.
 * Keeps Render primary (warm keep-alive) with automatic failover to Vercel serverless.
 */
export const getReadApiBases = () => {
  const candidates = [getApiBase(), VERCEL_API, RENDER_API]
    .filter(Boolean)
    .map((u) => String(u).replace(/\/+$/, ""));
  return [...new Set(candidates)];
};

/**
 * Fetches a read-only GET path with automatic failover across healthy backend origins.
 * Immediately returns authoritative 2xx, 400, or 404 responses without wasting failover retries.
 */
export async function fetchApiRead(path, { fetchOptions = {}, timeoutMs = 15000 } = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const bases = getReadApiBases();
  let lastRes = null;

  for (const base of bases) {
    try {
      const options = { ...fetchOptions };
      if (!options.signal) {
        options.signal = AbortSignal.timeout(timeoutMs);
      }
      const res = await fetch(`${base}${cleanPath}`, options);
      if (res.ok || res.status === 400 || res.status === 404) {
        return res;
      }
      lastRes = res;
    } catch (_) {
      // Fail over to next origin on cold-start timeout or network failure
    }
  }

  return lastRes;
}

export const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  try {
    const token = localStorage.getItem("token");
    return token ? { "x-auth-token": token, "Authorization": `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};
