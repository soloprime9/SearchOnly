import { NextResponse } from "next/server";
import { getApiBase } from "@/utils/apiConfig";
import { shouldIndexPost } from "@/utils/indexGate";

const API_BASE = getApiBase();
const SITE_URL = "https://www.fondpeace.com";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const fetchOptions = {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(45000),
    };

    // Fetch all posts and all video posts in parallel to strictly eliminate redirect loops
    const [allRes, videoRes] = await Promise.all([
      fetch(`${API_BASE}/post/all-ids`, fetchOptions),
      fetch(`${API_BASE}/post/video/getall`, fetchOptions),
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

    // Filter to ONLY clean, indexable non-video posts (excludes videos, adult/MMS spam, and thin URL-only posts)
    const cleanNonVideoPosts = allPosts.filter((p) => {
      if (!p?._id || videoIdSet.has(String(p._id))) return false;
      // When backend returns title metadata, strictly enforce indexGate
      if (typeof p.title === "string") {
        return shouldIndexPost(p);
      }
      return true;
    });

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
