import { NextResponse } from "next/server";

export function middleware(request) {
  const host = request.headers.get("host") || "";

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

  // --- 2. PURGE LEGACY ZOMBIE ROUTES (Tell Googlebot 410 Gone immediately) ---
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

  // Zero geo-blocks and zero bot/crawler 403 restrictions — open worldwide to all users & search engines
  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}

// Matcher settings
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\.xml|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp).*)",
  ],
};
