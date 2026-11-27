const SITE_URL = "https://www.fondpeace.com";
const CORE_UPDATED_AT = new Date("2026-11-27T00:00:00.000Z");

export const revalidate = 3600;

/**
 * Core-only sitemap: contains FondPeace's 9 primary landing, store hub, creator, and policy pages.
 * Store product pages (/store/[id]), posts (/post/[id]), topics, and profiles are discovered via internal links.
 */
export default function sitemap() {
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
