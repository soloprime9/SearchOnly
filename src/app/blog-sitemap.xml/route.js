import { NextResponse } from "next/server";

const API_BASE = "https://backend-k.vercel.app";
const SITE_URL = "https://www.fondpeace.com";

export async function GET() {
  try {
    // 🔥 IMPORTANT: fetch ALL posts with slug + category
    const res = await fetch(`${API_BASE}/post/all-slugs`, {
      cache: "no-store", // ✅ best for production
    });

    const posts = await res.json();

    if (!Array.isArray(posts)) {
      return new NextResponse("Invalid data", { status: 500 });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${posts
  .map((post) => {
    if (!post?.slug || !post?.category) return "";

    // 🔥 SAME LOGIC AS YOUR BACKEND
    const categorySlug = post.category
      .toLowerCase()
      .replace(/\s+/g, "-");

    const url = `${SITE_URL}/${categorySlug}/${post.slug}`;

    const lastmod = new Date(
      post.updatedAt || post.createdAt || Date.now()
    ).toISOString();

    return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
  })
  .join("")}

</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
