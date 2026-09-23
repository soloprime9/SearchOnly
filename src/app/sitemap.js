const SITE_URL = "https://www.fondpeace.com";
const API_BASE = "https://backend-k.vercel.app";

export const revalidate = 3600; // 1 hour cache revalidation

export default async function sitemap() {
  // 1. Static Core Platform Pages
  const staticRoutes = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
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
    const [allRes, videoRes] = await Promise.all([
      fetch(`${API_BASE}/post/all-ids`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/post/video/getall`, { next: { revalidate: 3600 } }),
    ]);

    const allPosts = allRes.ok ? await allRes.json() : [];
    const videoPosts = videoRes.ok ? await videoRes.json() : [];

    const videoIdSet = new Set(
      (Array.isArray(videoPosts) ? videoPosts : [])
        .filter((v) => v?._id)
        .map((v) => String(v._id))
    );

    // Map videos strictly to canonical watch page: /short/[id]
    const videoRoutes = (Array.isArray(videoPosts) ? videoPosts : [])
      .filter((v) => v?._id)
      .map((v) => ({
        url: `${SITE_URL}/short/${v._id}`,
        lastModified: new Date(v.updatedAt || v.createdAt || Date.now()),
        changeFrequency: "weekly",
        priority: 0.85,
      }));

    // Map non-videos strictly to post page: /post/[id]
    const postRoutes = (Array.isArray(allPosts) ? allPosts : [])
      .filter((p) => p?._id && !videoIdSet.has(String(p._id)))
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
