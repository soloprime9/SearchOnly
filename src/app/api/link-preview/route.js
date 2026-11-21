import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeUrl(raw) {
  if (!raw || typeof raw !== "string") return "";
  let clean = raw.trim();
  if (!/^https?:\/\//i.test(clean)) {
    clean = `https://${clean}`;
  }
  const match = clean.match(/https?:\/\/[^\s"'<>]+/i);
  if (match) clean = match[0];
  const nextHttp = clean.slice(8).search(/https?:\/\//i);
  if (nextHttp > -1) {
    clean = clean.slice(0, nextHttp + 8);
  }
  clean = clean.replace(/[\\]+$/, "");
  return clean;
}

function decodeHtmlEntities(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugToTitle(pathname, hostname) {
  const parts = pathname.split("/").filter((p) => Boolean(p) && !/^(news|p|post|article|story|status|posts)$/i.test(p));
  if (parts.length === 0) {
    const brand = hostname.replace(/^www\./i, "").split(".")[0];
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  }
  const lastPart = parts[parts.length - 1].replace(/\.(html?|php|aspx?)$/i, "");
  const words = lastPart.replace(/[-_+]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
  if (words.length >= 3) return words;
  const brand = hostname.replace(/^www\./i, "").split(".")[0];
  return `${brand.charAt(0).toUpperCase() + brand.slice(1)} Story`;
}

async function extractMetadata(rawUrl) {
  const validUrl = sanitizeUrl(rawUrl);
  if (!validUrl) return null;

  let parsedUrl;
  try {
    parsedUrl = new URL(validUrl);
  } catch (_) {
    return null;
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const cleanHost = hostname.replace(/^www\./i, "");

  // 1. YouTube official oEmbed
  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(validUrl)}&format=json`);
      if (oembedRes.ok) {
        const ytData = await oembedRes.json();
        let vidId = null;
        if (hostname.includes("youtu.be")) {
          vidId = parsedUrl.pathname.slice(1).split(/[?&]/)[0];
        } else {
          vidId = parsedUrl.searchParams.get("v");
        }
        return {
          url: validUrl,
          title: decodeHtmlEntities(ytData.title || "YouTube Video"),
          description: decodeHtmlEntities(`Watch on YouTube • by ${ytData.author_name || "Creator"}`),
          image: ytData.thumbnail_url || (vidId ? `https://img.youtube.com/vi/${vidId}/hqdefault.jpg` : ""),
          siteName: "YouTube",
          domain: "youtube.com",
          favicon: "https://www.youtube.com/favicon.ico",
        };
      }
    } catch (_) {}
  }

  // 2. Fetch page HTML using social crawler User-Agents
  let html = "";
  const uas = [
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Twitterbot/1.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  ];

  for (const ua of uas) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(validUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": ua,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
      });
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 250) {
          html = text;
          break;
        }
      }
    } catch (_) {}
  }

  let title = "";
  let description = "";
  let image = "";
  let siteName = "";

  if (html) {
    const getMeta = (prop) => {
      const regex = new RegExp(`<meta\\s+[^>]*?(?:property|name)=["'](?:og:|twitter:)?${prop}["'][^>]*?content=["']([^"']*)["']`, "i");
      const altRegex = new RegExp(`<meta\\s+[^>]*?content=["']([^"']*)["'][^>]*?(?:property|name)=["'](?:og:|twitter:)?${prop}["']`, "i");
      const match = html.match(regex) || html.match(altRegex);
      return match ? match[1].trim() : "";
    };

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    title = decodeHtmlEntities(getMeta("title") || (titleMatch ? titleMatch[1].trim() : ""));
    description = decodeHtmlEntities(getMeta("description"));
    image = getMeta("image") || getMeta("image:src");
    siteName = decodeHtmlEntities(getMeta("site_name"));
  }

  // Derive siteName if empty
  if (!siteName) {
    const parts = cleanHost.split(".");
    siteName = parts.length > 1 ? parts[parts.length - 2].toUpperCase() : cleanHost;
  }

  // Derive title if empty or blocked
  if (!title || /^(403 forbidden|just a moment|access denied|security check|attention required)/i.test(title)) {
    title = slugToTitle(parsedUrl.pathname, cleanHost);
  }

  // Derive description if empty
  if (!description) {
    description = `View updates, articles, and content directly from ${cleanHost}.`;
  }

  // Resolve relative image URLs
  if (image && !image.startsWith("http")) {
    try {
      image = new URL(image, validUrl).href;
    } catch (_) {}
  }

  const favicon = `https://www.google.com/s2/favicons?domain=${cleanHost}&sz=128`;

  return {
    url: validUrl,
    title: title.slice(0, 200),
    description: description.slice(0, 300),
    image: image || "",
    siteName,
    domain: cleanHost,
    favicon,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get("url");

    if (!rawUrl) {
      return NextResponse.json({ success: false, message: "URL is required" }, { status: 400 });
    }

    const preview = await extractMetadata(rawUrl);
    if (!preview) {
      return NextResponse.json({ success: false, message: "Invalid URL provided" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      preview,
    });
  } catch (err) {
    console.error("Link Preview API error:", err);
    return NextResponse.json({ success: false, message: "Error extracting link preview" }, { status: 500 });
  }
}
