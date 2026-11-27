import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "fondpeace.com" },
      { protocol: "https", hostname: "www.fondpeace.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.vercel-storage.com" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "pub-fe2880e50b8a49beb15457c1336be948.r2.dev" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
  },
  async redirects() {
    return [
      // Consolidate all legacy /short and /shorts paths onto /post/:id or / (routes kept in repo, hidden live)
      {
        source: "/shorts",
        destination: "/",
        permanent: true,
      },
      {
        source: "/short",
        destination: "/",
        permanent: true,
      },
      {
        source: "/short/:id",
        destination: "/post/:id",
        permanent: true,
      },
      {
        source: "/shorts/:id",
        destination: "/post/:id",
        permanent: true,
      },
      {
        source: "/embed/short/:id",
        destination: "/post/:id",
        permanent: true,
      },
      {
        source: "/video-sitemap.xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
      {
        source: "/post-sitemap.xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
      {
        source: "/blog-sitemap.xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
      {
        source: "/shortsvideo-sitemap.xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;

