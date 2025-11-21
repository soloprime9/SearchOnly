// app/post/[id]/page.jsx
import SinglePostPage from "@/components/SinglePostPage";
import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaEye } from "react-icons/fa";

const API_BASE = "https://backend-k.vercel.app"; // set your API
const SITE_ROOT = "https://fondpeace.com"; // set your site root

/* --------------------------- Helpers --------------------------- */

function toAbsolute(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${SITE_ROOT}${url}`;
  return `${SITE_ROOT}/${url}`;
}

function secToISO(sec) {
  if (sec == null) return undefined;
  const s = Number(sec);
  if (!s || isNaN(s)) return undefined;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sLeft = s % 60;
  let iso = "PT";
  if (h) iso += `${h}H`;
  if (m) iso += `${m}M`;
  if (sLeft || (!h && !m)) iso += `${sLeft}S`;
  return iso;
}

/* counts derived exactly from your schema */
function likesCount(post) {
  return Array.isArray(post?.likes) ? post.likes.length : 0;
}
function commentsCount(post) {
  return Array.isArray(post?.comments) ? post.comments.length : 0;
}
function viewsCount(post) {
  return typeof post?.views === "number" ? post.views : 0;
}

/* structured data helpers */
function buildInteractionSchema(post) {
  return [
    {
      "@type": "InteractionCounter",
      interactionType: { "@type": "LikeAction" },
      userInteractionCount: likesCount(post),
    },
    {
      "@type": "InteractionCounter",
      interactionType: { "@type": "CommentAction" },
      userInteractionCount: commentsCount(post),
    },
    {
      "@type": "InteractionCounter",
      interactionType: { "@type": "WatchAction" },
      userInteractionCount: viewsCount(post),
    },
  ];
}

 function buildHasPartRelated(related = []) {
  return (related || []).map(r => {
    const url = `${SITE_ROOT}/post/${r._id}`;
    const media = toAbsolute(r.media || "");
    const thumb = toAbsolute(r.thumbnail || r.media || "");
    const Desc = `${r.title || "Trending post"} on FondPeace.com – watch the latest updates, like, comment, and share with your friends. Discover trending content, join the conversation, and stay up to date with what’s popular today!`

    if (r.mediaType?.startsWith("video") || media.endsWith(".mp4")) {
      return {
        "@type": "VideoObject",
        name: r.title || "",
        description: Desc,

        contentUrl: media,
        url,
        thumbnailUrl: thumb,
        uploadDate: new Date(r.createdAt || Date.now()).toISOString(),
      };
    } else {
      return {
        "@type": "ImageObject",
        name: r.title || "",
        description: Desc,
        contentUrl: media,
        url,
        thumbnailUrl: thumb,
        uploadDate: new Date(r.createdAt || Date.now()).toISOString(),
      };
    }
  });
}


 function buildRelatedItemList(related = []) {
  if (!related.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Related Posts",
    itemListElement: related.map((r, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: buildHasPartRelated([r])[0],
    })),
  };
}


/* keywords and description helpers */
function extractKeywords(post) {
  if (!post) return "FondPeace, social media, trending posts";
  if (Array.isArray(post.tags) && post.tags.length) {
    return post.tags.map((t) => t.trim()).filter(Boolean).join(", ");
  }
  const title = post.title || "";
  const stopwords = new Set([
    "the","and","for","with","this","that","from","your","you","a","an","of","on","in","to","is","by","at","it"
  ]);
  const words = title
    .split(/\s+/)
    .map((w) => w.replace(/[^\w\u00C0-\u017F-]/g, "").toLowerCase())
    .filter((w) => w && w.length > 2 && !stopwords.has(w));
  return (words.slice(0, 12).join(", ") || "FondPeace, social media, trending posts");
}

function buildDescription(post) {
  const title = post?.title || "";
  const author = post?.userId?.username;
  if (title && author) return `${title} uploaded by ${author}. Watch, like, and comment on FondPeace.`;
  if (title) return title;
  return "Discover trending posts and videos on FondPeace.";
}

/* ------------------------- Next metadata ------------------------ */

export async function generateMetadata({ params }) {
  const id = params?.id;
  try {
    const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
    const data = await res.json();
    const post = data?.post ?? null;
    const related = data?.related ?? [];

    if (!post) return { title: "Post Not Found | FondPeace" };

    const mediaUrl = toAbsolute(post.media);
    const thumb = toAbsolute(post.thumbnail || post.media || "");
    const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));

    const titleTag = post.title ? `${post.title} | FondPeace` : "Post | FondPeace";
    const desc = buildDescription(post);
    const keywords = extractKeywords(post);

    return {
      title: titleTag,
      description: desc,
      keywords,
      alternates: { canonical: `${SITE_ROOT}/post/${id}` },
      openGraph: {
        title: titleTag,
        description: desc,
        url: `${SITE_ROOT}/post/${id}`,
        type: isVideo ? "video.other" : "article",
        images: [{ url: thumb }],
      },
      robots: { index: true, follow: true },
    };
  } catch (err) {
    console.error("generateMetadata error", err);
    return { title: "Post | FondPeace" };
  }
}

/* ---------------------------- Page ----------------------------- */

export default async function Page({ params }) {
  const id = params?.id;
  const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
  const data = await res.json();
  const post = data?.post ?? null;
  const related = data?.related ?? [];

  if (!post) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="p-6 text-center">Post not found.</div>
      </main>
    );
  }

  const mediaUrl = toAbsolute(post.media);
  const thumbnail = toAbsolute(post.thumbnail || post.media || "");

  const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));
const isImage = Boolean(!isVideo && mediaUrl && (post.mediaType?.startsWith("image") || /\.(jpg|jpeg|png|webp|gif)$/.test(mediaUrl)));

// Define common properties for structured data
const pageUrl = `${SITE_ROOT}/post/${id}`;
const publisher = {
    "@type": "Organization",
    name: "FondPeace",
    url: SITE_ROOT,
};

const jsonLd = isVideo
  ? {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      // ADDED: Required for a proper canonical link on the object itself
      url: pageUrl, 
      name: post.title,
      description: buildDescription(post),
      thumbnailUrl: [thumbnail],
      contentUrl: mediaUrl,
      embedUrl: mediaUrl,
      uploadDate: new Date(post.createdAt || Date.now()).toISOString(),
      // UPDATED: Used secToISO for correct ISO 8601 duration format
      ...(post.duration ? { duration: secToISO(post.duration) } : {}),
      // ADDED: Recommended for video rich result
      publisher: publisher,
      interactionStatistic: buildInteractionSchema(post),
      // hasPart was removed here to fix the Google Search Console warning
    }
  : isImage
  ? {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      // ADDED: Required for a proper canonical link on the object itself
      url: pageUrl,
      name: post.title,
      description: buildDescription(post),
      contentUrl: mediaUrl,
      thumbnailUrl: [thumbnail],
      datePublished: new Date(post.createdAt || Date.now()).toISOString(),
      // ADDED: Recommended for content organization
      publisher: publisher,
      interactionStatistic: buildInteractionSchema(post),
      // hasPart was removed here to fix the Google Search Console warning
    }
  : {
      "@context": "https://schema.org",
      "@type": "Article",
      // ADDED: Required for a proper canonical link on the object itself
      url: pageUrl,
      headline: post.title,
      description: buildDescription(post),
      image: [thumbnail],
      datePublished: new Date(post.createdAt || Date.now()).toISOString(),
      // ADDED: Recommended for content organization
      publisher: publisher,
      interactionStatistic: buildInteractionSchema(post),
      // hasPart was removed here to fix the Google Search Console warning
    };


  const relatedItemList = buildRelatedItemList(related);

   <main className="w-full min-h-screen bg-gray-50 text-gray-900">
  {/* JSON-LD */}
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  {relatedItemList && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedItemList) }} />}

  <section className="container mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-12">
    <article className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
      <div className="p-5 sm:p-6 md:p-8">
        
        {/* header */}
        <div className="flex items-center gap-4 mb-5">
          <img 
            src={`${SITE_ROOT}/og-image.jpg`} 
            alt="FondPeace" 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200"
          />
          <div>
            <div className="font-semibold text-gray-900 text-sm sm:text-base">{post.userId?.username || "FondPeace"}</div>
            <div className="text-xs sm:text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
          </div>
        </div>

        {/* title */}
        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold leading-snug mb-6">{post.title}</h1>

        {/* media */}
        <div className="mb-6">
          {isVideo && mediaUrl ? (
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md">
              <video 
                controls 
                preload="metadata" 
                poster={thumbnail || undefined} 
                className="w-full h-full object-cover rounded-xl"
                playsInline
              >
                <source src={mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : mediaUrl ? (
            <img src={mediaUrl} alt={post.title} className="w-full rounded-xl object-cover shadow-md" />
          ) : null}
        </div>

        {/* interactions */}
        {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-4 text-gray-700 text-sm sm:text-base">
            <span>❤️ {likesCount(post)}</span>
            <span>💬 {commentsCount(post)}</span>
            <span>👁️ {viewsCount(post)}</span>
            {post.duration && <span>⏱ {post.duration}</span>}
          </div>
          <div className="text-sm text-gray-500">{extractKeywords(post)}</div>
        </div> */}

        <SinglePostPage initialPost={post} related={related} />
      </div>
    </article>

    {/* Related posts */}
    {Array.isArray(related) && related.length > 0 && (
      <aside className="max-w-4xl mx-auto mt-10">
        <h2 className="text-xl sm:text-2xl font-semibold mb-5">Related Posts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((r) => {
            const rMedia = toAbsolute(r.media || "");
            const rIsVideo = Boolean(r.mediaType?.startsWith("video") || (rMedia && rMedia.endsWith(".mp4")));
            return (
              <a 
                key={r._id} 
                href={`/post/${r._id}`} 
                className="block bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-xl transition duration-300 ease-in-out"
              >
                <div className="w-full h-56 sm:h-64 md:h-56 lg:h-48 bg-gray-100 overflow-hidden">
                  {rIsVideo ? (
                    <video src={rMedia} muted className="w-full h-full object-cover" />
                  ) : (
                    <img src={rMedia} alt={r.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base">{r.title}</p>
                  <div className="flex items-center gap-3 text-gray-500 text-xs sm:text-sm mt-2">
                    <FaHeart className="text-red-600" />
                    <span>{likesCount(r)}</span>
                    <span>•</span>
                    <FaCommentDots />
                    <span>{commentsCount(r)}</span>
                    <span>•</span>
                    <FaEye />
                    <span>{viewsCount(r) || 0}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </aside>
    )}
  </section>
</main>

}
















