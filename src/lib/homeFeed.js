import { fetchApiRead } from "@/utils/apiConfig";

export const PAGE_LIMIT = 20;
export const VALID_TYPES = new Set(["all", "video", "image", "discussion", "poll", "link"]);

export function normalizeFeedType(rawType) {
  const val = typeof rawType === "string" ? rawType.trim().toLowerCase() : "all";
  return VALID_TYPES.has(val) ? val : "all";
}

export function buildFeedHref(page = 1, type = "all") {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeType = normalizeFeedType(type);
  const params = new URLSearchParams();
  if (safePage > 1) params.set("page", String(safePage));
  if (safeType !== "all") params.set("type", safeType);
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export async function fetchHomeFeed({ page = 1, limit = PAGE_LIMIT, type = "all" } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeType = normalizeFeedType(type);
  const typeParam = safeType !== "all" ? `&type=${encodeURIComponent(safeType)}` : "";
  const primaryPath = `/fondpeace/feed?page=${safePage}&limit=${limit}${typeParam}`;

  try {
    const res = await fetchApiRead(primaryPath, {
      fetchOptions: { next: { revalidate: 30 } },
      timeoutMs: 12000,
    });

    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return {
          posts: data,
          hasMore: data.length >= limit,
          totalPages: safePage + (data.length >= limit ? 1 : 0),
          totalPosts: data.length,
          fetchOk: true,
        };
      }
      if (Array.isArray(data?.posts)) {
        return {
          posts: data.posts,
          hasMore: Boolean(data.hasMore),
          totalPages: Number(data.totalPages) || 1,
          totalPosts: Number(data.totalPosts) || data.posts.length,
          fetchOk: true,
        };
      }
    }
  } catch (_) {}

  // Fallback only if /fondpeace/feed is unavailable on origin
  try {
    const fallbackPath = `/post/mango/getall?page=${safePage}&limit=${limit}${typeParam}`;
    const res = await fetchApiRead(fallbackPath, {
      fetchOptions: { next: { revalidate: 30 } },
      timeoutMs: 12000,
    });
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return {
          posts: data,
          hasMore: data.length >= limit,
          totalPages: safePage + (data.length >= limit ? 1 : 0),
          totalPosts: data.length,
          fetchOk: true,
        };
      }
    }
  } catch (_) {}

  return { posts: [], hasMore: false, totalPages: 1, totalPosts: 0, fetchOk: false };
}

export function buildHomeMetadata({ page = 1, type = "all" } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeType = normalizeFeedType(type);
  const isFiltered = safeType !== "all" || safePage > 1;
  const canonicalUrl = "https://www.fondpeace.com";

  const title =
    safePage > 1
      ? `FondPeace - Latest Community Posts & Videos (Page ${safePage})`
      : "FondPeace - Modern Community & Creator Platform";

  return {
    title,
    description:
      "FondPeace is an upgraded independent platform for thoughtful discussions, trending creator videos, photography, and meaningful community conversations.",
    keywords: [
      "FondPeace",
      "Trending Videos",
      "Community Discussions",
      "Creator Platform",
      "Viral Posts",
      "Creator Monetization",
    ],
    authors: [{ name: "Aman Kumar" }],
    robots: isFiltered ? { index: false, follow: true } : { index: true, follow: true },
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      siteName: "FondPeace",
      title: safePage > 1 ? title : "FondPeace - Community & Creators",
      description:
        "Join FondPeace to discover meaningful discussions, creator videos, and authentic community conversations.",
      url: canonicalUrl,
      images: [
        {
          url: "https://www.fondpeace.com/FondPeace-1200x630.jpg",
          width: 1200,
          height: 630,
          alt: "FondPeace community platform",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "FondPeace",
      description:
        "FondPeace is a modern platform for discussions, ideas, trending videos, and creator growth.",
      images: ["https://www.fondpeace.com/FondPeace-1200x630.jpg"],
    },
  };
}
