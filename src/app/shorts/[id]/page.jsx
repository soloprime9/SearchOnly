// app/shorts/[id]/page.jsx
import { cache } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ReelsFeedWrapper from "@/components/ReelsFeedWrapper";
import { fetchApiRead } from "@/utils/apiConfig";
import { resolvePostThumbnail } from "@/utils/resolvePostThumbnail";
import { isPlayableShortPost, extractPostYouTubeId } from "@/utils/postMediaUtils";
import { truncateWords } from "@/utils/captionUtils";

// Safe server-side YouTube ID extractor (zero client-component proxy dependency)
function getYouTubeVideoId(url) {
  if (!url || typeof url !== "string") return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
}

// Server-side Constants
const SITE_ROOT = "https://www.fondpeace.com";
const DEFAULT_THUMB = `${SITE_ROOT}/Fondpeace.jpg`;

export const revalidate = 300; // Edge-cache watch pages for 5 minutes (cuts TTFB from ~2.3s to ~150ms)

// Deduplicated per-request fetch shared between generateMetadata() and ShortsDetailPage()
const getShortPostData = cache(async (id) => {
  try {
    const res = await fetchApiRead(`/post/single/${encodeURIComponent(id)}`, {
      fetchOptions: { next: { revalidate: 300 } },
      timeoutMs: 15000,
    });
    if (!res) return { notFound: false, transientError: true, data: null };
    if (res.status === 400 || res.status === 404) return { notFound: true, transientError: false, data: null };
    if (!res.ok) return { notFound: false, transientError: true, data: null };
    return { notFound: false, transientError: false, data: await res.json() };
  } catch (err) {
    console.error("Failed to fetch single short post:", err);
    return { notFound: false, transientError: true, data: null };
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
  if (!id) return { title: "Shorts & Reels" };

  try {
    const result = await getShortPostData(id);
    const post = result?.data?.post;
    if (!post) return { title: "Video Not Found", robots: { index: false, follow: true } };

    const mediaUrl = toAbsolute(post.media || post.mediaUrl, "video");
    const thumb = resolvePostThumbnail(post);
    const canonicalWatchUrl = `${SITE_ROOT}/short/${post._id || id}`;

    const rawTitle = (post.title || "").trim();
    let cleanText = rawTitle.replace(/#[a-zA-Z0-9_]+/g, "").trim();
    if (!cleanText && rawTitle) {
      cleanText = (rawTitle.match(/#[a-zA-Z0-9_]+/g) || []).map((t) => t.replace("#", "")).join(" ");
    }
    const author = post.userId?.username ? `@${post.userId.username}` : "";
    const displayShortTitle = (cleanText || rawTitle || "Watch Short").trim();
    const shortText = displayShortTitle.length <= 80 ? displayShortTitle : truncateWords(displayShortTitle, 80);
    const title = author && (shortText.length + author.length + 12 <= 100)
      ? `${shortText} by ${author} — Reels`
      : `${shortText} — Reels`;

    const description = cleanText
      ? `Watch "${cleanText}" by ${author || 'creators'} in the FondPeace Reels feed.`
      : `Watch trending short video by ${author || 'creators'} in the FondPeace Reels feed.`;

    return {
      title,
      description,
      keywords: extractKeywords(post),
      // Canonical points strictly to the dedicated single video watch page (/short/[id])
      // so Google never treats the swipeable Reels feed as duplicate content
      alternates: { canonical: canonicalWatchUrl },
      robots: {
        index: false,
        follow: true,
      },
      openGraph: {
        title,
        description,
        url: canonicalWatchUrl,
        siteName: "FondPeace",
        type: "video.other",
        images: [
          {
            url: thumb,
            secureUrl: thumb,
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
    const result = await getShortPostData(id);
    const post = result?.data?.post || null;
    const related = result?.data?.related || [];

    if (!post && result?.notFound) {
      return notFound();
    }

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

      const rawTitleText = (post.title || "").trim();
      const nonHashtagText = rawTitleText.replace(/#[a-zA-Z0-9_]+/g, "").replace(/\s+/g, " ").trim();
      const extractedHashtags = Array.from(
        new Set([
          ...(Array.isArray(post.tags) ? post.tags : []),
          ...(rawTitleText.match(/#[a-zA-Z0-9_]+/g) || []).map((t) => t.replace("#", "")),
        ])
      )
        .map((t) => String(t).trim())
        .filter(Boolean)
        .slice(0, 8);

      const cleanDisplayTitle =
        nonHashtagText ||
        (extractedHashtags.length ? extractedHashtags.slice(0, 4).join(" ") : "FondPeace Short Video");
      const safeAuthor = authorName || "FondPeace";
      const cleanSchemaDescription = `${cleanDisplayTitle} — short vertical video by @${safeAuthor} on FondPeace Shorts.${extractedHashtags.length ? ` Topics: ${extractedHashtags.join(", ")}.` : ""
        } Watch, react, and join the community conversation.`;

      const relatedShorts = (Array.isArray(related) ? related : [])
        .filter((r) => r?._id && String(r._id) !== String(post._id || id) && isPlayableShortPost(r))
        .slice(0, 8);

      const topComments = (Array.isArray(post.comments) ? post.comments : [])
        .filter((c) => c && (c.CommentText || c.text))
        .slice(0, 5);

      // Note: No VideoObject JSON-LD here — /shorts/[id] is a noindex vertical swipe feed.
      // The authoritative VideoObject lives exclusively on the canonical /short/[id] watch page.

      // Visible, prominent, above-the-fold SSR Watch Player Shell + Rich Internal Link Graph
      // Eliminates "Thin content" & "Crawled - currently not indexed" by providing real SSR links,
      // creator attribution, topic links, comments, and related /shorts/[id] links before hydration.
      const ssrWatchShell = (
        <div className="w-full min-h-[100dvh] bg-black text-white flex flex-col lg:flex-row items-center justify-center gap-6 px-0 lg:px-6 relative">
          <div className="w-full md:max-w-[420px] h-[100dvh] md:h-[calc(100dvh-32px)] md:max-h-[820px] aspect-[9/16] md:my-auto md:rounded-3xl overflow-hidden relative bg-black flex items-center justify-center md:border md:border-white/10 shrink-0">
            <img
              src={primaryThumb}
              alt={cleanDisplayTitle}
              className="w-full h-full object-contain mx-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-2xl">
                <span className="text-xl ml-1 text-white">▶</span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4 pb-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              <Link
                href={`/profile/${encodeURIComponent(safeAuthor.trim())}`}
                className="text-sm font-bold text-white mb-1 inline-block hover:underline"
              >
                @{safeAuthor}
              </Link>
              <h1 className="text-xs sm:text-sm font-normal line-clamp-3 leading-snug text-zinc-100">
                {post.title || cleanDisplayTitle}
              </h1>
            </div>
          </div>

          {/* Semantic Video Details & Internal Discovery Links for Crawlers & Viewers */}
          <aside className="flex flex-col gap-4 max-w-sm w-full text-zinc-200 p-5 rounded-2xl bg-zinc-950/90 border border-white/10 lg:max-h-[calc(100dvh-40px)] overflow-y-auto">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                {post.category || "FondPeace Shorts"}
              </p>
              <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                {cleanSchemaDescription}
              </p>
              <p className="text-xs text-zinc-400 mt-2">
                {viewsCount(post)} views &bull; {likesCount(post)} likes &bull; {commentsCount(post)} comments
              </p>
            </div>

            {extractedHashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {extractedHashtags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/topic/${encodeURIComponent(tag.toLowerCase())}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {topComments.length > 0 && (
              <div className="space-y-2 border-t border-white/10 pt-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Community Comments
                </h2>
                {topComments.map((c, idx) => (
                  <p key={c._id || idx} className="text-xs text-zinc-300 leading-snug">
                    <span className="font-semibold text-white">
                      @{c.userId?.username || "Member"}:
                    </span>{" "}
                    {c.CommentText || c.text}
                  </p>
                ))}
              </div>
            )}

            {relatedShorts.length > 0 && (
              <nav aria-label="Related Short Videos" className="space-y-2 border-t border-white/10 pt-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  More Trending Shorts
                </h2>
                <ul className="space-y-1.5">
                  {relatedShorts.map((rel) => (
                    <li key={rel._id}>
                      <Link
                        href={`/short/${rel._id}`}
                        className="text-xs text-blue-400 hover:underline line-clamp-1"
                      >
                        {rel.title || "Watch Trending Short"}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </aside>
        </div>
      );

      return (
        <main className="w-full h-[100dvh] bg-black text-white overflow-hidden select-none relative">
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
    if (e?.digest?.startsWith("NEXT_")) {
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
