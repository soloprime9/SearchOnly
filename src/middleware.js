import { NextResponse } from "next/server";

export function middleware(request) {
  const country = request.geo?.country || "";

  // Block China (CN) and Singapore (SG)
  if (country === "CN" || country === "SG") {
    return new NextResponse("Access Denied", { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*", // apply to all routes
};
