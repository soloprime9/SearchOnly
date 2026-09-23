import { NextResponse } from "next/server";

const API_BASE = "https://backend-k.vercel.app";
const SITE_URL = "https://www.fondpeace.com";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all posts and all video posts in parallel to strictly eliminate redirect loops
    const [allRes, videoRes] = await Promise.all([
      fetch(`${API_BASE}/post/all-ids`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/post/video/getall`, { next: { revalidate: 3600 } }),
    ]);

    const allPosts = allRes.ok ? await allRes.json() : [];
    const videoPosts = videoRes.ok ? await videoRes.json() : [];

    if (!Array.isArray(allPosts)) {
      return new NextResponse("Invalid data", { status: 500 });
    }

    // Set of all video IDs to exclude from post-sitemap.xml
    const videoIdSet = new Set(
      (Array.isArray(videoPosts) ? videoPosts : [])
        .filter((v) => v?._id)
        .map((v) => String(v._id))
    );

    // Filter to ONLY non-video posts (Discussions, Articles, Photos, Polls)
    // Every single URL here will return direct HTTP 200 OK with 0 redirects!
    const cleanNonVideoPosts = allPosts.filter(
      (p) => p?._id && !videoIdSet.has(String(p._id))
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${cleanNonVideoPosts
  .map((post) => {
    return `  <url>
    <loc>${SITE_URL}/post/${post._id}</loc>
    <lastmod>${new Date(
      post.updatedAt || post.createdAt || Date.now()
    ).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error("post-sitemap error:", err.message);
    return new NextResponse("Error generating post sitemap", { status: 500 });
  }
}
