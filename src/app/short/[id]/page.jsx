// app/short/[id]/page.jsx — Official Canonical Single Video Watch Page (SSR + Related Videos + VideoObject)
import { cache } from "react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { Coins, ArrowRight, ShieldCheck, Film } from "lucide-react";
import SinglePostPage from "@/components/SinglePostPage";
import RelatedPosts from "@/components/RelatedPosts";
import LeftSidebar from "@/components/LeftSidebar";
import SuggestedCreatorsWidget from "@/components/SuggestedCreatorsWidget";
import { getApiBase } from "@/utils/apiConfig";
import { resolvePostThumbnail } from "@/utils/resolvePostThumbnail";
import { isPlayableShortPost, extractPostYouTubeId } from "@/utils/postMediaUtils";

const API_BASE = getApiBase().replace(/\/+$/, "");
const API_SINGLE = `${API_BASE}/post/single/`;
const SITE_ROOT = "https://www.fondpeace.com";
const DEFAULT_THUMB = `${SITE_ROOT}/Fondpeace.jpg`;

export const revalidate = 300; // Edge-cache single video watch pages for 5 minutes

const getShortWatchData = cache(async (id) => {
  try {
    const res = await fetch(`${API_SINGLE}${id}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch single video watch page:", err);
    return null;
  }
});

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
  if (!post) return "fondpeace,short,video,reels";
  if (Array.isArray(post.tags) && post.tags.length) return post.tags.join(", ");
  if (Array.isArray(post.hashtags) && post.hashtags.length)
    return post.hashtags.map((h) => h.replace("#", "")).join(", ");
  if (post.title) return post.title.split(" ").slice(0, 10).join(", ");
  return "fondpeace,short,video,reels";
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

function buildCleanTitleAndTags(post) {
  const raw = (post?.title || "").trim();
  const nonHash = raw.replace(/#[a-zA-Z0-9_]+/g, "").replace(/\s+/g, " ").trim();
  const tags = Array.from(
    new Set([
      ...(Array.isArray(post?.tags) ? post.tags : []),
      ...(raw.match(/#[a-zA-Z0-9_]+/g) || []).map((t) => t.replace("#", "")),
    ])
  )
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 8);

  const cleanTitle =
    nonHash || (tags.length ? tags.slice(0, 4).join(" ") : "FondPeace Short Video");
  return { raw, cleanTitle, tags };
}

/* ------------------------- generateMetadata ------------------------- */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return { title: "Watch Video | FondPeace" };

  try {
    const data = await getShortWatchData(id);
    const post = data?.post;
    if (!post) return { title: "Video Not Found | FondPeace" };

    const isVideo = isPlayableShortPost(post);
    if (!isVideo) {
      return {
        title: post.title || "Post | FondPeace",
        alternates: { canonical: `${SITE_ROOT}/post/${id}` },
        robots: { index: false, follow: true },
      };
    }

    const mediaUrl = toAbsolute(post.media || post.mediaUrl, "video");
    const thumb = resolvePostThumbnail(post);
    const pageUrl = `${SITE_ROOT}/short/${post._id || id}`;
    const { cleanTitle, tags } = buildCleanTitleAndTags(post);
    const authorHandle = post.userId?.username ? `@${post.userId.username}` : "FondPeace";

    const title = `${cleanTitle.slice(0, 55)} by ${authorHandle}`;
    const description = `Watch "${cleanTitle}" by ${authorHandle} on FondPeace.${
      tags.length ? ` Topics: ${tags.join(", ")}.` : ""
    } Watch, comment, and explore related videos.`;

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
        siteName: "FondPeace",
        type: "video.other",
        images: [
          {
            url: thumb,
            secureUrl: thumb,
            width: 1200,
            height: 630,
            alt: cleanTitle,
          },
        ],
        videos: mediaUrl
          ? [
              {
                url: mediaUrl,
                thumbnailUrl: thumb,
                type: "video/mp4",
                secureUrl: mediaUrl,
              },
            ]
          : undefined,
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
    console.error("Metadata error in /short/[id]:", err);
    return { title: "Watch Video | FondPeace" };
  }
}

/* ------------------------------ PAGE ------------------------------ */
export default async function SingleShortWatchPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return notFound();

  const data = await getShortWatchData(id);
  const post = data?.post || null;
  const related = Array.isArray(data?.related) ? data.related : [];

  if (!post) {
    return notFound();
  }

  const isVideo = isPlayableShortPost(post);
  if (!isVideo) {
    permanentRedirect(`/post/${id}`);
  }

  const mediaUrl = toAbsolute(post.media || post.mediaUrl, "video") || undefined;
  const pageUrl = `${SITE_ROOT}/short/${post._id || id}`;
  const authorName = post?.userId?.username || "FondPeace";
  const ytId = extractPostYouTubeId(post);
  const primaryThumb = resolvePostThumbnail(post);
  const { cleanTitle, tags } = buildCleanTitleAndTags(post);

  const thumbnailList = [primaryThumb];
  if (ytId) {
    thumbnailList.push(
      `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    );
  }

  const schemaDescription = `${cleanTitle} by @${authorName} on FondPeace.${
    tags.length ? ` Topics: ${tags.join(", ")}.` : ""
  } Watch, react, and join the community conversation.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "FondPeace", item: SITE_ROOT },
          { "@type": "ListItem", position: 2, name: authorName, item: `${SITE_ROOT}/profile/${authorName}` },
          { "@type": "ListItem", position: 3, name: cleanTitle.slice(0, 60), item: pageUrl },
        ],
      },
      {
        "@type": "VideoObject",
        "@id": `${pageUrl}#video`,
        name: cleanTitle,
        headline: cleanTitle,
        description: schemaDescription,
        keywords: extractKeywords(post),
        thumbnailUrl: thumbnailList,
        thumbnail: {
          "@type": "ImageObject",
          url: primaryThumb,
          width: 1200,
          height: 630,
        },
        contentUrl: mediaUrl,
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
          name: authorName,
          url: `${SITE_ROOT}/profile/${authorName}`,
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
        interactionStatistic: buildInteractionSchema(post),
        potentialAction: {
          "@type": "WatchAction",
          target: pageUrl,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": pageUrl,
        },
      },
    ],
  };

  return (
    <main className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-blue-600 selection:text-white overflow-x-hidden transition-colors duration-200">
      <script
        key="video-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-[76px_minmax(0,1fr)_340px]
          xl:grid-cols-[220px_minmax(0,1fr)_360px]
          max-w-[1440px]
          mx-auto
          gap-4 lg:gap-6
          px-2 sm:px-4
          py-3
        "
      >
        {/* Left Sidebar */}
        <aside className="shrink-0">
          <LeftSidebar sticky={true} />
        </aside>

        {/* Center Main Single Video Watch Column (Video + Comments + Related Videos) */}
        <section className="w-full min-w-0 space-y-4">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between py-2 px-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition active:scale-95"
              aria-label="Back to home"
            >
              <FaArrowLeft className="text-base" />
              <span>Back to Discovery</span>
            </Link>

            <Link
              href={`/shorts/${post._id || id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-rose-600/15 hover:bg-rose-600/25 text-rose-400 border border-rose-500/30 transition"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Open in Reels Feed</span>
            </Link>
          </div>

          {/* Dedicated Single Video Watch Card (Full SSR Video + Caption + Comments + Actions) */}
          <SinglePostPage initialPost={post} />

          {/* Related Videos & Community Feed */}
          <RelatedPosts
            currentPostId={post._id}
            category={post.category}
            tags={post.tags}
            initialRelated={related}
          />
        </section>

        {/* Right Sidebar (Matching Homepage & Post Page) */}
        <aside className="hidden lg:block shrink-0">
          <div className="sticky top-4 space-y-4">
            <SuggestedCreatorsWidget variant="card" />

            <div className="rounded-2xl p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg text-[var(--text-primary)] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                  <Coins className="w-3 h-3 text-amber-400" />
                  Creator Program
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  95% Payout
                </span>
              </div>
              <h3 className="font-bold text-sm mb-1 text-[var(--text-primary)]">
                Monetize Your Videos
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
                Keep 95% of direct community tips and earn 60% ad revenue from your short videos and posts.
              </p>
              <Link
                href="/monetization"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                Independent, Algorithm-Free Social Video Community on FondPeace.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="h-20 lg:hidden" />
    </main>
  );
}
