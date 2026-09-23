import TopicPage from "@/components/TopicPage";
import Link from "next/link";
import { Hash, Sparkles, ArrowLeft } from "lucide-react";
import { getApiBase } from "@/utils/apiConfig";

const API_BASE = getApiBase();

/* ---------------- SEO METADATA ---------------- */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  const topicRaw = decodeURIComponent(slug).replace(/-/g, " ");

  const topic = topicRaw.charAt(0).toUpperCase() + topicRaw.slice(1);
  const url = `https://www.fondpeace.com/topic/${slug}`;

  return {
    title: `${topic} – Discussions & Videos | FondPeace`,
    description: `Browse the latest community discussions, posts, and videos related to #${topic} on FondPeace.`,
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: `${topic} – FondPeace`,
      description: `Trending discussions and videos about #${topic}.`,
      url,
      siteName: "FondPeace",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${topic} – FondPeace`,
      description: `Latest community discussions about #${topic}.`,
    },
  };
}

/* ---------------- PAGE ---------------- */
export default async function TopicPost({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  const topic = decodeURIComponent(slug).replace(/-/g, " ");

  let posts = [];

  try {
    const res = await fetch(
      `${API_BASE}/post/single/search?q=${encodeURIComponent(topic)}`,
      { next: { revalidate: 300 } }
    );

    if (res.ok) {
      posts = await res.json();
    }
  } catch (err) {
    console.error("Topic schema fetch failed:", err);
  }

  /* ---------- STRUCTURED DATA ---------- */
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${topic} – FondPeace`,
    url: `https://www.fondpeace.com/topic/${slug}`,
    description: `Latest posts, videos, and discussions related to #${topic}.`,
    isPartOf: {
      "@type": "WebSite",
      name: "FondPeace",
      url: "https://www.fondpeace.com",
    },
    publisher: {
      "@type": "Organization",
      name: "FondPeace",
      url: "https://www.fondpeace.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.fondpeace.com/Fondpeace.jpg",
      },
    },
  };

  return (
    <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
      {/* JSON-LD */}
      {posts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      {/* Back Link */}
      <div className="mb-4">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* Hero Header with Ambient Mesh */}
      <header className="relative p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-zinc-950/60 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 via-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
              <Hash className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[11px] font-bold mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Topic Channel</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight capitalize">
                #{topic}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.05] dark:border-white/[0.08] text-xs font-bold text-gray-700 dark:text-gray-300">
              {posts.length > 0 ? `${posts.length} Posts` : "Active Community"}
            </span>
          </div>
        </div>
      </header>

      {/* Feed Component */}
      <TopicPage topic={topic} />
    </main>
  );
}
