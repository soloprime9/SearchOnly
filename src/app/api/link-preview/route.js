import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeUrl(raw) {
  if (!raw || typeof raw !== "string") return "";
  let clean = raw.trim();
  // If user accidentally glued two URLs together or selected a fragment, extract the last valid URL
  const urls = clean.match(/https?:\/\/[^\s"'<>!]+/gi);
  if (urls && urls.length > 0) {
    clean = urls[urls.length - 1];
  } else if (!/^https?:\/\//i.test(clean)) {
    clean = `https://${clean}`;
  }
  clean = clean.replace(/[\\]+$/, "").replace(/[),;.]+$/, "");
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

// Universal RSS Feed Extractor: Fallback for Cloudflare-protected news & blogs (e.g. Tellyexpress, Bollywood Life, WordPress)
async function findInRssFeed(validUrl, parsedUrl) {
  try {
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
    const slug = parsedUrl.pathname.replace(/^\/+|\/+$/g, "").split("/").pop().toLowerCase();
    const cleanTarget = validUrl.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");

    const pages = [1, 2, 3, 4, 5];
    const fetchPage = async (p) => {
      try {
        const u = p === 1 ? `${baseUrl}/feed/` : `${baseUrl}/feed/?paged=${p}`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(u, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml,application/xml,text/xml,*/*",
          },
        });
        clearTimeout(timer);
        if (res.ok) {
          const text = await res.text();
          if (text && text.includes("<item>")) return text;
        }
      } catch (_) {}
      return "";
    };

    const results = await Promise.all(pages.map((p) => fetchPage(p)));

    for (let pIdx = 0; pIdx < results.length; pIdx++) {
      const xml = results[pIdx];
      if (!xml) continue;

      const items = xml.split("<item>");
      for (let i = 1; i < items.length; i++) {
        const it = items[i];
        const linkMatch = it.match(/<link>(.*?)<\/link>/i);
        if (!linkMatch) continue;

        const itemLink = linkMatch[1].trim();
        const cleanItem = itemLink.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
        const itemSlug = cleanItem.split("/").pop().toLowerCase();

        const isMatch =
          cleanItem === cleanTarget ||
          cleanTarget.includes(cleanItem) ||
          cleanItem.includes(cleanTarget) ||
          (slug && itemSlug && (slug.includes(itemSlug) || itemSlug.includes(slug)));

        if (isMatch) {
          const titleMatch = it.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
          const descMatch = it.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
          const imgMatch =
            it.match(/<media:content[^>]+url=["']([^"']+)["']/i) ||
            it.match(/<enclosure[^>]+url=["']([^"']+)["']/i) ||
            it.match(/<img[^>]+src=["']([^"']+)["']/i);

          const rawTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
          let rawDesc = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
          rawDesc = rawDesc.replace(/The post\s+[\s\S]*?appeared first on[\s\S]*$/i, "").trim();
          const image = imgMatch ? imgMatch[1].trim() : "";

          return {
            title: decodeHtmlEntities(rawTitle),
            description: decodeHtmlEntities(rawDesc),
            image,
          };
        }
      }
    }
  } catch (_) {}
  return null;
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
  let video = "";
  let ogType = "";
  let siteName = "";

  // Check if the URL itself is a direct video file
  const isDirectVideoFile = /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(validUrl);
  if (isDirectVideoFile) {
    video = validUrl;
  }

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
    ogType = (getMeta("type") || "").toLowerCase();
    siteName = decodeHtmlEntities(getMeta("site_name"));

    // 1. IMDb Special: If image is the generic yellow imdb_logo.png or page is news, extract true article hero photo!
    if (cleanHost.includes("imdb.com") && (!image || image.includes("imdb_logo") || parsedUrl.pathname.includes("/news/"))) {
      const imdbHeroMatch = html.match(/(https:\/\/m\.media-amazon\.com\/images\/M\/[^"'\s,]+_V1_[^"'\s,]+\.jpg)/i);
      if (imdbHeroMatch && imdbHeroMatch[1]) {
        image = imdbHeroMatch[1];
      }
    }

    // 2. X / Twitter Special: Tweet text is embedded inside the <title> tag between quotes
    if ((cleanHost.includes("x.com") || cleanHost.includes("twitter.com")) && titleMatch) {
      const rawTitle = decodeHtmlEntities(titleMatch[1]);
      const tweetMatch = rawTitle.match(/on X:\s*["“]([\s\S]+?)["”]\s*\/\s*X/i) ||
                         rawTitle.match(/on Twitter:\s*["“]([\s\S]+?)["”]\s*\/\s*Twitter/i);
      if (tweetMatch && tweetMatch[1]) {
        description = tweetMatch[1].trim();
      }
    }

    // 3. Facebook Special: Clean generic login titles
    if (cleanHost.includes("facebook.com")) {
      if (!title || title.toLowerCase() === "facebook" || title.toLowerCase().includes("log in or sign up")) {
        title = "Facebook Post";
        if (!description) description = "View this post, photos and updates on Facebook";
      }
    }

    // SAFETY GUARD: If page is an article, blog, or website, NEVER treat an accidental sidebar ad video as the main media!
    // Only capture video stream if the page itself is officially declared as a dedicated video post (og:type === 'video.*')
    const isDedicatedVideoPage = /^video(\.|$)/i.test(ogType);
    if (!video && isDedicatedVideoPage) {
      video = getMeta("video:secure_url") || getMeta("video:url") || getMeta("video") || getMeta("twitter:player:stream");
    }
  }

  // 4. RSS Feed Fallback: If image or description or title is missing (or site blocks bot scraping with Cloudflare like Tellyexpress)
  if (!image || !html || /^(403 forbidden|just a moment|access denied|security check|attention required)/i.test(title)) {
    const feedData = await findInRssFeed(validUrl, parsedUrl);
    if (feedData) {
      if (!image && feedData.image) image = feedData.image;
      if (
        (!title ||
          /^(403 forbidden|just a moment|access denied|security check|attention required)/i.test(title) ||
          title === slugToTitle(parsedUrl.pathname, cleanHost)) &&
        feedData.title
      ) {
        title = feedData.title;
      }
      if ((!description || description.startsWith("View updates, articles")) && feedData.description) {
        description = feedData.description;
      }
    }
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

  // Resolve relative image & video URLs
  if (image && !image.startsWith("http")) {
    try {
      image = new URL(image, validUrl).href;
    } catch (_) {}
  }
  if (video && !video.startsWith("http")) {
    try {
      video = new URL(video, validUrl).href;
    } catch (_) {}
  }

  const favicon = `https://www.google.com/s2/favicons?domain=${cleanHost}&sz=128`;
  const isDedicatedVideo = isDirectVideoFile || /^video(\.|$)/i.test(ogType);

  return {
    url: validUrl,
    title: title.slice(0, 200),
    description: description.slice(0, 300),
    image: image || "",
    video: isDedicatedVideo ? (video || "") : "",
    isDedicatedVideo,
    ogType: ogType || "website",
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
