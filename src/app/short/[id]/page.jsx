// app/short/[id]/page.jsx
import { notFound } from "next/navigation"; 
import Link from "next/link";
import { FaHeart, FaCommentDots, FaEye,FaArrowLeft  } from "react-icons/fa";
import { redirect, permanentRedirect } from "next/navigation";
import SinglePostPage from "@/components/SinglePostPage";
import LeftSidebar from "@/components/LeftSidebar";
import SuggestedCreatorsWidget from "@/components/SuggestedCreatorsWidget";
import { Coins, ArrowRight, ShieldCheck } from "lucide-react";
import ReelsFeedWrapper from "@/components/ReelsFeedWrapper"; // (Rename ReelsFeedWrapper.jsx to ReelsFeedWrapper.js/jsx)
import RelatedPosts from "@/components/RelatedPosts";
import { getApiBase } from "@/utils/apiConfig";
import { resolvePostThumbnail } from "@/utils/resolvePostThumbnail";

// Server-side Constants
const API_BASE = getApiBase();
const API_SINGLE = `${API_BASE}/post/single/`;
const SITE_ROOT = "https://www.fondpeace.com";
const DEFAULT_THUMB = `${SITE_ROOT}/Fondpeace.jpg`;

export const dynamic = "force-dynamic"; // हर बार अनुरोध पर री-रेंडर सुनिश्चित करें

// --- Utility Functions (Same as your original) ---

// safer toAbsolute
function toAbsolute(url, type = "image") {
    if (!url) return type === "video" ? "" : DEFAULT_THUMB;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return `${SITE_ROOT}${url}`;
    return `${SITE_ROOT}/${url}`;
}

// safer secToISO
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

// safer keywords
function extractKeywords(post) {
    if (!post) return "fondpeace,shorts,video,reels";
    if (Array.isArray(post.tags) && post.tags.length) return post.tags.join(", ");
    if (Array.isArray(post.hashtags) && post.hashtags.length)
        return post.hashtags.map(h => h.replace("#", "")).join(", ");
    if (post.title) return post.title.split(" ").slice(0, 10).join(", ");
    return "fondpeace,shorts,video,reels";
}



// ------------------------ Helper Functions ------------------------
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

// Interactions for post
function buildInteractionSchema(post) {
  return [
    { "@type": "InteractionCounter", "interactionType": "https://schema.org/LikeAction", "userInteractionCount": likesCount(post) },
    { "@type": "InteractionCounter", "interactionType": "https://schema.org/CommentAction", "userInteractionCount": commentsCount(post) },
    { "@type": "InteractionCounter", "interactionType": "https://schema.org/ViewAction", "userInteractionCount": viewsCount(post) }
  ];
}

// Interactions for comment
function buildCommentInteractionSchema(comment) {
  return [
    { "@type": "InteractionCounter", "interactionType": "https://schema.org/LikeAction", "userInteractionCount": Array.isArray(comment.likes) ? comment.likes.length : 0 },
    { "@type": "InteractionCounter", "interactionType": "https://schema.org/ReplyAction", "userInteractionCount": Array.isArray(comment.replies) ? comment.replies.length : 0 },
    { "@type": "InteractionCounter", "interactionType": "https://schema.org/ViewAction", "userInteractionCount": comment.views || 0 }
  ];
}

function buildDescription(post) {
    const author = post?.userId?.username || "FondPeace";
    const likes = likesCount(post);
    const comments = commentsCount(post);
    const views = viewsCount(post);
    const title = post?.title;
    return `${title} uploaded by ${author} on FondPeace, join now to watch latest videos and updates`;
}

function mapComments(post, pageUrl) {
  return (post.comments || []).map((c) => ({
    "@type": "Comment",
    "@id": `${pageUrl}#comment-${c._id}`,
    text: c.CommentText || "",
    dateCreated: new Date(c.createdAt).toISOString(),
    author: {
      "@type": "Person",
      "@id": `${SITE_ROOT}/profile/${c.userId?.username || "FondPeace"}#person`,
      name: c.userId?.username || "FondPeace",
      url: `${SITE_ROOT}/profile/${c.userId?.username || "FondPeace"}`,
    },
    interactionStatistic: buildCommentInteractionSchema(c),
    comment: (c.replies || []).map((r) => ({
      "@type": "Comment",
      "@id": `${pageUrl}#reply-${r._id}`,
      parentItem: { "@id": `${pageUrl}#comment-${c._id}` },
      text: r.replyText || "",
      dateCreated: new Date(r.createdAt).toISOString(),
      author: {
        "@type": "Person",
        "@id": `${SITE_ROOT}/profile/${r.userId?.username || "FondPeace"}#person`,
        name: r.userId?.username || "FondPeace",
        url: `${SITE_ROOT}/profile/${r.userId?.username || "FondPeace"}`,
      },
      interactionStatistic: buildCommentInteractionSchema(r),
    })),
  }));
}


// --- Metadata Generator (Google Indexing Focus) ---
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return { title: "Video | FondPeace" };

  try {
    const res = await fetch(`${API_SINGLE}${id}`, { cache: "no-store" });
    if (!res.ok) return { title: "Video | FondPeace" };

    const { post } = await res.json();
    if (!post) return { title: "Video Not Found | FondPeace" };

    const mediaUrl = toAbsolute(post.media || post.mediaUrl, "video");
    const thumb = resolvePostThumbnail(post);
    const pageUrl = `${SITE_ROOT}/short/${id}`;

    const rawTitle = (post.title || "").trim();
    const cleanText = rawTitle.replace(/#[a-zA-Z0-9_]+/g, "").trim();
    const author = post.userId?.username ? `@${post.userId.username}` : "Creator";

    const title = cleanText
      ? `${cleanText.slice(0, 50)} by ${author}`
      : `${rawTitle.slice(0, 50) || "Watch Video"}`;

    const description = cleanText
      ? `Watch "${cleanText}" shared by ${author} on FondPeace. Join the social community to explore trending short reels, react, and discuss.`
      : `Watch trending short video by ${author} on FondPeace social platform.`;

    return {
      title: title,
      description: description,
      keywords: extractKeywords(post),
      alternates: { canonical: pageUrl },
      openGraph: {
        title: title,
        description: description,
        url: pageUrl,
        siteName: "FondPeace",
        type: "video.other", // Better for vertical/reels content
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
        secureUrl: mediaUrl, // Required by some social crawlers
      },
    ],
  },
  twitter: {
    card: "player",
    title: title,
    description: description,
    images: [thumb], // Twitter looks for 'images' array or 'image' string
    site: "@FondPeaceTech",
    player: {
          url: `${SITE_ROOT}/short/${post._id}?embed=true`,
          stream: mediaUrl,
          type: "video/mp4",
          image: thumb,
        },
  },
};
  } catch (err) {
    console.log("Metadata error:", err);
    return { title: "FondPeace Video" };
  }
}



// --- Page Component (Server Component) ---
export default async function Page({ params }) {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    if (!id) return notFound();

    try {
        // Fetch post and related videos
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
        const thumbnail = toAbsolute(post.thumbnail) || DEFAULT_THUMB;
        const pageUrl = `${SITE_ROOT}/short/${post._id || id}`;
        const authorName = post?.userId?.username;

        const isVideo =
  post.mediaType?.startsWith("video") ||
  /\.(mp4|webm|mov|m3u8)$/i.test(mediaUrl || "");

        // Canonical Routing Rule: Non-videos belong on dedicated /post/[id] page
        if (!isVideo) {
          permanentRedirect(`/post/${id}`);
        }

        const authorId = `${SITE_ROOT}/profile/${post.userId?.username}#person`;

        const videoSchema = {
  "@context": "https://schema.org",
  "@type": "VideoObject",

  "@id": `${pageUrl}#video`,

  name: post.title,
  headline: post.title,

  description: buildDescription(post),

  thumbnailUrl: [
    resolvePostThumbnail(post)
  ],

  // ✅ MUST (VERY IMPORTANT)
  contentUrl: mediaUrl ,

  embedUrl: `${SITE_ROOT}/short/${post._id || id}`,

  url: pageUrl,

  uploadDate: new Date(
    post.createdAt || Date.now()
  ).toISOString(),

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

        console.log("videoSchema: ",videoSchema);
// const videoSchema = {
//             "@context": "https://schema.org",
//             "@type": "VideoObject",
//             name: post.title || "FondPeace Video",
//             headline: post.title || "FondPeace Video",
//             description: buildDescription(post),
//             thumbnailUrl: [thumbnail || DEFAULT_THUMB],
//             ...(mediaUrl ? { contentUrl: mediaUrl } : {}),
//             embedUrl: `${SITE_ROOT}/short/${post._id || id}`,
//             uploadDate: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
//             // ... (rest of the schema properties)
//             duration: post.duration ? (Number(post.duration) ? secToISO(Number(post.duration)) : post.duration) : undefined,
//             author: { "@type": "Person", name: authorName, url: `${SITE_ROOT}/profile/${authorName || "FondPeace"}`, },
//             interactionStatistic: buildInteractionSchema(post),
//             keywords: extractKeywords(post),
//             inLanguage: "en-US",
//             potentialAction: { "@type": "WatchAction", target: pageUrl },
//             mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
//         };

//         const jsonLd = {
//   "@context": "https://schema.org",
//   "@graph": [
//     // 🔹 BREADCRUMB
//     {
//       "@type": "BreadcrumbList",
//       "@id": `${pageUrl}#breadcrumb`,
//       itemListElement: [
//         {
//           "@type": "ListItem",
//           position: 1,
//           name: "FondPeace",
//           item: SITE_ROOT,
//         },
//         {
//           "@type": "ListItem",
//           position: 2,
//           name: authorName || "Profile",
//           item: `${SITE_ROOT}/profile/${authorName || "user"}`,
//         },
//         {
//           "@type": "ListItem",
//           position: 3,
//           name: post.title || "Video",
//           item: pageUrl,
//         },
//       ],
//     },

//     // 🔹 VIDEO OBJECT (FULL POWER)
//     {
//       "@type": "VideoObject",
//       "@id": `${pageUrl}#video`,

//       name: post.title || "FondPeace Video",
//       headline: post.title || "FondPeace Video",
//       description: buildDescription(post),

//       thumbnailUrl: [thumbnail || DEFAULT_THUMB],

//       ...(mediaUrl ? { contentUrl: mediaUrl } : {}),

//       embedUrl: `${SITE_ROOT}/short/${post._id || id}`,

//       uploadDate: post.createdAt
//         ? new Date(post.createdAt).toISOString()
//         : new Date().toISOString(),

//       duration: post.duration
//         ? secToISO(Number(post.duration))
//         : "PT0M30S",

//       inLanguage: "en-US",

//       isFamilyFriendly: true,
//       isAccessibleForFree: true,

//       author: {
//         "@type": "Person",
//         "@id": `${SITE_ROOT}/profile/${authorName || "FondPeace"}#person`,
//         name: authorName || "FondPeace",
//         url: `${SITE_ROOT}/profile/${authorName || "FondPeace"}`,
//       },

//       publisher: {
//         "@type": "Organization",
//         name: "FondPeace",
//         url: SITE_ROOT,
//         logo: {
//           "@type": "ImageObject",
//           url: `${SITE_ROOT}/Fondpeace.jpg`,
//         },
//       },

//       interactionStatistic: buildInteractionSchema(post),

//       keywords: extractKeywords(post),

//       potentialAction: {
//         "@type": "WatchAction",
//         target: pageUrl,
//       },

//       mainEntityOfPage: {
//         "@type": "WebPage",
//         "@id": pageUrl,
//       },

//       // 🔥 BONUS (SEO BOOST)
//       url: pageUrl,
//     },
//   ],
// };

        
        
  return (
    <main className="w-full h-[100dvh] bg-black text-white overflow-hidden select-none">
      {/* JSON-LD inserted server-side for Google video crawlers & SEO */}
      <script
        key="video-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(videoSchema),
        }}
      />

      {/* Full Immersive Reels & Shorts Video Feed */}
      <ReelsFeedWrapper initialPost={post} initialRelated={related} />
    </main>
  );
    } catch (e) {
        if (e?.digest?.startsWith("NEXT_REDIRECT")) {
            throw e;
        }
        console.error("Page component error:", e);
        return notFound();
    }
}
