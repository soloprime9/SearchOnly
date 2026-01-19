import TopicPage from "@/components/TopicPage";

/* ---------------- SEO METADATA ---------------- */
export async function generateMetadata({ params }) {
  const topic = decodeURIComponent(params.slug).replace(/-/g, " ");
  const url = `https://news.fondpeace.com/topic/${params.slug}`;

  return {
    title: `${topic} – Latest Posts & Videos | FondPeace`,
    description: `Browse the latest posts, videos, and discussions related to ${topic} on FondPeace.`,
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
      description: `Trending posts and videos about ${topic}.`,
      url,
      siteName: "FondPeace",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${topic} – FondPeace`,
      description: `Latest updates and discussions about ${topic}.`,
    },
  };
}

/* ---------------- PAGE ---------------- */
export default async function TopicPost({ params }) {
  const topic = decodeURIComponent(params.slug).replace(/-/g, " ");

  let posts = [];

  try {
    const res = await fetch(
      `https://backend-k.vercel.app/post/single/search?q=${encodeURIComponent(topic)}`,
      { next: { revalidate: 300 } } // cache for 5 min
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
    url: `https://news.fondpeace.com/topic/${params.slug}`,
    description: `Latest posts, videos, and discussions related to ${topic}.`,
    isPartOf: {
      "@type": "WebSite",
      name: "FondPeace",
      url: "https://news.fondpeace.com",
    },
    publisher: {
      "@type": "Organization",
      name: "FondPeace",
      url: "https://news.fondpeace.com",
      logo: {
        "@type": "ImageObject",
        url: "https://news.fondpeace.com/logo.png",
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://news.fondpeace.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: topic,
          item: `https://news.fondpeace.com/topic/${params.slug}`,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      name: `${topic} posts`,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 10).map((p, i) => {
        const postUrl =
          p.mediaType?.startsWith("video")
            ? `https://news.fondpeace.com/short/${p._id}`
            : `https://news.fondpeace.com/post/${p._id}`;

        return {
          "@type": "ListItem",
          position: i + 1,
          url: postUrl,
          name: p.title,
        };
      }),
    },
  };

  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-4">
      {/* JSON-LD */}
      {posts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      {/* Page Header */}
      <header className="mt-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold capitalize">
          {topic}
        </h1>
        <p className="text-gray-600 mt-1">
          Latest posts, videos and discussions
        </p>
      </header>

      {/* Feed */}
      <TopicPage topic={topic} />
    </main>
  );
}
