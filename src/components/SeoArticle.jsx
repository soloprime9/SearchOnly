"use client";

import Head from "next/head";
import Link from "next/link";
import Linkify from "linkify-react";

const options = {
  target: "_blank",
  rel: "noopener noreferrer nofollow",
  className: "text-blue-600 hover:underline break-words",
};

function formatHuman(date) {
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function SeoArticle({
  post,
  relatedPosts = [],
  canonical,
  siteName = "FondPeace",
}) {
  if (!post) return null;

  const {
    title = "",
    thumbnail,
    createdAt,
    updatedAt,
    tags = [],
    userId,
    category = "Entertainment",
  } = post;

  const authorName = userId?.name;

  // ✅ Convert title → structured content
  const paragraphs = title
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("#"));

  const mainTitle = paragraphs[0] || title;
  const intro = paragraphs[1] || paragraphs[0];
  const restContent = paragraphs.slice(2);

  // ✅ JSON-LD (IMPORTANT FOR GOOGLE)
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: mainTitle,
    description: mainTitle,
    image: [thumbnail],
    datePublished: createdAt,
    dateModified: updatedAt,
    author: {
      "@type": "Organization",
      name: authorName,
      url: `https://fondpeace.com/profile/${authorName}`,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: "https://fondpeace.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
  };

  return (
    <>
      {/* ✅ SEO HEAD */}
      <Head>
        <title>{mainTitle} | {siteName}</title>
        <meta name="description" content={mainTitle} />
        <meta name="keywords" content={tags.join(", ")} />
        <link rel="canonical" href={canonical} />

        {/* OG */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={mainTitle} />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:url" content={canonical} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={mainTitle} />
        <meta name="twitter:image" content={thumbnail} />

        {/* JSON LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
      </Head>

      {/* ✅ PAGE */}
      <main className="bg-white min-h-screen">

        {/* 🔥 TOP BRAND BAR */}
        <div className="border-b bg-white sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              FondPeace
            </Link>
          </div>
        </div>

        {/* ✅ CONTENT */}
        <div className="max-w-3xl mx-auto px-4 py-6">

          {/* 🔹 Breadcrumb */}
          <div className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:underline">Home</Link> /{" "}
            <Link
              href={`/${category.toLowerCase().replace(/\s+/g, "-")}`}
              className="hover:underline"
            >
              {category}
            </Link>
          </div>

          {/* 🔹 Image */}
          {thumbnail && (
            <img
              src={thumbnail}
              alt={mainTitle}
              className="w-full rounded-lg mb-5 object-cover max-h-[420px]"
            />
          )}

          {/* 🔹 TITLE */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-snug">
            <Linkify options={options}>{mainTitle}</Linkify>
          </h1>

          {/* 🔹 META */}
          <p className="text-sm text-gray-500 mb-6">
            By <strong>{authorName}</strong> • {formatHuman(createdAt)}
          </p>

          {/* 🔥 ARTICLE */}
          <article className="text-gray-800 text-[16px] leading-7">

            {/* Intro */}
            <p className="mb-4 text-lg text-gray-700">
              {intro}
            </p>

            {/* Content */}
            {restContent.map((p, i) => (
              <p key={i} className="mb-4">
                {p}
              </p>
            ))}

            {/* Natural Section */}
            <h2 className="text-lg font-semibold mt-6 mb-3">
              What Happened
            </h2>

            <p className="mb-4">
              {mainTitle}
            </p>

          </article>

          {/* 🔹 TAGS */}
          {tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 🔥 RELATED POSTS */}
          {relatedPosts.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold mb-4">
                Related Posts
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/${p.category
                      .toLowerCase()
                      .replace(/\s+/g, "-")}/${p.slug}`}
                    className="flex gap-3 border rounded-lg p-2 hover:bg-gray-50 transition"
                  >
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-24 h-20 object-cover rounded"
                    />

                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                        {p.title}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
    </>
  );
}










// import Head from "next/head";
// import Link from "next/link";
// import MarkdownRenderer from "@/components/MarkdownRenderer";
// import FaqItem from "@/components/FaqItem";
// import Linkify from "linkify-react";
  

// const options = {
//   target: "_blank",
//   rel: "noopener noreferrer nofollow", // ✅ SEO safe
//   className: "text-blue-600 hover:underline font-medium break-words",

//   format: (value, type) => {
//     if (type === "url") {
//       try {
//         const url = new URL(value);

//         // ✅ clean domain (no www)
//         return url.hostname.replace("www.", "");
//       } catch {
//         return value;
//       }
//     }
//     return value;
//   },

//   // ✅ optional: validate only real links
//   validate: {
//     url: (value) => value.startsWith("http"),
//   },
// };

// function formatHuman(iso) {
//   try {
//     return new Date(iso).toLocaleDateString("en-IN", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   } catch {
//     return iso || "";
//   }
// }

// export default function SeoArticle({
//   post,
//   relatedPosts = [],
//   canonical,
//   siteName = "fondpeace",
// }) {
//   const {
//     title,
//     content,
//     thumbnail,
//     createdAt,
//     updatedAt,
//     tags = [],
//     userId,
//     faqs = [],
//   } = post || {};

//   const authorName = userId?.name || "fondpeace team";

//   const articleLd = {
//     "@context": "https://schema.org",
//     "@type": "Article",
//     mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
//     headline: title,
//     description: title,
//     image: [thumbnail],
//     datePublished: createdAt,
//     dateModified: updatedAt,
//     author: {
//       "@type": "Organization",
//       name: authorName,
//     },
//     publisher: {
//       "@type": "Organization",
//       name: siteName,
//       logo: {
//         "@type": "ImageObject",
//         url: "https://fondpeace.com/logo.png",
//       },
//     },
//     keywords: Array.isArray(tags) ? tags.join(", ") : "",
//     articleSection: "Blog",
//   };

//   return (
//     <>
//       <Head>
//         <title>{title} | {siteName}</title>
//         <meta name="description" content={title} />
//         <meta name="keywords" content={tags.join(", ")} />
//         <link rel="canonical" href={canonical} />

//         {/* OG */}
//         <meta property="og:type" content="article" />
//         <meta property="og:title" content={title} />
//         <meta property="og:image" content={thumbnail} />
//         <meta property="og:url" content={canonical} />
//         <meta property="og:site_name" content={siteName} />

//         {/* Twitter */}
//         <meta name="twitter:card" content="summary_large_image" />
//         <meta name="twitter:title" content={title} />
//         <meta name="twitter:image" content={thumbnail} />

//         {/* JSON-LD */}
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify(articleLd),
//           }}
//         />
//       </Head>

//       <main className="mx-auto max-w-4xl px-4 py-8">
//         {/* Header */}
//         <header className="mb-6 text-center">
//           {thumbnail && (
//             <img
//               src={thumbnail}
//               alt={title}
//               className="w-full rounded-lg max-h-[500px] object-cover mb-6"
//             />
//           )}

//            <h1 className="text-gray-800 mb-4 whitespace-pre-line break-words">
//   <Linkify options={options}>
//     {post.title}
//   </Linkify>
// </h1>

//           <div className="text-sm text-gray-600 mt-2">
//             By <strong>{authorName}</strong> •{" "}
//             {formatHuman(createdAt)} • {formatHuman(updatedAt)}
//           </div>
//         </header>

//         {/* Content */}
//         <article className="prose max-w-none">
//           <MarkdownRenderer content={content} />
//         </article>

//         {/* FAQ */}
//         {faqs.length > 0 && (
//           <section className="mt-10">
//             <h2 className="text-2xl font-bold mb-4">
//               Frequently Asked Questions
//             </h2>

//             {faqs.map((f, i) => (
//               <FaqItem key={i} q={f.q} a={f.a} />
//             ))}
//           </section>
//         )}

//         {/* Related Posts */}
//         {relatedPosts.length > 0 && (
//           <section className="mt-10">
//             <h2 className="text-2xl font-bold mb-4">Related Posts</h2>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               {relatedPosts.map((p) => (
//                 <Link
//   key={p.slug}
//   href={`/${p.category.toLowerCase().replace(/\s+/g, "-")}/${p.slug}`}
//   className="border rounded-lg overflow-hidden hover:shadow-lg transition"
// >
//                   <img
//                     src={p.thumbnail}
//                     className="h-40 w-full object-cover"
//                     alt={p.title}
//                   />

//                   <div className="p-3">
//                     <h3 className="font-semibold">{p.title}</h3>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           </section>
//         )}
//       </main>
//     </>
//   );
// }
