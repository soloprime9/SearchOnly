import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import SeoArticle from "@/components/SeoArticle";

const POSTS_DIR = path.join(process.cwd(), "src", "app", "posts");
const SITE_URL = "https://fondpeace.com/blog";
const SITE = "https://fondpeace.com";

export async function generateStaticParams() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ slug: f.replace(/\.md$/, "") }));
}

export const dynamicParams = false;

// ✅ SEO Metadata Server-Side
export async function generateMetadata({ params }) {
  const { slug } = params;
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return {};

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data = {} } = matter(raw);

  const ogImage =
    data.ogImage && String(data.ogImage).startsWith("http")
      ? data.ogImage
      : data.ogImage
      ? `${SITE}${data.ogImage.startsWith("/") ? "" : "/"}${data.ogImage}`
      : `${SITE}/FondPeace-1200x630.jpg`;

  return {
    title: `${data.title || slug} | FondPeace Blog`,
    description: data.description || "",
    keywords: Array.isArray(data.tags) ? data.tags.join(", ") : data.tags || "",
    alternates: {
      canonical: data.canonical || `${SITE_URL}/${slug}`,
    },
    openGraph: {
      type: "article",
      siteName: "FondPeace Blog",
      title: data.title || slug,
      description: data.description || "",
      url: data.canonical || `${SITE_URL}/${slug}`,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title || slug,
      description: data.description || "",
      images: [ogImage],
    },
  };
}

export default function Page({ params }) {
  const { slug } = params;
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return notFound();

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data = {}, content = "" } = matter(raw);

  const stats = fs.statSync(filePath);
  const modifiedDate = stats.mtime.toISOString();
  const publishDate =
    data.publishDate && !Number.isNaN(new Date(data.publishDate).getTime())
      ? new Date(data.publishDate).toISOString()
      : stats.ctime.toISOString();

  const tags = Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [];

  const ogImage =
    data.ogImage && String(data.ogImage).startsWith("http")
      ? data.ogImage
      : data.ogImage
      ? `${SITE}${data.ogImage.startsWith("/") ? "" : "/"}${data.ogImage}`
      : `${SITE}/FondPeace-1200x630.jpg`;

  // Related posts
  const allFiles = fs.existsSync(POSTS_DIR)
    ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))
    : [];

  const related = allFiles
    .filter((f) => f !== `${slug}.md`)
    .map((f) => {
      const mdRaw = fs.readFileSync(path.join(POSTS_DIR, f), "utf-8");
      const md = matter(mdRaw);
      const d = md.data || {};
      const t = Array.isArray(d.tags) ? d.tags : d.tags ? [d.tags] : [];
      const og =
        d.ogImage && String(d.ogImage).startsWith("http")
          ? d.ogImage
          : d.ogImage
          ? `${SITE}${d.ogImage.startsWith("/") ? "" : "/"}${d.ogImage}`
          : `${SITE}/FondPeace-1200x630.jpg`;
      return {
        slug: f.replace(/\.md$/, ""),
        title: d.title || f.replace(/\.md$/, ""),
        description: d.description || "",
        tags: t,
        ogImage: og,
        publishDate: d.publishDate || "",
      };
    })
    .filter((p) => p.tags.some((tag) => tags.includes(tag)))
    .slice(0, 6);

  const props = {
    title: data.title || slug,
    description: data.description || "",
    publishDate,
    modifiedDate,
    tags,
    canonical: data.canonical || `${SITE_URL}/${slug}`,
    ogImage,
    markdown: content,
    faqs: Array.isArray(data.faqs) ? data.faqs : [],
    relatedPosts: related,
    author: data.author?.name ? { name: data.author.name } : { name: "FondPeace Blog" },
  };

  return <SeoArticle {...props} />;
}
