import { STORE_PRODUCTS } from "@/data/storeProducts";
import { fetchApiRead } from "@/utils/apiConfig";
import { isPlayableShortPost } from "@/utils/postMediaUtils";
import { isBlockedAdultOrSpam } from "@/utils/uploadModeration";

const SITE_URL = "https://www.fondpeace.com";

export const revalidate = 3600;

function hasQualityIndexableTitle(post) {
  if (!post?._id || isBlockedAdultOrSpam(post)) return false;
  const cleanTitle = String(post.title || "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/#[\w\u0590-\u05ff\u0900-\u097f]+/g, "")
    .trim();
  const cleanDesc = String(post.description || "").trim();
  const combinedWords = `${cleanTitle} ${cleanDesc}`.trim().split(/\s+/).filter(Boolean);
  return combinedWords.length >= 3;
}

export default async function sitemap() {
  const storeProductRoutes = (Array.isArray(STORE_PRODUCTS) ? STORE_PRODUCTS : [])
    .filter((p) => p?.slug || p?.id)
    .map((p) => ({
      url: `${SITE_URL}/store/${p.slug || p.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

  const staticRoutes = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shorts`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/store`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...storeProductRoutes,
    {
      url: `${SITE_URL}/monetization`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/aboutus`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contactus`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacypolicy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/termcondition`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/DMCA`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const dynamicRoutes = [];
  const seenTitles = new Set();

  try {
    const res = await fetchApiRead(`/post/all-ids`, {
      fetchOptions: { next: { revalidate: 3600 } },
      timeoutMs: 15000,
    });

    if (res?.ok) {
      const allPosts = await res.json();
      if (Array.isArray(allPosts)) {
        const totalFeedPages = Math.min(5, Math.max(1, Math.ceil(allPosts.length / 20)));
        for (let p = 2; p <= totalFeedPages; p++) {
          dynamicRoutes.push({
            url: `${SITE_URL}/feed/${p}`,
            lastModified: new Date(),
            changeFrequency: "hourly",
            priority: 0.75,
          });
        }

        for (const post of allPosts) {
          if (!hasQualityIndexableTitle(post)) continue;

          const normTitle = String(post.title || "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
          if (normTitle && seenTitles.has(normTitle)) continue;
          if (normTitle) seenTitles.add(normTitle);

          const isShort = isPlayableShortPost(post);
          dynamicRoutes.push({
            url: `${SITE_URL}/${isShort ? "short" : "post"}/${post._id}`,
            lastModified: new Date(post.createdAt || post.updatedAt || Date.now()),
            changeFrequency: "weekly",
            priority: isShort ? 0.85 : 0.8,
          });
        }
      }
    }
  } catch (err) {
    console.error("Sitemap fetch fallback (returning core routes):", err?.message);
  }

  return [...staticRoutes, ...dynamicRoutes];
}

