import { NextResponse } from "next/server";

// 1. Official Search Engine & Social Preview Bots (Always allowed for SEO & indexing)
const ALLOWED_SEARCH_BOTS = [
  "googlebot",
  "google-inspectiontool",
  "mediapartners-google",
  "adsbot-google",
  "feedfetcher-google",
  "bingbot",
  "bingpreview",
  "msnbot",
  "duckduckbot",
  "yandexbot",
  "slurp",
  "applebot",
  "twitterbot",
  "facebookexternalhit",
  "facebot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "pinterestbot",
];

// 2. Known Malicious Scrapers & Automated Data Leeching Tools (Blocked worldwide)
const BLOCKED_SCRAPERS = [
  "bytespider",
  "petalbot",
  "scrapy",
  "gptbot",
  "claudebot",
  "perplexitybot",
  "amazonbot",
  "google-extended",
  "diffbot",
  "cohere-ai",
  "python-requests",
  "python",
  "curl",
  "wget",
  "go-http-client",
  "httpclient",
  "aiohttp",
  "httpx",
  "urllib",
  "postmanruntime",
  "headlesschrome",
  "phantomjs",
  "selenium",
  "puppeteer",
  "playwright",
];

export function middleware(request) {
  const host = request.headers.get("host") || "";
  const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
  const country = (request.headers.get("x-vercel-ip-country") || "").toUpperCase();

  // --- 0. LOCAL DEVELOPMENT: Always allow localhost requests ---
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return NextResponse.next();
  }

  // --- 1. SINGLE CANONICAL DOMAIN: Force non-www to www.fondpeace.com (301 Permanent) ---
  if (host === "fondpeace.com") {
    const url = request.nextUrl.clone();
    url.host = "www.fondpeace.com";
    return NextResponse.redirect(url, 301);
  }

  // --- 1.5 PURGE LEGACY ZOMBIE ROUTES (Tell Googlebot 410 Gone immediately) ---
  const pathname = request.nextUrl.pathname;
  const isGone = [
    "/blog",
    "/Reducer",
    "/youtubethumbnailtester",
    "/JobTension",
    "/IntroList",
    "/searchbro",
    "/macrumors",
    "/reminder",
  ].some((dead) => pathname === dead || pathname.startsWith(`${dead}/`));

  if (isGone) {
    return new NextResponse("410 Gone: This resource has been permanently removed.", {
      status: 410,
      headers: {
        "Content-Type": "text/plain",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  // --- 2. ANTI-SCRAPER PROTECTION: Block automated scraping tools worldwide ---
  const isBadScraper = BLOCKED_SCRAPERS.some((tool) => userAgent.includes(tool));
  if (isBadScraper) {
    return new NextResponse("Access Denied: Automated Scraping Forbidden", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  // --- 3. SEARCH ENGINE CRAWLER WHITELIST (SEO Priority) ---
  // If Googlebot / Bingbot / Social Bots visit from Singapore or anywhere, ALWAYS ALLOW!
  const isSearchBot = ALLOWED_SEARCH_BOTS.some((bot) => userAgent.includes(bot));
  if (isSearchBot) {
    return NextResponse.next();
  }

  // --- 4. GEO-BLOCKING: Block general visitors/scrapers from China (CN) & Singapore (SG) ---
  const blockedCountries = ["CN", "SG"];
  if (blockedCountries.includes(country)) {
    return new NextResponse(
      "<h1>Access Denied</h1><p>This website is not accessible from your region.</p>",
      {
        status: 403,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}

// Matcher settings
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap & robots (always public)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\.xml|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp).*)",
  ],
};
