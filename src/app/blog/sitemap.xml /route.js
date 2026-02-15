// src/app/sitemap.xml/route.js
import fs from "fs";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "src", "app", "posts");
const SITE_URL = "https://fondpeace.com/blog";
const SITE = "https://fondpeace.com"

export async function GET() {
  const files = fs.existsSync(POSTS_DIR)
    ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))
    : [];

  const urls = files.map((f) => {
    const slug = f.replace(/\.md$/, "");
    const stats = fs.statSync(path.join(POSTS_DIR, f));
    const lastmod = stats.mtime.toISOString();
    return `
  <url>
    <loc>${SITE_URL}</loc>
    <loc>${SITE}/aboutus</loc>
    <loc>${SITE}/contactus</loc>
    <loc>${SITE}/privacypolicy</loc>
    <loc>${SITE}/DMCA</loc>
    <loc>${SITE}/termcondition</loc>
    <loc>${SITE_URL}/disclaimer</loc>
    <loc>${SITE_URL}/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join("\n")}
  </urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
