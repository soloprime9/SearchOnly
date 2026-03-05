import { NextResponse } from "next/server";

export async function GET(request) {
  const country =
  req.headers["x-vercel-ip-country"] ||
  req.headers["x-forwarded-for-country"] ||
  "Unknown";

  return NextResponse.json({ country });
}
