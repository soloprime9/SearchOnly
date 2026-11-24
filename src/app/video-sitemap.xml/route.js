import { NextResponse } from "next/server";

export async function GET() {
  // 301 Permanent Redirect to single authoritative Vercel edge sitemap (eliminates Render 504 timeouts)
  return NextResponse.redirect("https://www.fondpeace.com/sitemap.xml", 301);
}
