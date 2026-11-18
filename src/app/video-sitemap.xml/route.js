import { NextResponse } from "next/server";
import { resolvePostThumbnail } from "@/utils/resolvePostThumbnail";
import { getApiBase } from "@/utils/apiConfig";
import { shouldIndexPost } from "@/utils/indexGate";

const API_BASE = getApiBase();
const API_URL = `${API_BASE}/post/video/getall`;
const SITE_URL = "https://www.fondpeace.com";

function escapeXml(str = "") {
  return String(str)
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function safeCdata(str = "") {
  return String(str).replace(/]]>/g, "]]]]><![CDATA[>").trim();
}

export async function GET() {
  try {
    const res = await fetch(API_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      return new NextResponse(`API Error: ${res.status}`, { status: 500 });
    }

    const posts = await res.json(); // ✅ directly array

    if (!Array.isArray(posts) || !posts.length) {
      return new NextResponse("No posts found", { status: 200 });
    }

    // Index Gate: Exclude adult/MMS spam and ultra-thin hashtag-only videos from Google sitemap
    const indexableVideos = posts.filter((post) => shouldIndexPost(post));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${indexableVideos
  .map((post) => {
    const videoMedia = post?.media || post?.mediaUrl;
    if (!post?._id || !videoMedia) return "";

    // ✅ SAFE DURATION (no error ever)
    const durationNum = Math.round(Number(post.duration));
    const isValidDuration =
      Number.isFinite(durationNum) &&
      durationNum >= 1 &&
      durationNum <= 28800;

    const thumbUrl = escapeXml(resolvePostThumbnail(post));
    const contentUrl = escapeXml(videoMedia);
    const pubDate = new Date(post.createdAt || Date.now()).toISOString();
    const title = safeCdata(post.title || "FondPeace Short Video");
    const desc = safeCdata(post.description || post.title || "FondPeace video short");

    return `  <url>
    <loc>${SITE_URL}/short/${escapeXml(post._id)}</loc>
    <video:video>
      <video:thumbnail_loc>${thumbUrl}</video:thumbnail_loc>
      <video:title><![CDATA[${title}]]></video:title>
      <video:description><![CDATA[${desc}]]></video:description>
      <video:content_loc>${contentUrl}</video:content_loc>
      ${isValidDuration ? `<video:duration>${durationNum}</video:duration>` : ""}
      <video:publication_date>${pubDate}</video:publication_date>
    </video:video>
  </url>`;
  })
  .filter(Boolean)
  .join("\n")}
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
