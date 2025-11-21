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

const jsonLd = isVideo
  ? {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: post.title,
      description: buildDescription(post),
      thumbnailUrl: [thumbnail],
      contentUrl: mediaUrl,
      embedUrl: mediaUrl,
      uploadDate: new Date(post.createdAt || Date.now()).toISOString(),
      ...(post.duration ? { duration: post.duration } : {}),
      interactionStatistic: buildInteractionSchema(post),
      // hasPart: buildHasPartRelated(related),
    }
  : isImage
  ? {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      name: post.title,
      description: buildDescription(post),
      contentUrl: mediaUrl,
      thumbnailUrl: [thumbnail],
      datePublished: new Date(post.createdAt || Date.now()).toISOString(),
      interactionStatistic: buildInteractionSchema(post),
      // hasPart: buildHasPartRelated(related),
    }
  : {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: buildDescription(post),
      image: [thumbnail],
      datePublished: new Date(post.createdAt || Date.now()).toISOString(),
      interactionStatistic: buildInteractionSchema(post),
      // hasPart: buildHasPartRelated(related),
    };


  const relatedItemList = buildRelatedItemList(related);

  return (
    <main className="w-full min-h-screen bg-white text-gray-900">
      {/* JSON-LD: server-rendered so Google reads directly */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {relatedItemList && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedItemList) }} />}

      <section className="container mx-auto px-2 py-4 md:py-10">
        <article className="max-w-3xl mx-auto bg-white shadow rounded-lg overflow-hidden">
          <div className="p-5 md:p-6">
            {/* header */}
            <div className="flex items-center gap-3 mb-4">
              <img src={`${SITE_ROOT}/og-image.jpg`} alt="FondPeace" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <div className="font-semibold text-gray-900">{post.userId?.username || "FondPeace"}</div>
                <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
              </div>
            </div>

            {/* title */}
            <h1 className="text-md md:text-xl font-bold leading-tight mb-4">{post.title}</h1>

            {/* media */}
            <div className="mb-5">
              {isVideo && mediaUrl ? (
                <div className="w-full aspect-video bg-black rounded-md overflow-hidden">
                  <video controls preload="metadata" poster={thumbnail || undefined} className="w-full h-full object-cover" playsInline>
                    <source src={mediaUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : mediaUrl ? (
                <img src={mediaUrl} alt={post.title} className="w-full rounded-md object-cover" />
              ) : null}
            </div>

            
            
            {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div className="flex items-center gap-4 text-gray-700">
                <span className="text-sm">❤️ {likesCount(post)}</span>
                <span className="text-sm">💬 {commentsCount(post)}</span>
                <span className="text-sm">👁️ {viewsCount(post)}</span>
                {post.duration && <span className="text-sm">⏱ {post.duration}</span>}
              </div>
              <div className="text-sm text-gray-600">{extractKeywords(post)}</div>
            </div> */}

            {/* client interactions component (no refetch) */}
            <SinglePostPage initialPost={post} related={related} />
          </div>
        </article>

        {/* Related posts (server-rendered) */}
        {Array.isArray(related) && related.length > 0 && (
          <aside className="max-w-3xl mx-auto mt-8">
            <h2 className="text-lg font-semibold mb-4">Related Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((r) => {
                const rMedia = toAbsolute(r.media || "");
                const rIsVideo = Boolean(r.mediaType?.startsWith("video") || (rMedia && rMedia.endsWith(".mp4")));
                return (
                  <a key={r._id} href={`/post/${r._id}`} className="block bg-white shadow rounded overflow-hidden hover:shadow-lg transition">
                    <div className="w-full h-48 bg-gray-100 overflow-hidden">
                      {rIsVideo ? <video src={rMedia} muted className="w-full h-full object-cover" /> : <img src={rMedia} alt={r.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-gray-900 line-clamp-2">{r.title}</p>
                      <div className="flex item-center gap-2 text-xs text-gray-500 mt-1">
                        <FaHeart className="text-red-600 text-lg" />
                        <span>{likesCount(r)}</span> 
                        <span>•</span> 
                        <FaCommentDots className="text-lg" />
                        <span>{commentsCount(r)}</span> 
                      <span>•</span> 
                        <FaEye className="text-gray-600" />
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
  );
}












