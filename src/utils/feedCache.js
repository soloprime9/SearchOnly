/**
 * 🚀 In-Memory + SessionStorage Feed Cache & Navigation State Engine
 * Implements Instagram/Twitter-style feed retention:
 * - Keeps loaded posts, pagination cursor, filters, and exact scroll position
 * - Restores instantly (0ms) on browser Back navigation from /post/[id] or /shorts/[id]
 * - Eliminates blank white/black flashes and unwanted feed resets
 */

const STORAGE_KEY = "fondpeace_feed_cache_v2";

// Module-level in-memory singleton (persists across client-side SPA route transitions)
let memoryFeedCache = null;

export function getFeedCache() {
  if (typeof window === "undefined") return null;

  // 1. Check in-memory singleton first (instant 0ms object reference)
  if (memoryFeedCache && Array.isArray(memoryFeedCache.posts) && memoryFeedCache.posts.length > 0) {
    // Valid for 30 minutes
    if (Date.now() - (memoryFeedCache.timestamp || 0) < 30 * 60 * 1000) {
      return memoryFeedCache;
    }
  }

  // 2. Fallback to sessionStorage if page was reloaded
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.posts) && parsed.posts.length > 0) {
        if (Date.now() - (parsed.timestamp || 0) < 30 * 60 * 1000) {
          memoryFeedCache = parsed;
          return memoryFeedCache;
        }
      }
    }
  } catch (_) {}

  return null;
}

export function saveFeedCache(state) {
  if (typeof window === "undefined") return;
  if (!state || !Array.isArray(state.posts) || state.posts.length === 0) return;

  const currentScroll =
    state.scrollY !== undefined
      ? state.scrollY
      : window.scrollY || document.documentElement.scrollTop || 0;

  const payload = {
    posts: state.posts.slice(0, 60), // Keep up to 60 posts in cache
    page: state.page || 1,
    activeTab: state.activeTab || "foryou",
    categoryFilter: state.categoryFilter || "All",
    mediaTypeFilter: state.mediaTypeFilter || "all",
    scrollY: currentScroll,
    hasMore: state.hasMore !== undefined ? state.hasMore : true,
    timestamp: Date.now(),
  };

  memoryFeedCache = payload;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (_) {}
}

export function updateFeedScroll(scrollY) {
  if (typeof window === "undefined") return;
  const pos =
    scrollY !== undefined
      ? scrollY
      : window.scrollY || document.documentElement.scrollTop || 0;

  if (memoryFeedCache) {
    memoryFeedCache.scrollY = pos;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.scrollY = pos;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch (_) {}
}

export function clearFeedCache() {
  memoryFeedCache = null;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }
}
