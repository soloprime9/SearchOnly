import { NextResponse } from "next/server";

const API_URL = "https://backend-k.vercel.app/post/video/getall";
const SITE_URL = "https://www.fondpeace.com";

export async function GET() {
  try {
    const res = await fetch(API_URL, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return new NextResponse(`API Error: ${res.status}`, { status: 500 });
    }

    const posts = await res.json(); // ✅ directly array

    if (!Array.isArray(posts) || !posts.length) {
      return new NextResponse("No posts found", { status: 200 });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">

${posts
  .map((post) => {
    if (!post?._id || !post?.media) return "";

    // ✅ SAFE DURATION (no error ever)
    const durationNum = Number(post.duration);
    const isValidDuration =
      Number.isFinite(durationNum) &&
      durationNum >= 1 &&
      durationNum <= 28800;

    return `
  <url>
    <loc>${SITE_URL}/short/${post._id}</loc>

    <video:video>
      <video:thumbnail_loc>
        ${post.thumbnail || `${SITE_URL}/Fondpeace.jpg`}
      </video:thumbnail_loc>

      <video:title><![CDATA[${
        post.title || "FondPeace Short Video"
      }]]></video:title>

      <video:description><![CDATA[${
        post.description || post.title || "FondPeace video short"
      }]]></video:description>

      <video:content_loc>
        ${post.media}
      </video:content_loc>

      ${
        isValidDuration
          ? `<video:duration>${durationNum}</video:duration>`
          : ""
      }

      <video:publication_date>
        ${new Date(post.createdAt || Date.now()).toISOString()}
      </video:publication_date>

    </video:video>
  </url>`;
  })
  .join("")}

</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    return new NextResponse("Error generating video sitemap", { status: 500 });
  }
}
