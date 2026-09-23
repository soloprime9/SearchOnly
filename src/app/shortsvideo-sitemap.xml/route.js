import { NextResponse } from "next/server";

export async function GET() {
  // 301 Permanent Redirect to the single authoritative video sitemap
  return NextResponse.redirect("https://www.fondpeace.com/video-sitemap.xml", 301);
}
