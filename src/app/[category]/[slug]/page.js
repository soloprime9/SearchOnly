import { notFound } from "next/navigation";
// import SeoArticle from "@/components/SeoArticle";

const SITE_URL = "https://fondpeace.com"; // change

// ❌ no static params (dynamic from API)
export const dynamic = "force-dynamic";

// ✅ SEO Metadata Server-Side (from API)
export async function generateMetadata({ params }) {
  const { category, slug } = params;

  const res = await fetch(
    `${process.env.API_URL}/post/${category}/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) return {};

  const data = await res.json();
  const post = data.post;

  return {
    title: `${post.title} | fondpeace`,
    description: post.title || "",
    alternates: {
      canonical: `${SITE_URL}/${category}/${slug}`,
    },
    openGraph: {
      type: "article",
      siteName: "fondpeace",
      title: post.title,
      description: post.title || "",
      url: `${SITE_URL}/${category}/${slug}`,
      images: [post.thumbnail || `${SITE_URL}/images/default-og.jpg`],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.title || "",
      images: [post.thumbnail || `${SITE_URL}/images/default-og.jpg`],
    },
  };
}

// ✅ Page (Server Side)
export default async function Page({ params }) {
  const { category, slug } = params;

  const res = await fetch(
    `${process.env.API_URL}/post/${category}/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) return notFound();

  const { post, related } = await res.json();

  return (
    <SeoArticle
      post={post}
      relatedPosts={related || []}
      canonical={`${SITE_URL}/${category}/${slug}`}
    />
    
  );
}
