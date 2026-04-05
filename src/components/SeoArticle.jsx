import Head from "next/head";
import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import FaqItem from "@/components/FaqItem";
import Linkify from "linkify-react";
 

const options = {
  target: "_blank",
  rel: "noopener noreferrer nofollow", // ✅ SEO safe
  className: "text-blue-600 hover:underline font-medium break-words",

  format: (value, type) => {
    if (type === "url") {
      try {
        const url = new URL(value);

        // ✅ clean domain (no www)
        return url.hostname.replace("www.", "");
      } catch {
        return value;
      }
    }
    return value;
  },

  // ✅ optional: validate only real links
  validate: {
    url: (value) => value.startsWith("http"),
  },
};

function formatHuman(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso || "";
  }
}

export default function SeoArticle({
  post,
  relatedPosts = [],
  canonical,
  siteName = "fondpeace",
}) {
  const {
    title,
    content,
    thumbnail,
    createdAt,
    updatedAt,
    tags = [],
    userId,
    faqs = [],
  } = post || {};

  const authorName = userId?.name || "fondpeace team";

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    headline: title,
    description: title,
    image: [thumbnail],
    datePublished: createdAt,
    dateModified: updatedAt,
    author: {
      "@type": "Organization",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: "https://fondpeace.com/logo.png",
      },
    },
    keywords: Array.isArray(tags) ? tags.join(", ") : "",
    articleSection: "Blog",
  };

  return (
    <>
      <Head>
        <title>{title} | {siteName}</title>
        <meta name="description" content={title} />
        <meta name="keywords" content={tags.join(", ")} />
        <link rel="canonical" href={canonical} />

        {/* OG */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content={siteName} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:image" content={thumbnail} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleLd),
          }}
        />
      </Head>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="mb-6 text-center">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={title}
              className="w-full rounded-lg max-h-[500px] object-cover mb-6"
            />
          )}

           <h1 className="text-gray-800 mb-4 whitespace-pre-line break-words">
  <Linkify options={options}>
    {post.title}
  </Linkify>
</h1>

          <div className="text-sm text-gray-600 mt-2">
            By <strong>{authorName}</strong> •{" "}
            {formatHuman(createdAt)} • {formatHuman(updatedAt)}
          </div>
        </header>

        {/* Content */}
        <article className="prose max-w-none">
          <MarkdownRenderer content={content} />
        </article>

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold mb-4">
              Frequently Asked Questions
            </h2>

            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Related Posts</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${p.category}/${p.slug}`}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  <img
                    src={p.thumbnail}
                    className="h-40 w-full object-cover"
                    alt={p.title}
                  />

                  <div className="p-3">
                    <h3 className="font-semibold">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
