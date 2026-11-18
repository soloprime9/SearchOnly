// app/shorts/[id]/page.jsx
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import ReelsFeedWrapper from "@/components/ReelsFeedWrapper";
import { getApiBase } from "@/utils/apiConfig";
import { resolvePostThumbnail } from "@/utils/resolvePostThumbnail";
import { isPlayableShortPost, extractPostYouTubeId } from "@/utils/postMediaUtils";

// Safe server-side YouTube ID extractor (zero client-component proxy dependency)
function getYouTubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

// Server-side Constants
const API_BASE = getApiBase().replace(/\/+$/, "");
const API_SINGLE = `${API_BASE}/post/single/`;
const SITE_ROOT = "https://www.fondpeace.com";
const DEFAULT_THUMB = `${SITE_ROOT}/Fondpeace.jpg`;

export const revalidate = 300; // Edge-cache watch pages for 5 minutes (cuts TTFB from ~2.3s to ~150ms)

// Deduplicated per-request fetch shared between generateMetadata() and ShortsDetailPage()
const getShortPostData = cache(async (id) => {
  try {
    const res = await fetch(`${API_SINGLE}${id}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch single short post:", err);
    return null;
  }
});

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
    const data = await getShortPostData(id);
    const post = data?.post;
    if (!post) return { title: "Video Not Found | FondPeace Shorts" };

    const mediaUrl = toAbsolute(post.media || post.mediaUrl, "video");
    const thumb = resolvePostThumbnail(post);
    const pageUrl = `${SITE_ROOT}/shorts/${id}`;

    const rawTitle = (post.title || "").trim();
    let cleanText = rawTitle.replace(/#[a-zA-Z0-9_]+/g, "").trim();
    if (!cleanText && rawTitle) {
      cleanText = (rawTitle.match(/#[a-zA-Z0-9_]+/g) || []).map((t) => t.replace("#", "")).join(" ");
    }
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
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
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
    const data = await getShortPostData(id);
    const post = data?.post || null;
    const related = data?.related || [];

    if (post) {
      const mediaUrl = toAbsolute(post.media || post.mediaUrl) || null;
      const pageUrl = `${SITE_ROOT}/shorts/${post._id || id}`;
      const authorName = post?.userId?.username;

      const ytId = extractPostYouTubeId(post);
      const isVideo = isPlayableShortPost(post);

      if (!isVideo) {
        redirect(`/post/${id}`);
      }

      const primaryThumb = resolvePostThumbnail(post);
      const thumbnailList = [primaryThumb];
      if (ytId) {
        thumbnailList.push(
          `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
          `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        );
      }

      const videoSchema = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "@id": `${pageUrl}#video`,
        name: post.title || "FondPeace Short Video",
        headline: post.title || "FondPeace Short Video",
        description: buildDescription(post),
        thumbnailUrl: thumbnailList,
        thumbnail: {
          "@type": "ImageObject",
          url: primaryThumb,
          width: 1200,
          height: 630,
        },
        contentUrl: mediaUrl || undefined,
        embedUrl: ytId
          ? `https://www.youtube-nocookie.com/embed/${ytId}`
          : `${SITE_ROOT}/embed/short/${post._id || id}`,
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

      // Visible, prominent, above-the-fold SSR Watch Player Shell (zero sr-only / zero 1x1 hidden video)
      // Googlebot Wave 1 & users immediately see the main video player + H1 before client ReelsFeed hydrates
      const ssrWatchShell = (
        <div className="w-full h-[100dvh] bg-black text-white flex items-center justify-center relative">
          <div className="w-full md:max-w-[440px] h-[100dvh] md:h-[calc(100dvh-20px)] md:my-auto md:rounded-3xl overflow-hidden relative bg-black flex items-center justify-center md:border md:border-white/10">
            {ytId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&playsinline=1`}
                title={post.title || "FondPeace Short Video"}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : mediaUrl ? (
              <video
                src={mediaUrl}
                poster={primaryThumb}
                controls
                playsInline
                preload="metadata"
                width="720"
                height="1280"
                className="w-full h-full object-contain mx-auto"
              />
            ) : null}
            <div className="absolute inset-x-0 bottom-0 p-4 pb-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
              <p className="text-sm font-bold text-white mb-1">
                @{authorName || "FondPeace"}
              </p>
              <h1 className="text-xs sm:text-sm font-normal line-clamp-3 leading-snug text-zinc-100">
                {post.title || "FondPeace Short Video"}
              </h1>
            </div>
          </div>
        </div>
      );

      return (
        <main className="w-full h-[100dvh] bg-black text-white overflow-hidden select-none relative">
          <script
            key="video-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(videoSchema),
            }}
          />
          <ReelsFeedWrapper
            initialPost={post}
            initialRelated={related}
            ssrFallback={ssrWatchShell}
          />
        </main>
      );
    }

    // Fallback: If post is temporarily unavailable or loading, render Reels player seamlessly
    return (
      <main className="w-full h-[100dvh] bg-black text-white overflow-hidden select-none">
        <ReelsFeedWrapper initialPost={null} initialRelated={[]} />
      </main>
    );
  } catch (e) {
    if (e?.digest?.startsWith("NEXT_REDIRECT")) {
      throw e;
    }
    console.error("ShortsDetailPage component error:", e);
    return (
      <main className="w-full h-[100dvh] bg-black text-white overflow-hidden select-none">
        <ReelsFeedWrapper initialPost={null} initialRelated={[]} />
      </main>
    );
  }
}
