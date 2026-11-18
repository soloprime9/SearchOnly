import { STORE_PRODUCTS } from "@/data/storeProducts";
import { shouldIndexPost } from "@/utils/indexGate";

const SITE_URL = "https://www.fondpeace.com";
const API_BASE = "https://backendk-z915.onrender.com";

export const revalidate = 3600; // 1 hour cache revalidation

export default async function sitemap() {
  // 1. Static Core Platform Pages & Real Live Store Product Pages
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
      changeFrequency: "always",
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

  // 2. Fetch Live Dynamic Post URLs & Video URLs from Backend API
  let dynamicRoutes = [];
  try {
    const fetchOptions = {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(45000), // 45s tolerance for Render cold starts
    };

    const [allRes, videoRes] = await Promise.all([
      fetch(`${API_BASE}/post/all-ids`, fetchOptions),
      fetch(`${API_BASE}/post/video/getall`, fetchOptions),
    ]);

    const allPosts = allRes.ok ? await allRes.json() : [];
    const videoPosts = videoRes.ok ? await videoRes.json() : [];

    const videoIdSet = new Set(
      (Array.isArray(videoPosts) ? videoPosts : [])
        .filter((v) => v?._id)
        .map((v) => String(v._id))
    );

    // Map clean, index-gate-passing videos strictly to canonical single video watch page: /short/[id]
    const videoRoutes = (Array.isArray(videoPosts) ? videoPosts : [])
      .filter((v) => shouldIndexPost(v))
      .map((v) => ({
        url: `${SITE_URL}/short/${v._id}`,
        lastModified: new Date(v.updatedAt || v.createdAt || Date.now()),
        changeFrequency: "weekly",
        priority: 0.85,
      }));

    // Map clean, index-gate-passing non-videos strictly to post page: /post/[id]
    const postRoutes = (Array.isArray(allPosts) ? allPosts : [])
      .filter((p) => {
        if (!p?._id || videoIdSet.has(String(p._id))) return false;
        if (typeof p.title === "string") return shouldIndexPost(p);
        return true;
      })
      .map((p) => ({
        url: `${SITE_URL}/post/${p._id}`,
        lastModified: new Date(p.updatedAt || p.createdAt || Date.now()),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    dynamicRoutes = [...videoRoutes, ...postRoutes];
  } catch (err) {
    console.error("Sitemap dynamic post fetch fallback:", err.message);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
