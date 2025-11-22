// app/short/[id]/page.jsx
// GOAL: Dedicated Watch Page for Google Video Indexing.
// This page ensures VideoObject schema is present on the primary content page,
// resolving the "Video isn't on a watch page" error.

import { FaHeart, FaCommentDots, FaEye } from "react-icons/fa";

const API_BASE = "https://backend-k.vercel.app"; // set your API
const SITE_ROOT = "https://fondpeace.com"; // set your site root
const CANONICAL_ROOT = `${SITE_ROOT}/post`; // The user-facing URL we want Google to rank

/* --------------------------- Helpers (Shared Logic) --------------------------- */

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

function likesCount(post) {
  return Array.isArray(post?.likes) ? post.likes.length : 0;
}
function commentsCount(post) {
  return Array.isArray(post?.comments) ? post.comments.length : 0;
}
function viewsCount(post) {
  return typeof post?.views === "number" ? post.views : 0;
}

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

    if (!post) return { title: "Video Not Found | FondPeace" };

    const mediaUrl = toAbsolute(post.media);
    const thumb = toAbsolute(post.thumbnail || post.media || "");
    const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));

    const titleTag = post.title ? `${post.title} (Watch) | FondPeace` : "Video Watch Page | FondPeace";
    const desc = buildDescription(post);
    const canonicalUrl = `${CANONICAL_ROOT}/${id}`;

    return {
      title: titleTag,
      description: desc,
      // IMPORTANT: The Canonical URL points back to the user-facing social page (/post/[id])
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: titleTag,
        description: desc,
        url: `${SITE_ROOT}/short/${id}`,
        type: isVideo ? "video.other" : "article",
        images: [{ url: thumb }],
      },
      // New: We don't want this page indexed in regular search results, only the video.
      robots: { index: false, follow: true },
    };
  } catch (err) {
    console.error("generateMetadata error", err);
    return { title: "Video Post | FondPeace" };
  }
}

/* ---------------------------- Watch Page Component ----------------------------- */

export default async function WatchPage({ params }) {
  const id = params?.id;
  const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
  const data = await res.json();
  const post = data?.post ?? null;

  if (!post) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center">
        <div className="p-6 text-center">Video not found.</div>
      </main>
    );
  }

  const mediaUrl = toAbsolute(post.media);
  const thumbnail = toAbsolute(post.thumbnail || post.media || "");

  const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));

  const pageUrl = `${SITE_ROOT}/short/${id}`;
  const canonicalUrl = `${CANONICAL_ROOT}/${id}`;

  const publisher = {
    "@type": "Organization",
    name: "FondPeace",
    url: SITE_ROOT,
  };

  // The primary VideoObject Schema for Indexing
  const jsonLd = isVideo
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        url: pageUrl, 
        name: post.title,
        description: buildDescription(post),
        thumbnailUrl: [thumbnail],
        contentUrl: mediaUrl,
        embedUrl: mediaUrl,
        uploadDate: new Date(post.createdAt || Date.now()).toISOString(),
        ...(post.duration ? { duration: secToISO(post.duration) } : {}),
        publisher: publisher,
        interactionStatistic: buildInteractionSchema(post),
        // CRITICAL FIX: Explicitly tells Google the video is the main content of the canonical URL
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl
        }
      }
    : null;

  if (!isVideo) {
    // If not a video, redirect the user back to the canonical social page.
    return <main className="p-6 text-center">This watch URL is for videos only. Go to <a href={canonicalUrl} className="text-blue-500 underline">Social Post</a></main>
  }

  return (
    <main className="w-full min-h-screen bg-gray-100 text-gray-900 flex justify-center py-6 md:py-10">
      {/* JSON-LD for guaranteed Video Indexing */}
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

      <section className="max-w-3xl w-full mx-auto bg-white shadow-xl rounded-lg overflow-hidden border-t-8 border-blue-600">
        <article className="p-5 sm:p-6 md:p-8">
          
          {/* 1. AUTHOR INFO - Minimal text above video */}
          <div className="flex items-center gap-3 mb-5 border-b pb-4">
            <img 
              src={`${SITE_ROOT}/og-image.jpg`} 
              alt="FondPeace" 
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-gray-900">{post.userId?.username || "FondPeace"}</div>
              <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
            </div>
          </div>
          
          {/* 2. VIDEO PLAYER - PRIMARY FOCUS (High up on the page) */}
          <div className="mb-6">
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              <video 
                controls 
                preload="metadata" 
                poster={thumbnail || undefined} 
                className="w-full h-full object-cover"
                playsInline
              >
                <source src={mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* 3. TITLE (H1) AND DETAILS - Immediately below the video */}
          <h1 className="text-xl md:text-2xl font-bold leading-tight mb-4 text-blue-700">
                {post.title}
            </h1>

            {/* Description / Body */}
            <p className="text-gray-700 mb-5">
                {buildDescription(post)}
            </p>

          {/* 4. INTERACTION STATS */}
          <div className="flex items-center gap-6 text-gray-600 border-t pt-4">
                <div className="flex items-center gap-1">
                    <FaHeart className="text-red-600" />
                    <span className="text-sm font-medium">{likesCount(post)} Likes</span>
                </div>
                <div className="flex items-center gap-1">
                    <FaCommentDots />
                    <span className="text-sm font-medium">{commentsCount(post)} Comments</span>
                </div>
                <div className="flex items-center gap-1">
                    <FaEye />
                    <span className="text-sm font-medium">{viewsCount(post)} Views</span>
                </div>
                {post.duration && (
                    <div className="text-sm text-gray-500 ml-auto">
                        Duration: {secToISO(post.duration)}
                    </div>
                )}
          </div>

            {/* Link back to the Social Page for user experience */}
            <div className="mt-8 text-center">
                <a 
                    href={canonicalUrl} 
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800 underline transition"
                >
                    View this post on the social feed →
                </a>
            </div>

        </article>
      </section>
    </main>
  );
}
