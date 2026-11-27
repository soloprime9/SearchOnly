// Unified SSR Single Post & Media Watch Page (Videos, YouTube, Photos, Links, Polls, Discussions)
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { Coins, ArrowRight, ShieldCheck } from "lucide-react";
import SinglePostPage from "@/components/SinglePostPage";
import RelatedPosts from "@/components/RelatedPosts";
import LeftSidebar from "@/components/LeftSidebar";
import SuggestedCreatorsWidget from "@/components/SuggestedCreatorsWidget";
import { fetchApiRead } from "@/utils/apiConfig";
import { resolvePostThumbnail } from "@/utils/resolvePostThumbnail";
import { isPlayableShortPost, extractPostYouTubeId } from "@/utils/postMediaUtils";
import {
  truncateWords,
  splitCaption,
  buildReadableFallbackHeadline,
} from "@/utils/captionUtils";

const SITE_ROOT = "https://www.fondpeace.com";
const SITE_ORG_ID = `${SITE_ROOT}/#organization`;
const SITE_WEBSITE_ID = `${SITE_ROOT}/#website`;
const SITE_LOGO_URL = `${SITE_ROOT}/FondPeace-1200x630.jpg`;
const DEFAULT_AVATAR = `${SITE_ROOT}/Fondpeace.jpg`;

export const revalidate = 3600; // Edge-cache single post pages for 1 hour (resilient SSR & fast TTFB)

/* ---------------------- HELPERS ---------------------- */
function toAbsolute(url) {
  if (!url || typeof url !== "string") return null;
  const s = url.trim();
  if (!s) return null;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("//")) return `https:${s}`;
  if (s.startsWith("/")) return `${SITE_ROOT}${s}`;
  return `${SITE_ROOT}/${s}`;
}

function secToISO(sec) {
  const s = Math.round(Number(sec));
  if (!Number.isFinite(s) || s <= 0) return undefined;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const secLeft = s % 60;
  let iso = "PT";
  if (h > 0) iso += `${h}H`;
  if (m > 0) iso += `${m}M`;
  if (secLeft > 0 || (h === 0 && m === 0)) iso += `${secLeft}S`;
  return iso;
}

function likesCount(post) {
  if (Array.isArray(post?.likes)) return post.likes.length;
  if (typeof post?.likes === "number") return post.likes;
  return 0;
}

function commentsCount(post) {
  if (Array.isArray(post?.comments)) return post.comments.length;
  if (typeof post?.commentCount === "number") return post.commentCount;
  return 0;
}

function viewsCount(post) {
  if (typeof post?.views === "number") return post.views;
  return 0;
}

function safeIsoDate(value) {
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? new Date(ts).toISOString() : new Date().toISOString();
}

function extractPostTags(post) {
  const inlineTags = String(post?.title || "").match(/#[\w\u0590-\u05ff\u0900-\u097f]+/g) || [];
  const raw = [
    ...(Array.isArray(post?.tags) ? post.tags : []),
    ...(Array.isArray(post?.hashtags) ? post.hashtags : []),
    ...inlineTags,
  ]
    .map((t) => String(t || "").replace(/^#+/, "").trim())
    .filter(Boolean);
  return Array.from(new Set(raw)).slice(0, 12);
}

function buildKeywords(post, headline) {
  const tags = extractPostTags(post);
  if (tags.length > 0) {
    return Array.from(new Set([...tags, post?.category, "FondPeace"].filter(Boolean))).join(", ");
  }
  const titleWords = String(headline || post?.title || "FondPeace")
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 8);
  return Array.from(new Set([...titleWords, post?.category, "FondPeace"].filter(Boolean))).join(", ");
}

function buildMediaInfo(post) {
  const isVideo = isPlayableShortPost(post);
  const ytId = isVideo ? extractPostYouTubeId(post) : null;
  const mediaUrl = toAbsolute(post?.media || post?.mediaUrl);
  const isNativeVideo = isVideo && !ytId && Boolean(mediaUrl);
  const isImage =
    !isVideo &&
    Boolean(mediaUrl) &&
    (/^image\//i.test(post?.mediaType || "") ||
      /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp|svg|jfif)(\?|#|$)/i.test(mediaUrl));

  const resolvedThumb = resolvePostThumbnail(post);
  const width = Number(post?.width) > 0 ? Number(post.width) : ytId ? 1280 : isNativeVideo ? 720 : 1200;
  const height = Number(post?.height) > 0 ? Number(post.height) : ytId ? 720 : isNativeVideo ? 1280 : 630;

  return {
    isVideo,
    ytId,
    mediaUrl,
    isNativeVideo,
    isImage,
    resolvedThumb,
    width,
    height,
  };
}

function buildPostSeoContent(post, mediaInfo) {
  const { isVideo, isImage } = mediaInfo;
  const fallbackLabel = isVideo ? "Creator Video" : isImage ? "Creator Photo" : "Community Discussion";
  const readableFallback = buildReadableFallbackHeadline(post, fallbackLabel);
  const rawCaption = String(post?.title || "").trim();
  const explicitDesc = String(post?.description || "").trim();

  const { headline, body, fullClean } = splitCaption(rawCaption, explicitDesc, readableFallback);
  const cleanHeadline = (headline || readableFallback).trim();
  const authorUsername = String(post?.userId?.username || "FondPeace").trim();
  const authorHandle = authorUsername && authorUsername !== "FondPeace" ? `@${authorUsername}` : "FondPeace";

  const likes = likesCount(post);
  const comments = commentsCount(post);
  const views = viewsCount(post);
  const pluralize = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  const statsParts = [];
  if (views > 0) statsParts.push(pluralize(views, "view"));
  if (likes > 0) statsParts.push(pluralize(likes, "like"));
  if (comments > 0) statsParts.push(pluralize(comments, "comment"));
  const statsSuffix = statsParts.length > 0 ? ` (${statsParts.join(", ")})` : "";

  const actionVerb = isVideo ? "Watch video" : isImage ? "View photo" : "Read discussion";
  const attribution = `${actionVerb} by ${authorHandle} on FondPeace${statsSuffix}.`;
  const narrative = (fullClean || cleanHeadline).replace(/\s+/g, " ").trim();

  // Keep headline + author/action visible within ~195 chars even for long articles
  const shortSummary =
    narrative.length > 135
      ? `${truncateWords(cleanHeadline, 105)} — ${attribution}`
      : `${narrative} — ${attribution}`;

  return {
    headline: cleanHeadline,
    body,
    fullClean: narrative,
    metaDescription: truncateWords(shortSummary, 195),
    schemaDescription: truncateWords(`${narrative} — ${attribution}`, 480),
    authorUsername,
    authorHandle,
    likes,
    comments,
    views,
  };
}

const getPostDetailData = cache(async (id) => {
  if (!id || !/^[a-zA-Z0-9_-]{6,64}$/.test(id)) {
    return { notFound: true, transientError: false, data: null };
  }

  let primaryResult = null;
  try {
    const res = await fetchApiRead(`/post/single/${encodeURIComponent(id)}`, {
      fetchOptions: { next: { revalidate: 3600 } },
      timeoutMs: 18000,
    });
    if (res?.ok) {
      const payload = await res.json();
      if (payload?.post) {
        return { notFound: false, transientError: false, data: payload };
      }
    }
    primaryResult = res;
  } catch {
    primaryResult = null;
  }

  // Fallback to legacy /post/image/[id] endpoint if /post/single didn't return a payload
  try {
    const res = await fetchApiRead(`/post/image/${encodeURIComponent(id)}`, {
      fetchOptions: { next: { revalidate: 3600 } },
      timeoutMs: 18000,
    });
    if (!res) {
      if (primaryResult && (primaryResult.status === 400 || primaryResult.status === 404)) {
        return { notFound: true, transientError: false, data: null };
      }
      return { notFound: false, transientError: true, data: null };
    }
    if (res.status === 400 || res.status === 404) {
      return { notFound: true, transientError: false, data: null };
    }
    if (!res.ok) {
      return { notFound: false, transientError: true, status: res.status, data: null };
    }
    const payload = await res.json();
    if (!payload?.post) {
      return { notFound: true, transientError: false, data: null };
    }
    return { notFound: false, transientError: false, data: payload };
  } catch {
    return { notFound: false, transientError: true, data: null };
  }
});

/* ------------------------- generateMetadata ------------------------- */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return { title: "Community Post" };
  const pageUrl = `${SITE_ROOT}/post/${encodeURIComponent(id)}`;

  try {
    const result = await getPostDetailData(id);
    const post = result?.data?.post;

    if (result?.notFound || (!result?.transientError && !post)) {
      return { title: "Post Not Found", robots: { index: false, follow: true } };
    }
    if (!post) return { title: "Community Post" };

    const mediaInfo = buildMediaInfo(post);
    const { isVideo, ytId, mediaUrl, isNativeVideo, resolvedThumb, width, height } = mediaInfo;
    const seo = buildPostSeoContent(post, mediaInfo);

    const titleShort = truncateWords(seo.headline, 80);
    const titleTag =
      seo.authorHandle !== "FondPeace" && titleShort.length + seo.authorHandle.length + 4 <= 98
        ? `${titleShort} by ${seo.authorHandle}`
        : titleShort;
    const ogTitle = truncateWords(seo.headline, 110);
    const tags = extractPostTags(post);
    const publishedTime = safeIsoDate(post.createdAt);
    const modifiedTime = safeIsoDate(post.updatedAt || post.createdAt);
    const encodedAuthor = encodeURIComponent(seo.authorUsername);
    const authorProfileUrl = `${SITE_ROOT}/profile/${encodedAuthor}`;

    return {
      title: titleTag,
      description: seo.metaDescription,
      keywords: buildKeywords(post, seo.headline),
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
        title: ogTitle,
        description: seo.metaDescription,
        url: pageUrl,
        siteName: "FondPeace",
        locale: "en_US",
        type: isVideo ? "video.other" : "article",
        ...(!isVideo
          ? {
              publishedTime,
              modifiedTime,
              authors: [authorProfileUrl],
              ...(tags.length > 0 ? { tags } : {}),
            }
          : {}),
        images: [
          {
            url: resolvedThumb,
            secureUrl: resolvedThumb,
            width,
            height,
            alt: ogTitle,
          },
        ],
        ...(isNativeVideo
          ? {
              videos: [
                {
                  url: mediaUrl,
                  secureUrl: mediaUrl,
                  type: "video/mp4",
                  width,
                  height,
                },
              ],
            }
          : ytId
            ? {
                videos: [
                  {
                    url: `https://www.youtube.com/embed/${ytId}`,
                    secureUrl: `https://www.youtube.com/embed/${ytId}`,
                    type: "text/html",
                    width: 1280,
                    height: 720,
                  },
                ],
              }
            : {}),
      },
      twitter: isNativeVideo
        ? {
            card: "player",
            site: "@FondPeaceTech",
            title: titleTag,
            description: seo.metaDescription,
            images: [resolvedThumb],
            players: [
              {
                playerUrl: pageUrl,
                streamUrl: mediaUrl,
                width,
                height,
              },
            ],
          }
        : ytId
          ? {
              card: "player",
              site: "@FondPeaceTech",
              title: titleTag,
              description: seo.metaDescription,
              images: [resolvedThumb],
              players: [
                {
                  playerUrl: `https://www.youtube-nocookie.com/embed/${ytId}`,
                  streamUrl: `https://www.youtube.com/watch?v=${ytId}`,
                  width: 1280,
                  height: 720,
                },
              ],
            }
          : {
              card: "summary_large_image",
              site: "@FondPeaceTech",
              title: titleTag,
              description: seo.metaDescription,
              images: [resolvedThumb],
            },
    };
  } catch {
    return { title: "Community Post" };
  }
}

/* ------------------------------ PAGE ------------------------------ */
export default async function Page({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return notFound();

  const result = await getPostDetailData(id);
  if (result?.transientError) {
    // Prevent temporary upstream timeouts from becoming cached Soft 404s for Googlebot
    throw new Error("Temporary upstream backend cold-start timeout; retry shortly.");
  }
  const data = result?.data;
  const post = data?.post;
  if (!post) return notFound();

  const related = Array.isArray(data?.related) ? data.related : [];
  const mediaInfo = buildMediaInfo(post);
  const { isVideo, ytId, mediaUrl, isNativeVideo, isImage, resolvedThumb, width, height } = mediaInfo;
  const seo = buildPostSeoContent(post, mediaInfo);

  const pageUrl = `${SITE_ROOT}/post/${encodeURIComponent(post._id || id)}`;
  const encodedAuthor = encodeURIComponent(seo.authorUsername);
  const authorProfileUrl = `${SITE_ROOT}/profile/${encodedAuthor}`;
  const authorAvatar =
    toAbsolute(post.userId?.profilePicture || post.userId?.profilePic || post.userId?.avatar) || DEFAULT_AVATAR;

  const publishedIso = safeIsoDate(post.createdAt);
  const modifiedIso = safeIsoDate(post.updatedAt || post.createdAt);
  const videoDurationIso = secToISO(post.duration);
  const keywordsStr = buildKeywords(post, seo.headline);
  const isArticle =
    post.postType === "article" || (typeof post?.title === "string" && post.title.split(/\s+/).length > 250);
  const primarySchemaType = isArticle ? "BlogPosting" : "DiscussionForumPosting";

  const publisherSchema = {
    "@type": "Organization",
    "@id": SITE_ORG_ID,
    "name": "FondPeace",
    "url": SITE_ROOT,
    "logo": {
      "@type": "ImageObject",
      "url": SITE_LOGO_URL,
      "width": 1200,
      "height": 630,
    },
  };

  const authorSchema = {
    "@type": "Person",
    "@id": `${authorProfileUrl}#person`,
    "name": seo.authorUsername,
    "url": authorProfileUrl,
    "image": authorAvatar,
  };

  const webPageId = `${pageUrl}#webpage`;
  const primaryMediaId = isVideo ? `${pageUrl}#video` : isImage ? `${pageUrl}#image` : `${pageUrl}#main`;

  const videoThumbList = ytId
    ? Array.from(
        new Set([
          resolvedThumb,
          `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
          `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        ])
      )
    : [resolvedThumb];

  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "FondPeace", "item": SITE_ROOT },
          { "@type": "ListItem", "position": 2, "name": seo.authorUsername, "item": authorProfileUrl },
          { "@type": "ListItem", "position": 3, "name": truncateWords(seo.headline, 95), "item": pageUrl },
        ],
      },
      {
        "@type": "WebPage",
        "@id": webPageId,
        "url": pageUrl,
        "name": truncateWords(seo.headline, 110),
        "description": seo.metaDescription,
        "isPartOf": { "@id": SITE_WEBSITE_ID },
        "breadcrumb": { "@id": `${pageUrl}#breadcrumb` },
        "primaryImageOfPage": { "@type": "ImageObject", "url": resolvedThumb },
        "mainEntity": { "@id": primaryMediaId },
        "datePublished": publishedIso,
        "dateModified": modifiedIso,
      },
      ...(isVideo
        ? [
            {
              "@type": "VideoObject",
              "@id": `${pageUrl}#video`,
              "url": pageUrl,
              "name": truncateWords(seo.headline, 110),
              "headline": truncateWords(seo.headline, 110),
              "description": seo.schemaDescription,
              "keywords": keywordsStr,
              "thumbnailUrl": videoThumbList,
              "thumbnail": { "@type": "ImageObject", "url": resolvedThumb },
              "uploadDate": publishedIso,
              "datePublished": publishedIso,
              "dateModified": modifiedIso,
              "width": width,
              "height": height,
              ...(videoDurationIso ? { "duration": videoDurationIso } : {}),
              ...(isNativeVideo
                ? {
                    "contentUrl": mediaUrl,
                    "embedUrl": pageUrl,
                    "encodingFormat": "video/mp4",
                  }
                : {}),
              ...(ytId
                ? {
                    "embedUrl": `https://www.youtube-nocookie.com/embed/${ytId}`,
                  }
                : {}),
              "isAccessibleForFree": true,
              "isFamilyFriendly": true,
              "inLanguage": "en",
              "mainEntityOfPage": { "@type": "WebPage", "@id": webPageId },
              "author": authorSchema,
              "creator": authorSchema,
              "publisher": publisherSchema,
              "potentialAction": {
                "@type": "WatchAction",
                "target": pageUrl,
              },
              "interactionStatistic": [
                {
                  "@type": "InteractionCounter",
                  "interactionType": "https://schema.org/WatchAction",
                  "userInteractionCount": seo.views,
                },
                {
                  "@type": "InteractionCounter",
                  "interactionType": "https://schema.org/LikeAction",
                  "userInteractionCount": seo.likes,
                },
                {
                  "@type": "InteractionCounter",
                  "interactionType": "https://schema.org/CommentAction",
                  "userInteractionCount": seo.comments,
                },
              ],
            },
          ]
        : isImage && mediaUrl
          ? [
              {
                "@type": "ImageObject",
                "@id": `${pageUrl}#image`,
                "url": pageUrl,
                "contentUrl": mediaUrl,
                "thumbnailUrl": resolvedThumb,
                "name": truncateWords(seo.headline, 110),
                "headline": truncateWords(seo.headline, 110),
                "caption": seo.fullClean || seo.headline,
                "description": seo.schemaDescription,
                "keywords": keywordsStr,
                "datePublished": publishedIso,
                "dateModified": modifiedIso,
                "isAccessibleForFree": true,
                "isFamilyFriendly": true,
                "mainEntityOfPage": { "@type": "WebPage", "@id": webPageId },
                "author": authorSchema,
                "creator": authorSchema,
                "publisher": publisherSchema,
                "potentialAction": {
                  "@type": "ViewAction",
                  "target": pageUrl,
                },
                "interactionStatistic": [
                  {
                    "@type": "InteractionCounter",
                    "interactionType": "https://schema.org/LikeAction",
                    "userInteractionCount": seo.likes,
                  },
                  {
                    "@type": "InteractionCounter",
                    "interactionType": "https://schema.org/CommentAction",
                    "userInteractionCount": seo.comments,
                  },
                ],
              },
            ]
          : []),
      {
        "@type": primarySchemaType,
        "@id": `${pageUrl}#main`,
        "url": pageUrl,
        "headline": truncateWords(seo.headline, 110),
        "description": seo.schemaDescription,
        "articleBody": seo.fullClean || seo.headline,
        "name": truncateWords(seo.headline, 110),
        "keywords": keywordsStr,
        "isAccessibleForFree": true,
        "mainEntityOfPage": { "@type": "WebPage", "@id": webPageId },
        "datePublished": publishedIso,
        "dateModified": modifiedIso,
        "author": authorSchema,
        "publisher": publisherSchema,
        ...(isArticle
          ? {
              "wordCount": post.title ? post.title.split(/\s+/).length : 0,
              "inLanguage": "en",
            }
          : {}),
        ...(isVideo
          ? { "video": { "@id": `${pageUrl}#video` } }
          : isImage && mediaUrl
            ? { "image": { "@id": `${pageUrl}#image` } }
            : {}),
        ...(!isImage || !mediaUrl
          ? {
              "image": {
                "@type": "ImageObject",
                "url": resolvedThumb,
              },
            }
          : {}),
        ...(post.linkPreview?.url
          ? {
              "sharedContent": {
                "@type": "WebPage",
                "@id": post.linkPreview.url,
                "url": post.linkPreview.url,
                "name": post.linkPreview.title || post.linkPreview.url,
                "description": post.linkPreview.description || "",
                ...(post.linkPreview.image ? { "image": post.linkPreview.image } : {}),
              },
            }
          : {}),
        "interactionStatistic": [
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/LikeAction",
            "userInteractionCount": seo.likes,
          },
          {
            "@type": "InteractionCounter",
            "interactionType": isVideo ? "https://schema.org/WatchAction" : "https://schema.org/ReadAction",
            "userInteractionCount": seo.views,
          },
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/CommentAction",
            "userInteractionCount": seo.comments,
          },
        ],
        "commentCount": seo.comments,
        "comment": (Array.isArray(post.comments) ? post.comments : []).map((c) => {
          const cAuthor = c.userId?.username || "User";
          return {
            "@type": "Comment",
            "@id": `${pageUrl}#comment-${c._id}`,
            "text": c.CommentText || "",
            "dateCreated": safeIsoDate(c.createdAt),
            "author": {
              "@type": "Person",
              "name": cAuthor,
              "url": `${SITE_ROOT}/profile/${encodeURIComponent(cAuthor)}`,
            },
          };
        }),
        "relatedLink": related.map((r) => `${SITE_ROOT}/post/${r._id}`),
      },
    ],
  };

  return (
    <main className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-blue-600 selection:text-white transition-colors duration-200 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
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

        {/* Center Main Post & Watch Column */}
        <section className="w-full min-w-0 space-y-4">
          {/* Top Navigation & Semantic Breadcrumb Trail */}
          <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-1">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition active:scale-95 shrink-0"
                aria-label="Back to home"
              >
                <FaArrowLeft className="text-base" />
                <span>Home</span>
              </Link>
              <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-secondary)] min-w-0 truncate">
                <span aria-hidden="true">/</span>
                <Link href={`/profile/${encodedAuthor}`} className="hover:text-[var(--text-primary)] hover:underline truncate max-w-[140px]">
                  {seo.authorHandle}
                </Link>
                <span aria-hidden="true">/</span>
                <span className="text-[var(--text-primary)] font-medium truncate max-w-[260px]">
                  {truncateWords(seo.headline, 60)}
                </span>
              </nav>
            </div>

            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] shrink-0">
              {isVideo ? "Video Watch Page" : isImage ? "Photo Post" : "Community Post"}
            </span>
          </div>

          {/* Full Post Card */}
          <SinglePostPage initialPost={post} />

          {/* Related Community Feed */}
          <RelatedPosts
            currentPostId={post._id}
            category={post.category}
            tags={post.tags}
            initialRelated={related}
          />
        </section>

        {/* Right Sidebar (Matching Homepage) */}
        <aside className="hidden lg:block shrink-0">
          <div className="sticky top-4 space-y-4">
            <SuggestedCreatorsWidget variant="card" />

            <div className="rounded-2xl p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg text-[var(--text-primary)] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                  <Coins className="w-3 h-3 text-blue-400" />
                  Creator Program
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  Open Access
                </span>
              </div>
              <h3 className="font-bold text-sm mb-1 text-[var(--text-primary)]">Grow as a Creator</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
                Publish original posts, videos, and discussions, track audience insights, and explore creator partnerships on FondPeace.
              </p>
              <Link
                href="/monetization"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
              >
                <span>Explore Creator Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                Protected &amp; Verified Creator Network under 2026 Community Standards.
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
