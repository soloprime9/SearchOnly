// app/shorts/[id]/page.jsx
import { notFound, permanentRedirect } from "next/navigation";
import ReelsFeedWrapper from "@/components/ReelsFeedWrapper";
import { getApiBase } from "@/utils/apiConfig";
import { resolvePostThumbnail } from "@/utils/resolvePostThumbnail";

// Server-side Constants
const API_BASE = getApiBase();
const API_SINGLE = `${API_BASE}/post/single/`;
const SITE_ROOT = "https://www.fondpeace.com";
const DEFAULT_THUMB = `${SITE_ROOT}/Fondpeace.jpg`;

export const dynamic = "force-dynamic";

// --- Utility Functions ---
function toAbsolute(url, type = "image") {
  if (!url) return type === "video" ? "" : DEFAULT_THUMB;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${SITE_ROOT}${url}`;
  return `${SITE_ROOT}/${url}`;
}

function secToISO(sec) {
  const s = Number(sec);
  if (!Number.isFinite(s) || s <= 0) return "PT0M30S";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const secLeft = Math.floor(s % 60);
  let iso = "PT";
  if (h > 0) iso += `${h}H`;
  if (m > 0) iso += `${m}M`;
  if (secLeft > 0 || (h === 0 && m === 0)) iso += `${secLeft}S`;
  return iso;
}

function extractKeywords(post) {
  if (!post) return "fondpeace,shorts,video,reels";
  if (Array.isArray(post.tags) && post.tags.length) return post.tags.join(", ");
  if (Array.isArray(post.hashtags) && post.hashtags.length)
    return post.hashtags.map((h) => h.replace("#", "")).join(", ");
  if (post.title) return post.title.split(" ").slice(0, 10).join(", ");
  return "fondpeace,shorts,video,reels";
}

function likesCount(post) {
  if (Array.isArray(post.likes)) return post.likes.length;
  if (typeof post.likes === "number") return post.likes;
  return 0;
}

function commentsCount(post) {
  if (Array.isArray(post.comments)) return post.comments.length;
  if (typeof post.commentCount === "number") return post.commentCount;
  return 0;
}

function viewsCount(post) {
  if (typeof post.views === "number") return post.views;
  return 0;
}

function buildInteractionSchema(post) {
  return [
    {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/LikeAction",
      userInteractionCount: likesCount(post),
    },
    {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/CommentAction",
      userInteractionCount: commentsCount(post),
    },
    {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ViewAction",
      userInteractionCount: viewsCount(post),
    },
  ];
}

function buildDescription(post) {
  const author = post?.userId?.username || "FondPeace";
  const title = post?.title || "Short Reel";
  return `${title} uploaded by @${author} on FondPeace Shorts, watch trending vertical videos and reels.`;
}

// --- Metadata Generator (Google Indexing Focus) ---
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return { title: "Shorts & Reels | FondPeace" };

  try {
    const res = await fetch(`${API_SINGLE}${id}`, { cache: "no-store" });
    if (!res.ok) return { title: "Shorts & Reels | FondPeace" };

    const { post } = await res.json();
    if (!post) return { title: "Video Not Found | FondPeace Shorts" };

    const mediaUrl = toAbsolute(post.media || post.mediaUrl, "video");
    const thumb = resolvePostThumbnail(post);
    const pageUrl = `${SITE_ROOT}/shorts/${id}`;

    const rawTitle = (post.title || "").trim();
    const cleanText = rawTitle.replace(/#[a-zA-Z0-9_]+/g, "").trim();
    const author = post.userId?.username ? `@${post.userId.username}` : "Creator";

    const title = cleanText
      ? `${cleanText.slice(0, 50)} by ${author} | FondPeace Shorts`
      : `${rawTitle.slice(0, 50) || "Watch Short"} | FondPeace Shorts`;

    const description = cleanText
      ? `Watch "${cleanText}" by ${author} on FondPeace Shorts. Discover viral short reels, react, and comment.`
      : `Watch trending short video by ${author} on FondPeace Shorts.`;

    return {
      title,
      description,
      keywords: extractKeywords(post),
      alternates: { canonical: pageUrl },
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: "FondPeace Shorts",
        type: "video.other",
        images: [
          {
            url: thumb,
            secureUrl: thumb,
            width: 1200,
            height: 630,
            alt: cleanText || title,
          },
        ],
        videos: [
          {
            url: mediaUrl,
            thumbnailUrl: thumb,
            type: "video/mp4",
            secureUrl: mediaUrl,
          },
        ],
      },
      twitter: {
        card: "player",
        title,
        description,
        images: [thumb],
        site: "@FondPeaceTech",
        player: {
          url: `${SITE_ROOT}/embed/short/${post._id || id}`,
          stream: mediaUrl,
          type: "video/mp4",
          image: thumb,
        },
      },
    };
  } catch (err) {
    console.error("Metadata error in /shorts/[id]:", err);
    return { title: "FondPeace Shorts" };
  }
}

// --- Page Component (Server Component) ---
export default async function ShortsDetailPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return notFound();

  try {
    const res = await fetch(`${API_SINGLE}${id}`, { cache: "no-store" });
    if (!res.ok) {
      return notFound();
    }
    const data = await res.json();
    const post = data?.post || null;
    const related = data?.related || [];

    if (!post) {
      return notFound();
    }

    const mediaUrl = toAbsolute(post.media || post.mediaUrl) || null;
    const pageUrl = `${SITE_ROOT}/shorts/${post._id || id}`;
    const authorName = post?.userId?.username;

    const isVideo =
      post.mediaType?.startsWith("video") ||
      /\.(mp4|webm|mov|m3u8)$/i.test(mediaUrl || "");

    if (!isVideo) {
      permanentRedirect(`/post/${id}`);
    }

    const videoSchema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "@id": `${pageUrl}#video`,
      name: post.title,
      headline: post.title,
      description: buildDescription(post),
      thumbnailUrl: [resolvePostThumbnail(post)],
      contentUrl: mediaUrl,
      embedUrl: `${SITE_ROOT}/embed/short/${post._id || id}`,
      url: pageUrl,
      uploadDate: new Date(post.createdAt || Date.now()).toISOString(),
      duration: secToISO(Number(post.duration || 30)),
      inLanguage: "en",
      isFamilyFriendly: true,
      isAccessibleForFree: true,
      author: {
        "@type": "Person",
        name: authorName || "FondPeace",
        url: `${SITE_ROOT}/profile/${authorName || "FondPeace"}`,
      },
      publisher: {
        "@type": "Organization",
        name: "FondPeace",
        url: SITE_ROOT,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_ROOT}/Fondpeace.jpg`,
        },
      },
      interactionStatistic: buildInteractionSchema(post) || [],
      potentialAction: {
        "@type": "WatchAction",
        target: pageUrl,
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": pageUrl,
      },
    };

    return (
      <main className="w-full h-[100dvh] bg-black text-white overflow-hidden select-none">
        <script
          key="video-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(videoSchema),
          }}
        />
        <ReelsFeedWrapper initialPost={post} initialRelated={related} />
      </main>
    );
  } catch (e) {
    if (e?.digest?.startsWith("NEXT_REDIRECT")) {
      throw e;
    }
    console.error("ShortsDetailPage component error:", e);
    return notFound();
  }
}
