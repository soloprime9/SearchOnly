import { STORE_PRODUCTS } from "@/data/storeProducts";

const SITE_URL = "https://www.fondpeace.com";
const CORE_UPDATED_AT = new Date("2026-11-27T00:00:00.000Z");

export const revalidate = 3600;

/**
 * Core-only sitemap: contains only FondPeace's primary landing, store, creator, and policy pages.
 * Individual /post/[id] pages are discovered naturally via the homepage feed, topic hubs, and related post links.
 */
export default function sitemap() {
  const storeProductRoutes = (Array.isArray(STORE_PRODUCTS) ? STORE_PRODUCTS : [])
    .filter((p) => p?.slug || p?.id)
    .map((p) => ({
      url: `${SITE_URL}/store/${p.slug || p.id}`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 0.85,
    }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
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
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/aboutus`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contactus`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacypolicy`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/termcondition`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/disclaimer`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/DMCA`,
      lastModified: CORE_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
''