import { NextResponse } from "next/server";

export function middleware(request) {
  // Vercel Hobby plan par ye headers country identify karte hain
  const country = request.headers.get("x-vercel-ip-country") || "";
  
  // Debugging: Isse aap Vercel Logs mein dekh payenge ki kya detect ho raha hai
  console.log("MiddleWare Check - Country:", country);

  // China (CN) aur Singapore (SG) ko block karna
  const blockedCountries = ["CN", "SG"];

  if (blockedCountries.includes(country)) {
    return new NextResponse(
      "<h1>Access Denied</h1><p>This website is not accessible from China or Singapore.</p>",
      { 
        status: 403, 
        headers: { "content-type": "text/html" } 
      }
    );
  }

  return NextResponse.next();
}

// Matcher settings taaki images/static files par load na pade
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
