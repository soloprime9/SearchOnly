import Head from "next/head";
import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import FaqItem from "@/components/FaqItem"; // Client component for FAQ toggle
 
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
  title,
  description,
  publishDate,
  modifiedDate,
  tags = [],
  canonical,
  ogImage,
  markdown,
  faqs = [],
  relatedPosts = [],
  author = { name: "FondPeace Blog" },
}) {
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    headline: title,
    description,
    image: [ogImage],
    datePublished: publishDate,
    dateModified: modifiedDate,
    author: { "@type": "Organization", name: author.name || "FondPeace Blog" },
    publisher: {
      "@type": "Organization",
      name: "FondPeace Blog",
      logo: { "@type": "ImageObject", url: "https://fondpeace.com/logo.jpg" },
    },
    keywords: Array.isArray(tags) ? tags.join(", ") : tags,
    articleSection: "TV Recap",
  };

  return (
    <>
      <Head>
        <title>{title} | FondPeace Blog</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={Array.isArray(tags) ? tags.join(", ") : tags} />
        <link rel="canonical" href={canonical} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="FondPeace Blog" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="article:published_time" content={publishDate} />
        <meta property="article:modified_time" content={modifiedDate} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      </Head>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-6 text-center">
          {ogImage && (
            <div className="mb-6">
              <img src={ogImage} alt={title} className="w-full rounded-lg shadow-sm object-cover max-h-[520px]" />
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold">{title}</h1>
          <div className="mt-2 text-sm text-gray-600">
            By <strong>{author.name}</strong> • Published: {formatHuman(publishDate)} • Updated: {formatHuman(modifiedDate)}
          </div>
        </header>

        {/* Markdown content */}
        <article className="prose prose-lg max-w-none">
          <MarkdownRenderer content={markdown} />
        </article>

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((f, idx) => (
                <FaqItem key={idx} q={f.q} a={f.a} />
              ))}
            </div>
          </section>
        )}

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((p) => (
                <Link key={p.slug} href={`/${p.slug}`} className="block border rounded-lg overflow-hidden hover:shadow-lg transition">
                  <div className="w-full h-40 bg-gray-100">
                    <img src={p.ogImage} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-lg">{p.title}</h3>
                    {p.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</p>}
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
