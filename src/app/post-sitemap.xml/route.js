import { NextResponse } from "next/server";

const API_BASE = "https://backend-k.vercel.app";
const SITE_URL = "https://www.fondpeace.com";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/post/all-ids`, {
      cache: "no-store",
    });

    const posts = await res.json();

    if (!Array.isArray(posts)) {
      return new NextResponse("Invalid data", { status: 500 });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${posts
  .map((post) => {
    if (!post?._id) return "";

    return `
  <url>
    <loc>${SITE_URL}/post/${post._id}</loc>
    <lastmod>${new Date(
      post.updatedAt || post.createdAt || Date.now()
    ).toISOString()}</lastmod>
  </url>`;
  })
  .join("")}

</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
