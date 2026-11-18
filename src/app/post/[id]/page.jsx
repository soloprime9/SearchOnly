




// âœ“ GOOGLE-OPTIMIZED POST PAGE (VIDEO + IMAGE + ARTICLE) 
// âœ“ AUTO DETECT MEDIA TYPE
// âœ“ FIXES "VIDEO ISNâ€™T ON WATCH PAGE" ERROR

import { cache } from "react";
import SinglePostPage from "@/components/SinglePostPage";
// Adsterra components paused site-wide (preserved in src/components/ads/)
// import AdsterraBanner320 from "@/components/ads/AdsterraBanner320";
// import AdsterraNativeBanner from "@/components/ads/AdsterraNativeBanner";
import PostTitle from "@/components/PostTitle";
import RelatedPosts from "@/components/RelatedPosts";
import LeftSidebar from "@/components/LeftSidebar";
import SuggestedCreatorsWidget from "@/components/SuggestedCreatorsWidget";
import { Coins, ArrowRight, ShieldCheck } from "lucide-react";

import { FaHeart, FaCommentDots, FaEye,FaArrowLeft  } from "react-icons/fa";
import Link from "next/link";
import { redirect, notFound, permanentRedirect } from "next/navigation";
import { getApiBase } from "@/utils/apiConfig";
import { resolvePostThumbnail } from "@/utils/resolvePostThumbnail";
import { isPlayableShortPost } from "@/utils/postMediaUtils";
import { shouldIndexPost, isBlockedAdultOrSpam, truncateWords } from "@/utils/indexGate";
const API_BASE = getApiBase();
const SITE_ROOT = "https://www.fondpeace.com";
const DEFAULT_AVATAR = "https://www.fondpeace.com/Fondpeace.jpg";
const DEFAULT_THUMB = "https://www.fondpeace.com/Fondpeace.jpg";
import Linkify from "linkify-react";


const options = {
  target: "_blank",
  rel: "noopener noreferrer nofollow", // . SEO safe
  className: "text-blue-600 hover:underline font-medium break-words",

  format: (value, type) => {
    if (type === "url") {
      try {
        const url = new URL(value);

        // . clean domain (no www)
        return url.hostname.replace("www.", "");
      } catch {
        return value;
      }
    }
    return value;
  },

  // . optional: validate only real links
  validate: {
    url: (value) => value.startsWith("http"),
  },
};


/* ---------------------- HELPERS ---------------------- */
function toAbsolute(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${SITE_ROOT}${url}`;
  return `${SITE_ROOT}/${url}`;
}

function secToISO(sec) { 
  const s = Number(sec);

  if (!Number.isFinite(s) || s <= 0) return undefined;

  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const secLeft = Math.floor(s % 60);

  let iso = "PT";
  if (h > 0) iso += `${h}H`;
  if (m > 0) iso += `${m}M`;
  if (secLeft > 0 || (h === 0 && m === 0)) iso += `${secLeft}S`;

  return iso;
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

// Build interaction statistics for the post itself
function buildInteractionSchema(post) {
  return [
    {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/LikeAction",
      "userInteractionCount": likesCount(post)
    },
    {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/CommentAction",
      "userInteractionCount": commentsCount(post)
    },
    {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/ViewAction",
      "userInteractionCount": viewsCount(post)
    }
  ];
}

// Build interaction statistics for a single comment
function buildCommentInteractionSchema(comment) {
  return [
    {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/LikeAction",
      "userInteractionCount": Array.isArray(comment.likes) ? comment.likes.length : 0
    },
    {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/ReplyAction",
      "userInteractionCount": Array.isArray(comment.replies) ? comment.replies.length : 0
    },
    {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/ViewAction",
      "userInteractionCount": comment.views || 0
    }
  ];
}


function buildDescription(post) {
  const author = post?.userId?.username || "FondPeace";
  const views = viewsCount(post);
  const likes = likesCount(post);
  const comments = commentsCount(post);

  return `${post.title}`;
}


function extractKeywords(post) {
  if (Array.isArray(post.tags) && post.tags.length) return post.tags.join(", ");
  if (Array.isArray(post.hashtags) && post.hashtags.length)
    return post.hashtags.map(h => h.replace("#", "")).join(", ");
  return post.title.split(" ").slice(0, 10).join(", ");
}

const getPostDetailData = cache(async (id) => {
  try {
    const res = await fetch(`${API_BASE}/post/image/${id}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
});

/* ------------------------- generateMetadata ------------------------- */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return { title: "Post | FondPeace" };
  const pageUrl = `${SITE_ROOT}/post/${id}`;

  try {
    const data = await getPostDetailData(id);
    const post = data?.post;

    if (!post) return { title: "Post Not Found | FondPeace" };

    const resolvedThumb = resolvePostThumbnail(post);
    const isVideo = isPlayableShortPost(post);

    if (isVideo) {
      return {
        title: `${truncateWords(post.title || "Video", 55)}`,
        description: post.title || "Watch on FondPeace",
        alternates: { canonical: `${SITE_ROOT}/short/${id}` },
        robots: { index: false, follow: true },
      };
    }

    const rawTitle = (post.title || "").trim();
    const cleanText = rawTitle.replace(/#[a-zA-Z0-9_]+/g, "").trim();
    const author = post.userId?.username ? `@${post.userId.username}` : "Creator";

    const titleTag = cleanText
      ? `${truncateWords(cleanText, 55)} by ${author}`
      : `${truncateWords(rawTitle || "Community Post", 55)}`;

    const description = cleanText
      ? `Read: "${cleanText}" by ${author} on FondPeace. Join real conversations, explore topics, and share your perspectives.`
      : `Explore community posts and social conversations by ${author} on FondPeace.`;

    const indexable = shouldIndexPost(post);

    return {
      title: titleTag,
      description: description,
      keywords: extractKeywords(post),
      alternates: { canonical: pageUrl },
      robots: {
        index: indexable,
        follow: true,
        googleBot: {
          index: indexable,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },

      openGraph: {
        title: titleTag,
        description: description,
        url: pageUrl,
        type: "article",
        siteName: "FondPeace",
        images: [
          {
            url: resolvedThumb,
            secureUrl: resolvedThumb,
            width: 1200,
            height: 630,
            alt: cleanText || titleTag,
          },
        ],
      },
      twitter: {
        card: "summary_large_image", 
        title: titleTag,
        description: description,
        images: [resolvedThumb],
      },
    };
  } catch {
    return { title: "Post | FondPeace" };
  }
}

/* ------------------------------ PAGE ------------------------------ */
export default async function Page({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return notFound();

  const data = await getPostDetailData(id);
  const post = data?.post;

  if (!post) {
    return notFound();
  }

  const isVideo = isPlayableShortPost(post);

  // If this post is a video (native or YouTube), redirect 308 permanently to canonical /short/[id]
  if (isVideo) {
    permanentRedirect(`/short/${id}`);
  }

const related = (data?.related ?? []).filter((r) => !isBlockedAdultOrSpam(r));



  const pageUrl = `${SITE_ROOT}/post/${post._id}`;
  const resolvedThumb = resolvePostThumbnail(post);
  const mediaUrl = toAbsolute(post.media || post.mediaUrl || post.thumbnail);
  const authorName = post.userId?.username || "FondPeace";
  const thumbnail = resolvedThumb || DEFAULT_THUMB;
  const videoPoster = (post.thumbnail && !post.thumbnail.includes("Fondpeace.jpg") && !post.thumbnail.includes("default.jpg")) ? toAbsolute(post.thumbnail) : undefined;
  const isImage = /^image\//i.test(post.mediaType || "") || /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp|svg|jfif)$/i.test(mediaUrl || "");

  const postTitle = typeof post?.title === "string" ? post.title : "";
  const isArticle = post.postType === "article" || (postTitle && postTitle.split(/\s+/).length > 250);
  const primarySchemaType = isArticle ? "BlogPosting" : "DiscussionForumPosting";

  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      // 1ï¸âƒ£ Breadcrumb
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "FondPeace", "item": SITE_ROOT },
          { "@type": "ListItem", "position": 2, "name": authorName, "item": `${SITE_ROOT}/profile/${authorName}` },
          { "@type": "ListItem", "position": 3, "name": (post.title || "Post").slice(0, 60), "item": pageUrl }
        ]
      },

      // 2ï¸âƒ£ Primary Content (DiscussionForumPosting or BlogPosting)
      {
        "@type": primarySchemaType,
        "@id": `${pageUrl}#main`,
        "url": pageUrl,
        "headline": post.title?.slice(0, 110) || "FondPeace Post",
        "description": post.title?.slice(0, 200) || "Community discussion on FondPeace",
        "articleBody": post.title || "",
        "name": post.title?.slice(0, 110) || "FondPeace Post",
        "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl },
        "datePublished": new Date(post.createdAt || Date.now()).toISOString(),
        "dateModified": new Date(post.updatedAt || post.createdAt || Date.now()).toISOString(),
        "author": {
          "@type": "Person",
          "@id": `${SITE_ROOT}/profile/${authorName}#person`,
          "name": authorName,
          "url": `${SITE_ROOT}/profile/${authorName}`,
          "image": toAbsolute(post.userId?.profilePic) || DEFAULT_AVATAR
        },
        "publisher": {
          "@type": "Organization",
          "@id": `${SITE_ROOT}#organization`,
          "name": "FondPeace",
          "url": SITE_ROOT,
          "logo": {
            "@type": "ImageObject",
            "url": `${SITE_ROOT}/Fondpeace.jpg`
          }
        },

        // Article specific properties (Dev.to / Substack style)
        ...(isArticle ? {
          "wordCount": post.title ? post.title.split(/\s+/).length : 0,
          "inLanguage": "en"
        } : {}),

        // Photo / Image / Link Attachment
        ...(resolvedThumb ? {
          "image": {
            "@type": "ImageObject",
            "url": resolvedThumb
          }
        } : {}),

        // Shared Link Previews (MacRumors, YouTube, external news)
        ...(post.linkPreview?.url ? {
          "sharedContent": {
            "@type": "WebPage",
            "@id": post.linkPreview.url,
            "url": post.linkPreview.url,
            "name": post.linkPreview.title || post.linkPreview.url,
            "description": post.linkPreview.description || "",
            ...(post.linkPreview.image ? { "image": post.linkPreview.image } : {})
          }
        } : {}),

        // Community Interaction Counters
        "interactionStatistic": [
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/LikeAction",
            "userInteractionCount": post.likes?.length || 0
          },
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/ViewAction",
            "userInteractionCount": post.views || 0
          },
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/CommentAction",
            "userInteractionCount": post.comments?.length || 0
          }
        ],
        "commentCount": post.comments?.length || 0,

        // Comments Graph (Real user community discussions)
        "comment": (post.comments || []).map((c) => ({
          "@type": "Comment",
          "@id": `${pageUrl}#comment-${c._id}`,
          "text": c.CommentText || "",
          "dateCreated": new Date(c.createdAt || Date.now()).toISOString(),
          "author": {
            "@type": "Person",
            "name": c.userId?.username || "User",
            "url": `${SITE_ROOT}/profile/${c.userId?.username || "User"}`
          }
        })),

        // Related canonical links (direct to /short/ or /post/)
        "relatedLink": (related || []).map((r) => {
          const isVid = r.mediaType?.startsWith("video") || /\.(mp4|mov|webm|mkv)$/i.test(r.media || r.mediaUrl || "");
          return isVid ? `${SITE_ROOT}/short/${r._id}` : `${SITE_ROOT}/post/${r._id}`;
        })
      }
    ]
  };

  
  // /* ---------------------- JSON-LD for Reddit-style Social Post ---------------------- */
//   const jsonLdRedditStyle = {
//     "@context": "https://schema.org",
//     "@graph": [

//       // 1ï¸âƒ£ WebPage
//       {
//         "@type": "WebPage",
//         "@id": `${pageUrl}#webpage`,
//         "url": pageUrl,
//         "name": post.title || "FondPeace Post",
//         "mainEntity": { "@id": `${pageUrl}#post` },
//         "breadcrumb": { "@id": `${pageUrl}#breadcrumb` }
//       },

//       // 2ï¸âƒ£ Media Object (if exists)
//       ...(isImage || isVideo
//         ? [
//             {
//               "@type": isVideo ? "VideoObject" : "ImageObject",
//               "@id": `${pageUrl}#media`,
//               "url": mediaUrl,
//               "uploadDate": new Date(post.createdAt).toISOString(),
//               ...(isVideo
//                 ? { "contentUrl": mediaUrl, "duration": post.duration ? secToISO(Number(post.duration)) : undefined }
//                 : { "width": 1080, "height": 1350, "caption": post.title || "FondPeace Image Post" }),
//               "author": {
//                 "@type": "Person",
//                 "@id": `${SITE_ROOT}/profile/${authorName}#person`,
//                 "name": authorName,
//                 "url": `${SITE_ROOT}/profile/${authorName}`,
//                 "image": toAbsolute(post.userId?.profilePic) || DEFAULT_AVATAR
//               }
//             }
//           ]
//         : []),

//       // 3ï¸âƒ£ SocialMediaPosting
//       {
//   "@type": "SocialMediaPosting",
//   "@id": `${pageUrl}#post`,
//   "url": pageUrl,
//   "headline": post.title || "FondPeace Post",
//   "articleBody": post.content || post.title || "",
//   "dateCreated": new Date(post.createdAt).toISOString(),
//   "dateModified": new Date(post.updatedAt || post.createdAt).toISOString(),
//   "mainEntityOfPage": { "@id": `${pageUrl}#webpage` },

//   ...(isImage || isVideo
//     ? { "sharedContent": { "@id": `${pageUrl}#media` } }
//     : {}),

//   ...(isImage
//     ? {
//         image: {
//           "@type": "ImageObject",
//           "url": mediaUrl,
//           "width": 1080,
//           "height": 1350
//         }
//       }
//     : isVideo
//     ? {
//         image: {
//           "@type": "ImageObject",
//           "url": post.thumbnail || DEFAULT_THUMB
//         }
//       }
//     : {}),

//   "author": {
//     "@type": "Person",
//     "@id": `${SITE_ROOT}/profile/${authorName}#person`,
//     "name": authorName,
//     "url": `${SITE_ROOT}/profile/${authorName}`,
//     "image": toAbsolute(post.userId?.profilePic) || DEFAULT_AVATAR
//   },

//   "interactionStatistic": buildInteractionSchema(post),
//   "commentCount": commentsCount(post),

//   "comment": (post.comments || []).map((c) => ({
//     "@type": "Comment",
//     "@id": `${pageUrl}#comment-${c._id}`,
//     "text": c.CommentText || "",
//     "dateCreated": new Date(c.createdAt).toISOString(),
//     "author": {
//       "@type": "Person",
//       "name": c.userId?.username || "User",
//       "url": `${SITE_ROOT}/profile/${c.userId?.username || "User"}`
//     },
//     "interactionStatistic": buildCommentInteractionSchema(c)
//   }))
// },

//       // 4ï¸âƒ£ Breadcrumb
//       {
//         "@type": "BreadcrumbList",
//         "@id": `${pageUrl}#breadcrumb`,
//         "itemListElement": [
//           { "@type": "ListItem", "position": 1, "name": "FondPeace", "item": SITE_ROOT },
//           { "@type": "ListItem", "position": 2, "name": authorName, "item": `${SITE_ROOT}/profile/${authorName}` },
//           { "@type": "ListItem", "position": 3, "name": post.title || "Post", "item": pageUrl }
//         ]
//       }
//     ]
//   };

//   return (
//     <main className="w-full min-h-screen bg-white">

//       {/* JSON-LD 
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdRedditStyle) }}
//       />
//     */}

//        {/* HEADER â€“ Instagram style */}
// <header className="bg-white  sticky top-0 z-50">
//   <div className="max-w-3xl mx-auto px-1 mb-2 h-12 flex items-center justify-between">
    
//     {/* Back Button â†’ Home */}
//     <Link
//       href="/"
//       className="p-2 -ml-2"
//       aria-label="Go to home"
//     >
//       <FaArrowLeft className="text-lg text-gray-900" />
//     </Link>

//     {/* Center Title */}
//     <Link href="/" className="text-md font-semibold text-gray-900" aria-label="Go to Home">
//       FondPeace.com
//     </Link>

//     {/* Right Spacer (for symmetry like Instagram) */}
//     <div className="w-6" />
//   </div>
// </header>


//     <section className="max-w-3xl mx-auto px- py-">
//       <article className="bg-white shadow-md rounded-2xl overflow-hidden p-2">



//        {/* User Profile */}
// <div className="flex items-center justify-between mb-5">

//   <Link
//     href={`/profile/${post.userId?.username}`}
//     className="flex items-center gap-3"
//   >
//     <img
//       src={post.userId?.profilePic || "/Fondpeace.jpg"}
//       alt={post.userId?.username || "User"}
//       className="w-11 h-11 rounded-full object-cover border"
//       loading="lazy"
//     />

//     <div>
//       <span className="font-semibold text-gray-800 block">
//         {post.userId?.username || "Anonymous"}
//       </span>
//       <span className="text-gray-500 text-sm">
//         {new Date(post.createdAt).toLocaleDateString()}
//       </span>
//     </div>
//   </Link>

//   {/* Menu button MUST be inside same flex */}
//   <button className="text-gray-500 hover:text-black transition">
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       className="h-6 w-6"
//       fill="none"
//       viewBox="0 0 24 24"
//       stroke="currentColor"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={2}
//         d="M12 6v.01M12 12v.01M12 18v.01"
//       />
//     </svg>
//   </button>

// </div>
        


//         {/* Media Section */}
//         {isVideo ? (
//           <video
//             src={mediaUrl}
//             poster={thumbnail}
//             controls
//             className="rounded-xl w-full max-h-[480px] bg-black"
//           />
//         ) : isImage ? (
//           <img
//             src={mediaUrl}
//             alt={post.title}
//             className="rounded-xl w-full object-cover"
//             loading="lazy"
//           />
//         ) : null}

//         {/* Post Title 
// <h1 className="text-gray-800 mb-4 whitespace-pre-line">
//   {post.title}
// </h1>
// */}
//        <PostTitle title={post.title} />

//         {/* Post Content */}
//         <SinglePostPage initialPost={post} />
//       </article>
//     </section>


    
// <RelatedPosts related={related} />


    
//       { /* {Array.isArray(related) && related.length > 0 && (
//   <aside className="max-w-5xl mx-auto mt-10 px-4">
//     <p className="text-xl font-semibold mb-4 text-gray-900">
//       Related Posts
//     </p>

//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
//       {related.map((r) => {
//         const thumb = toAbsolute(r.thumbnail || "");

//         return (
//           <a
//             key={r._id}
//             href={`/shorts/${r._id}`}
//             className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border"
//           >
            
//             <div className="w-full aspect-video bg-gray-200 overflow-hidden relative">
//   <img
//     src={thumb}
//     alt={r.title}
//     className="w-full h-full object-cover object-center"
//     loading="lazy"
//   />
// </div>


//             <div className="p-3">
//               <p className="font-medium text-gray-900 line-clamp-2 text-sm">
//                 {r.title}
//               </p>

//               <div className="flex items-center gap-3 text-gray-500 text-xs mt-2">
//                 <FaHeart className="text-red-500" /> {likesCount(r)}
//                 <span>â€¢</span>
//                 <FaCommentDots /> {commentsCount(r)}
//                 <span>â€¢</span>
//                 <FaEye /> {viewsCount(r) || 0}
//               </div>
//             </div>
//           </a>
//         );
//       })}
//     </div>
//   </aside>
// )}

//   */}

//   </main>
// );




return (
    <main className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-blue-600 selection:text-white transition-colors duration-200 overflow-x-hidden">
      {/* Schema.org JSON-LD (Dynamic DiscussionForumPosting / BlogPosting) */}
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

        {/* Center Main Discussion Column */}
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
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              Community Post
            </span>
          </div>

          {/* Full Post Card - Exactly matching Homepage (Village.jsx) */}
          <SinglePostPage initialPost={post} />

          {/* Related Community Discussions Feed */}
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
            {/* Suggested Creators Widget */}
            <SuggestedCreatorsWidget variant="card" />

            {/* Creator Program Spotlight Card */}
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
              <h3 className="font-bold text-sm mb-1 text-[var(--text-primary)]">Monetize Your Influence</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
                Get paid directly by fans through tips, subscriptions, and branded sponsorship.
              </p>
              <Link
                href="/monetization"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
              >
                <span>Learn More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Safety & Compliance Badge */}
            <div className="rounded-2xl p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                Protected & Verified Creator Network under 2026 Community Standards.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* bottom padding so mobile nav doesn't cover content */}
      <div className="h-20 lg:hidden" />
    </main>
  );





  

  // return (
  //   <main className="w-full min-h-screen bg-slate-50 pb-16 selection:bg-blue-500 selection:text-white">
  //     {/* HEADER â€“ Modern Minimalist Sticky Blur */}
  //     <header className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100/80">
  //       <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
  //         {/* Back Button */}
  //         <Link
  //           href="/"
  //           className="p-2.5 -ml-2 rounded-full hover:bg-slate-100/80 active:scale-95 transition-all duration-200"
  //           aria-label="Go to home"
  //         >
  //           <FaArrowLeft className="text-lg text-slate-800" />
  //         </Link>

  //         {/* Center Title */}
  //         <Link
  //           href="/"
  //           className="text-xl font-black text-slate-900 tracking-tight hover:opacity-80 transition-opacity"
  //           aria-label="Go to Home"
  //         >
  //           FondPeace<span className="text-blue-600">.com</span>
  //         </Link>

  //         {/* Right Spacer */}
  //         <div className="w-10" />
  //       </div>
  //     </header>

  //     {/* MAIN POST SECTION */}
  //     <section className="max-w-2xl mx-auto px-0 sm:px-4 pt-0 sm:pt-6 pb-4">
  //       <article className="bg-white sm:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] sm:rounded-2xl overflow-hidden sm:border border-slate-100">
          
  //         {/* User Profile Header */}
  //         <div className="flex items-center justify-between p-4 border-b border-slate-50">
  //           <Link
  //             href={`/profile/${post.userId?.username}`}
  //             className="flex items-center gap-3.5 group"
  //           >
  //             <div className="relative w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 transition-transform duration-300 group-hover:rotate-12">
  //               <img
  //                 src={post.userId?.profilePic || "/Fondpeace.jpg"}
  //                 alt={post.userId?.username || "User"}
  //                 className="w-full h-full rounded-full object-cover border-2 border-white"
  //                 loading="lazy"
  //               />
  //             </div>

  //             <div className="flex flex-col">
  //               <span className="font-semibold text-[15px] text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
  //                 {post.userId?.username || "Anonymous"}
  //               </span>
  //               <span className="text-slate-400 text-xs mt-1 font-medium">
  //                 {new Date(post.createdAt).toLocaleDateString(undefined, {
  //                   year: 'numeric', month: 'short', day: 'numeric'
  //                 })}
  //               </span>
  //             </div>
  //           </Link>

  //           {/* Menu button */}
  //           <button className="text-slate-400 hover:text-slate-900 hover:bg-slate-50 p-2 rounded-full transition-all duration-200">
  //             <svg
  //               xmlns="http://www.w3.org/2000/svg"
  //               className="h-5 w-5"
  //               fill="none"
  //               viewBox="0 0 24 24"
  //               stroke="currentColor"
  //             >
  //               <path
  //                 strokeLinecap="round"
  //                 strokeLinejoin="round"
  //                 strokeWidth={2.5}
  //                 d="M12 6v.01M12 12v.01M12 18v.01"
  //               />
  //             </svg>
  //           </button>
  //         </div>

  //         {/* Media Section */}
  //         <div className="w-full bg-slate-950 flex justify-center items-center relative overflow-hidden group/media">
  //           {isVideo ? (
  //             <video
  //               src={mediaUrl}
  //               poster={thumbnail}
  //               controls
  //               playsInline
  //               className="w-full max-h-[70vh] object-contain bg-slate-950 shadow-inner"
  //             />
  //           ) : isImage ? (
  //             <img
  //               src={mediaUrl}
  //               alt={post.title}
  //               className="w-full max-h-[70vh] object-contain bg-slate-950 transition-transform duration-700 hover:scale-[1.01]"
  //               loading="lazy"
  //             />
  //           ) : null}
  //         </div>

  //         {/* Post Title & Content */}
  //         <div className="p-4 sm:p-6 bg-white">
  //           <div className="mb-3">
  //             <PostTitle title={post.title} />
  //           </div>
  //           <div className="text-slate-700 text-sm sm:text-[15px] leading-relaxed font-normal">
  //             <SinglePostPage initialPost={post} />
  //           </div>
  //         </div>
  //       </article>
  //     </section>

  //     {/* Separator to mark Related Content cleanly */}
  //     <div className="max-w-2xl mx-auto px-4 my-6 flex items-center gap-3">
  //       <span className="text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">More Feed Discoveries</span>
  //       <div className="h-[1px] bg-slate-200 w-full" />
  //     </div>

  //     {/* RELATED POSTS SECTION */}
  //     <RelatedPosts />
  //   </main>
  // );
  

  // return (
  //   <main className="w-full min-h-screen bg-gray-50 pb-12">
  //     {/* HEADER â€“ Instagram style with modern sticky blur */}
  //     <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
  //       <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
  //         {/* Back Button */}
  //         <Link
  //           href="/"
  //           className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
  //           aria-label="Go to home"
  //         >
  //           <FaArrowLeft className="text-xl text-gray-900" />
  //         </Link>

  //         {/* Center Title */}
  //         <Link
  //           href="/"
  //           className="text-lg font-bold text-gray-900 tracking-tight"
  //           aria-label="Go to Home"
  //         >
  //           FondPeace.com
  //         </Link>

  //         {/* Right Spacer (for perfect center symmetry) */}
  //         <div className="w-9" />
  //       </div>
  //     </header>

  //     {/* MAIN POST SECTION */}
  //     {/* Edge-to-edge on mobile (px-0), rounded card on larger screens (sm:px-4) */}
  //     <section className="max-w-3xl mx-auto px-0 sm:px-4 py-0 sm:py-6">
  //       <article className="bg-white sm:shadow-lg sm:rounded-2xl overflow-hidden sm:border border-gray-100">
          
  //         {/* User Profile Header */}
  //         <div className="flex items-center justify-between p-4 border-b border-gray-50">
  //           <Link
  //             href={`/profile/${post.userId?.username}`}
  //             className="flex items-center gap-3 group"
  //           >
  //             <div className="relative w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-purple-500">
  //               <img
  //                 src={post.userId?.profilePic || "/Fondpeace.jpg"}
  //                 alt={post.userId?.username || "User"}
  //                 className="w-full h-full rounded-full object-cover border-2 border-white"
  //                 loading="lazy"
  //               />
  //             </div>

  //             <div>
  //               <span className="font-bold text-gray-900 block group-hover:text-blue-600 transition-colors">
  //                 {post.userId?.username || "Anonymous"}
  //               </span>
  //               <span className="text-gray-500 text-xs font-medium">
  //                 {new Date(post.createdAt).toLocaleDateString(undefined, {
  //                   year: 'numeric', month: 'short', day: 'numeric'
  //                 })}
  //               </span>
  //             </div>
  //           </Link>

  //           {/* Menu button */}
  //           <button className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-all">
  //             <svg
  //               xmlns="http://www.w3.org/2000/svg"
  //               className="h-6 w-6"
  //               fill="none"
  //               viewBox="0 0 24 24"
  //               stroke="currentColor"
  //             >
  //               <path
  //                 strokeLinecap="round"
  //                 strokeLinejoin="round"
  //                 strokeWidth={2}
  //                 d="M12 6v.01M12 12v.01M12 18v.01"
  //               />
  //             </svg>
  //           </button>
  //         </div>

  //         {/* Media Section */}
  //         <div className="w-full bg-black flex justify-center items-center relative">
  //           {isVideo ? (
  //             <video
  //               src={mediaUrl}
  //               poster={thumbnail}
  //               controls
  //               playsInline
  //               className="w-full max-h-[75vh] object-contain bg-black"
  //             />
  //           ) : isImage ? (
  //             <img
  //               src={mediaUrl}
  //               alt={post.title}
  //               className="w-full max-h-[75vh] object-contain bg-black"
  //               loading="lazy"
  //             />
  //           ) : null}
  //         </div>

  //         {/* Post Title & Content */}
  //         <div className="p-4 sm:p-5">
  //           <div className="mb-2">
  //             <PostTitle title={post.title} />
  //           </div>
  //           <div className="text-gray-800 text-sm sm:text-base leading-relaxed">
  //             <SinglePostPage initialPost={post} />
  //           </div>
  //         </div>
  //       </article>
  //     </section>

  //     {/* RELATED POSTS SECTION */}
  //     <RelatedPosts />
  //   </main>
  // );

}










