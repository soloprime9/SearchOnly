// Unified SSR Single Post Page for Photos & Videos (Matched 1:1 to falconspido SEO/Metadata/Schema, using FondPeace UI)
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
import { truncateWords } from "@/utils/captionUtils";

const SITE_ROOT = "https://www.fondpeace.com";
const DEFAULT_COVER = `${SITE_ROOT}/FondPeace-1200x630.jpg`;
const SITE_LOGO = `${SITE_ROOT}/Fondpeace.jpg`;

export const revalidate = 3600;

/* ---------------------- FALCONSPIDO-MATCHED NORMALIZER & SEO BUILDERS ---------------------- */
function safeMediaUrl(raw) {
  if (!raw || typeof raw !== "string") return "";
  const s = raw.trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return `${SITE_ROOT}${s}`;
  return "";
}

function parseTimestampMs(post) {
  const ts = Date.parse(post?.createdAt);
  if (Number.isFinite(ts)) return ts;
  const id = String(post?._id || "");
  if (/^[a-f0-9]{24}$/i.test(id)) {
    return parseInt(id.slice(0, 8), 16) * 1000;
  }
  return Date.now();
}

/**
 * Strictly normalizes Photo & Direct Video posts (identical to falconspido's normalizeServerPost).
 * Returns null for YouTube embeds, text-only posts, polls, or links without direct image/video media.
 */
function normalizeMediaPost(post) {
  if (!post || !post._id) return null;

  const mediaUrl = safeMediaUrl(
    post.media || post.mediaUrl || (post.medias && post.medias.url) || ""
  );
  if (!mediaUrl || /(youtube\.com|youtu\.be)/i.test(mediaUrl)) return null;

  const mt = String(post.mediaType || "").toLowerCase();
  const isVideo = mt.startsWith("video") || /\.(mp4|mov|webm|mkv|m4v)(\?|#|$)/i.test(mediaUrl);
  const isPhoto =
    !isVideo &&
    (mt.startsWith("image") || /\.(jpe?g|png|webp|gif|avif|bmp|svg|jfif)(\?|#|$)/i.test(mediaUrl));

  if (!isVideo && !isPhoto) return null;

  const tags = Array.isArray(post.tags)
    ? post.tags.map((t) => String(t || "").replace(/^#+/, "").trim()).filter(Boolean)
    : Array.isArray(post.hashtags)
      ? post.hashtags.map((h) => String(h || "").replace(/^#+/, "").trim()).filter(Boolean)
      : [];

  const createdMs = parseTimestampMs(post);
  const createdAt = post.createdAt || new Date(createdMs).toISOString();
  const updatedAt = post.updatedAt || createdAt;

  return {
    id: String(post._id),
    kind: isVideo ? "video" : "image",
    mediaUrl,
    thumbUrl: safeMediaUrl(post.thumbnail || (isPhoto ? mediaUrl : "")),
    title:
      String(post.title || "").trim() ||
      `Latest ${isVideo ? "Video" : "Photo"} on fondpeace.com`,
    description: String(post.description || "").trim(),
    tags,
    location: String(post.location || "").trim(),
    duration: Number(post.duration || 0),
    width: Number(post.width || 1280),
    height: Number(post.height || 720),
    views: Number(post.views || 0),
    likesCount: Array.isArray(post.likes) ? post.likes.length : Number(post.likes || 0),
    commentsCount: Array.isArray(post.comments)
      ? post.comments.length
      : Number(post.commentCount || 0),
    comments: Array.isArray(post.comments) ? post.comments : [],
    createdAt,
    updatedAt,
    user: {
      username: String((post.userId && (post.userId.username || post.userId.name)) || "fondpeace"),
      avatar: safeMediaUrl(
        post.userId && (post.userId.profilePicture || post.userId.profilePic || post.userId.avatar)
      ),
      verified: Boolean(post.userId && (post.userId.isVerified || post.userId.isEmailVerified)),
    },
    raw: post,
  };
}

function formatIsoDur(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  if (!s) return undefined;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${r || (!h && !m) ? `${r}S` : ""}`;
}

function buildSinglePostSeoDescription(p) {
  const verb = p.kind === "video" ? "watch" : "view";
  const snippet = p.description ? `${p.description.slice(0, 110)} — ` : "";
  return `🔥 ${p.views} Views, ${p.likesCount} Likes, ${p.commentsCount} Comments — ${snippet}${verb} "${p.title}" uploaded by ${p.user.username} on fondpeace.com.`;
}

function extractKeywords(p) {
  if (p.tags && p.tags.length) return p.tags.join(", ");
  return p.title.split(/\s+/).filter(Boolean).slice(0, 10).join(", ");
}

function buildSinglePostSsrJsonLd(p) {
  const pageUrl = `${SITE_ROOT}/post/${encodeURIComponent(p.id)}`;
  const desc = buildSinglePostSeoDescription(p);
  const kw = extractKeywords(p);
  const thumb = p.thumbUrl || (p.kind === "image" ? p.mediaUrl : DEFAULT_COVER) || DEFAULT_COVER;
  const interactionStatistic = [
    {
      "@type": "InteractionCounter",
      interactionType: { "@type": "LikeAction" },
      userInteractionCount: p.likesCount,
    },
    {
      "@type": "InteractionCounter",
      interactionType: { "@type": "CommentAction" },
      userInteractionCount: p.commentsCount,
    },
    {
      "@type": "InteractionCounter",
      interactionType: { "@type": "WatchAction" },
      userInteractionCount: p.views,
    },
  ];
  const publisher = {
    "@type": "Organization",
    name: "fondpeace.com",
    url: SITE_ROOT,
    logo: { "@type": "ImageObject", url: SITE_LOGO, width: 600, height: 600 },
  };

  let mediaObj;
  if (p.kind === "video") {
    mediaObj = {
      "@type": "VideoObject",
      "@id": `${pageUrl}#video`,
      url: pageUrl,
      name: p.title,
      headline: p.title,
      description: desc,
      thumbnailUrl: thumb,
      contentUrl: p.mediaUrl,
      embedUrl: pageUrl,
      uploadDate: new Date(p.createdAt).toISOString(),
      datePublished: new Date(p.createdAt).toISOString(),
      dateModified: new Date(p.updatedAt).toISOString(),
      width: p.width || 1280,
      height: p.height || 720,
      encodingFormat: "video/mp4",
      publisher,
      author: { "@type": "Person", name: p.user.username },
      creator: { "@type": "Person", name: p.user.username },
      interactionStatistic,
      keywords: kw,
      isFamilyFriendly: true,
      potentialAction: { "@type": "WatchAction", target: pageUrl },
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    };
    const dur = formatIsoDur(p.duration);
    if (dur) mediaObj.duration = dur;
  } else {
    mediaObj = {
      "@type": "ImageObject",
      "@id": `${pageUrl}#image`,
      url: pageUrl,
      name: p.title,
      headline: p.title,
      description: desc,
      contentUrl: p.mediaUrl,
      thumbnailUrl: thumb,
      datePublished: new Date(p.createdAt).toISOString(),
      dateModified: new Date(p.updatedAt).toISOString(),
      publisher,
      author: { "@type": "Person", name: p.user.username },
      interactionStatistic,
      keywords: kw,
      isFamilyFriendly: true,
      potentialAction: { "@type": "ViewAction", target: pageUrl },
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_ROOT}/#website`,
        name: "fondpeace.com",
        url: SITE_ROOT,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ROOT}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: p.user.username,
            item: `${SITE_ROOT}/profile/${encodeURIComponent(p.user.username)}`,
          },
          { "@type": "ListItem", position: 3, name: p.title, item: pageUrl },
        ],
      },
      mediaObj,
    ],
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

/* ------------------------- generateMetadata (Matched to falconspido) ------------------------- */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) {
    return {
      title: { absolute: "Post — Photo & Video | fondpeace.com" },
      robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
    };
  }

  try {
    const result = await getPostDetailData(id);
    const post = result?.data?.post;

    if (result?.notFound || (!result?.transientError && !post)) {
      return {
        title: { absolute: "404 Post Not Found | fondpeace.com" },
        robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
      };
    }
    if (!post) {
      return { title: { absolute: "Post — Photo & Video | fondpeace.com" } };
    }

    const norm = normalizeMediaPost(post);
    if (!norm) {
      // Strictly Photo & Video posts are indexed on /post/[id] (non-media posts stay noindex)
      return {
        title: { absolute: "Post — Photo & Video | fondpeace.com" },
        description: "Watch and explore creator photos and videos on fondpeace.com.",
        robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
      };
    }

    const pageUrl = `${SITE_ROOT}/post/${encodeURIComponent(norm.id)}`;
    const titleTag = `${norm.title} - fondpeace.com`;
    const desc = buildSinglePostSeoDescription(norm);
    const kw = extractKeywords(norm);
    let absThumb = norm.thumbUrl || DEFAULT_COVER;
    if (norm.kind === "image" && /^https?:\/\//i.test(norm.mediaUrl)) {
      absThumb = norm.mediaUrl;
    }

    return {
      title: { absolute: titleTag },
      description: desc,
      keywords: kw,
      alternates: { canonical: pageUrl },
      robots: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-video-preview": -1,
          "max-snippet": -1,
        },
      },
      openGraph: {
        type: norm.kind === "video" ? "video.other" : "article",
        siteName: "fondpeace.com",
        url: pageUrl,
        title: titleTag,
        description: desc,
        images: [
          {
            url: absThumb,
            alt: norm.title,
          },
        ],
        ...(norm.kind === "video"
          ? {
              videos: [
                {
                  url: norm.mediaUrl,
                  type: "video/mp4",
                  width: norm.width || 1280,
                  height: norm.height || 720,
                },
              ],
            }
          : {}),
      },
      twitter:
        norm.kind === "video"
          ? {
              card: "player",
              title: titleTag,
              description: desc,
              images: [absThumb],
              players: [
                {
                  playerUrl: norm.mediaUrl,
                  streamUrl: norm.mediaUrl,
                  width: norm.width || 1280,
                  height: norm.height || 720,
                },
              ],
            }
          : {
              card: "summary_large_image",
              title: titleTag,
              description: desc,
              images: [absThumb],
            },
    };
  } catch {
    return { title: { absolute: "Post — Photo & Video | fondpeace.com" } };
  }
}

/* ------------------------------ PAGE ------------------------------ */
export default async function Page({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return notFound();

  const result = await getPostDetailData(id);
  if (result?.transientError) {
    throw new Error("Temporary upstream backend cold-start timeout; retry shortly.");
  }
  const data = result?.data;
  const post = data?.post;
  if (!post) return notFound();

  const norm = normalizeMediaPost(post);
  const rawRelated = Array.isArray(data?.related) ? data.related : [];
  const mediaRelated = rawRelated
    .filter((r) => normalizeMediaPost(r) && String(r._id) !== String(post._id))
    .slice(0, 8);

  const jsonLdData = norm ? buildSinglePostSsrJsonLd(norm) : null;
  const authorName = norm ? norm.user.username : String(post.userId?.username || "fondpeace");
  const encodedAuthor = encodeURIComponent(authorName);
  const badgeLabel = norm ? (norm.kind === "video" ? "Video" : "Photo") : "Post";

  return (
    <main className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-blue-600 selection:text-white transition-colors duration-200 overflow-x-hidden">
      {jsonLdData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      )}

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
          {/* Top Navigation & Breadcrumb */}
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
                <Link
                  href={`/profile/${encodedAuthor}`}
                  className="hover:text-[var(--text-primary)] hover:underline truncate max-w-[140px]"
                >
                  {authorName}
                </Link>
                <span aria-hidden="true">/</span>
                <span className="text-[var(--text-primary)] font-medium truncate max-w-[260px]">
                  {truncateWords(norm ? norm.title : post.title || "Post", 60)}
                </span>
              </nav>
            </div>

            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] shrink-0">
              {badgeLabel}
            </span>
          </div>

          {/* Full FondPeace Post Card */}
          <SinglePostPage initialPost={post} />

          {/* Related Photo & Video Posts */}
          <RelatedPosts
            currentPostId={post._id}
            category={post.category}
            tags={post.tags}
            initialRelated={mediaRelated}
          />
        </section>

        {/* Right Sidebar */}
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
