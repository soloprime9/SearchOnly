// app/short/[id]/page.jsx
import { FaHeart, FaCommentDots, FaEye, FaShareAlt } from "react-icons/fa";
 
const API_BASE = "https://backend-k.vercel.app";
const SITE_ROOT = "https://fondpeace.com";
const CANONICAL_ROOT = `${SITE_ROOT}/post`; // canonical social page

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
      alternates: { canonical: canonicalUrl },
      openGraph: {
  title: titleTag,
  description: desc,
  url: `${SITE_ROOT}/post/${id}`,
  type: isVideo ? "video.other" : "article",
  images: [
    {
      url: thumb,
      secureUrl: thumb,
      type: "image/jpeg",
      width: 1280,
      height: 720,
    }
  ],
  ...(isVideo && {
    videos: [
      {
        url: mediaUrl,
        secureUrl: mediaUrl,
        type: "video/mp4",
        width: 1280,
        height: 720,
      }
    ]
  })
},

      robots: { index: false, follow: true }, // Let search index the post canonical; this page holds VideoObject
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
  const pageUrl = `${SITE_ROOT}/shorts/${id}`;
  const canonicalUrl = `${CANONICAL_ROOT}/${id}`;

  const publisher = {
    "@type": "Organization",
    name: "FondPeace",
    url: SITE_ROOT,
  };

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
        publisher,
        interactionStatistic: buildInteractionSchema(post),
        // Important: link back to the canonical social page so Google knows the host canonical
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
      }
    : null;

  if (!isVideo) {
    return (
      <main className="p-6 text-center">
        This watch URL is for videos only. Go to <a href={canonicalUrl} className="text-blue-600 underline">social post</a>.
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-black text-white flex items-stretch">
      {/* JSON-LD */}
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

      {/* Mobile-first reel layout: video fills most height; interactions overlay */}
      <section className="w-full flex flex-col md:flex-row items-stretch justify-center">
        <div className="w-full md:w-2/3 lg:w-3/4 flex items-center justify-center">
          <div className="w-full max-w-3xl">
            {/* Video area - mobile: tall, desktop: standard aspect */}
            <div className="w-full relative">
              <video
                controls
                preload="metadata"
                poster={thumbnail || undefined}
                className="w-full h-[75vh] md:h-auto md:aspect-video object-cover"
                playsInline
              >
                <source src={mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* bottom caption overlay (mobile) */}
              <div className="absolute left-4 bottom-4 md:static md:mt-4 md:bg-transparent text-white">
                <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg md:rounded-none md:p-0">
                  <div className="font-semibold text-sm md:text-lg">{post.userId?.username || "FondPeace"}</div>
                  <div className="text-xs md:text-sm text-gray-200 mt-1">{post.title}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: interactions (on desktop) or overlay on mobile */}
        <aside className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center md:items-end gap-4 p-4 md:p-6">
          <div className="flex flex-col items-center gap-6 mt-6 md:mt-0">
            <button className="flex flex-col items-center gap-1">
              <FaHeart className="text-red-500 text-2xl md:text-3xl" />
              <span className="text-sm text-gray-200">{likesCount(post)}</span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <FaCommentDots className="text-white text-2xl md:text-3xl" />
              <span className="text-sm text-gray-200">{commentsCount(post)}</span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <FaShareAlt className="text-white text-2xl md:text-3xl" />
              <span className="text-sm text-gray-200">Share</span>
            </button>

            <div className="flex flex-col items-center gap-1">
              <FaEye className="text-white text-2xl md:text-3xl" />
              <span className="text-sm text-gray-200">{viewsCount(post) || 0}</span>
            </div>
          </div>

          {/* Info / actions */}
          <div className="w-full md:w-auto mt-4 md:mt-6 text-center md:text-right">
            <a href={canonicalUrl} className="inline-block text-sm text-blue-400 hover:text-blue-200 underline">
              View on feed
            </a>
            <div className="mt-3 text-sm text-gray-300">{buildDescription(post)}</div>
            {post.duration && <div className="mt-2 text-xs text-gray-400">Duration: {secToISO(post.duration)}</div>}
          </div>
        </aside>
      </section>
    </main>
  );
}





