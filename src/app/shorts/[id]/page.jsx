   
// app/short/[id]/page.jsx

import StatusBar from "@/components/StatusBar";
import LeftSidebar from "@/components/LeftSidebar";

import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import ReelsFeedWrapper from "@/components/ReelsFeedWrapper";

const API_SINGLE = "https://backend-k.vercel.app/post/single/";
const SITE_ROOT = "https://www.fondpeace.com";
const DEFAULT_THUMB = `${SITE_ROOT}/fondpeace.jpg`;

/* Make any URL absolute relative to SITE_ROOT; returns null when url falsy */
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
  if (!post) return 0;
  return Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
}
function commentsCount(post) {
  if (!post) return 0;
  return Array.isArray(post.comments) ? post.comments.length : (post.commentCount || 0);
}
function viewsCount(post) {
  if (!post) return 0;
  return typeof post.views === "number" ? post.views : (post.views || 0);
}
function buildInteractionSchema(post) {
  return [
    { "@type": "InteractionCounter", interactionType: { "@type": "LikeAction" }, userInteractionCount: likesCount(post) },
    { "@type": "InteractionCounter", interactionType: { "@type": "CommentAction" }, userInteractionCount: commentsCount(post) },
    { "@type": "InteractionCounter", interactionType: { "@type": "WatchAction" }, userInteractionCount: viewsCount(post) },
  ];
}

function buildDescription(post) {
  const author = post?.userId?.username || "FondPeace";
  const likes = likesCount(post);
  const comments = commentsCount(post);
  const views = viewsCount(post);
  const title = post?.title || "FondPeace Video";
  // SEO-friendly single flowing sentence (no periods)
  return `🔥 ${views} Views, ${likes} Likes, ${comments} Comments, watch "${title}" uploaded by ${author} on FondPeace, join now to watch latest videos and updates`;
}

function extractKeywords(post) {
  if (!post) return "";
  if (Array.isArray(post.tags) && post.tags.length) return post.tags.join(", ");
  if (Array.isArray(post.hashtags) && post.hashtags.length)
    return post.hashtags.map(h => h.replace("#", "")).join(", ");
  if (post.title) return post.title.split(" ").slice(0, 10).join(", ");
  return "fondpeace,shorts,video";
}

/* Server-side metadata: Next will call this for each /short/[id] request */
export async function generateMetadata({ params }) {
  const id = params?.id;
  if (!id) return { title: "Invalid Video" };

  try {
    const res = await fetch(`${API_SINGLE}${id}`, { cache: "no-store" });
    if (!res.ok) return { title: "Fondpeace Video" };
    const data = await res.json();
    const post = data?.post;
    if (!post) return { title: "Video Not Found" };

    const mediaUrl = toAbsolute(post.media || post.mediaUrl) || null;
    const img = toAbsolute(post.thumbnail) || DEFAULT_THUMB;
    const title = (post.title || "FondPeace Video").slice(0, 160);

    // robust isVideo detection
    const isVideo = !!mediaUrl && (mediaUrl.endsWith(".mp4") || mediaUrl.includes("video"));

    // Build metadata object (keep it minimal & safe)
    const metadata = {
      title,
      description: buildDescription(post),
      keywords: extractKeywords(post),
      alternates: { canonical: `${SITE_ROOT}/short/${id}` },
      openGraph: {
        title,
        description: buildDescription(post),
        url: `${SITE_ROOT}/short/${id}`,
        type: isVideo ? "video.other" : "article",
        images: [img],
        ...(isVideo && {
          // Next/OpenGraph accepts a video array; include only when we have a valid mediaUrl
          video: [
            {
              url: mediaUrl,
              type: "video/mp4",
              width: 1280,
              height: 720
            }
          ]
        })
      },
      twitter: {
        card: isVideo ? "player" : "summary_large_image",
        title,
        description: buildDescription(post),
        image: img,
        ...(isVideo && { player: mediaUrl })
      },
    };

    return metadata;
  } catch (e) {
    console.error("generateMetadata error:", e);
    return { title: "Fondpeace Video" };
  }
}

/* Server component renders initial HTML and passes initial post to client player */
export default async function Page({ params }) {
  const id = params?.id;
  if (!id) return <div>Invalid ID</div>;

  try {
    const res = await fetch(`${API_SINGLE}${id}`, { cache: "no-store" });
    if (!res.ok) {
      // backend failed: show 404 for crawlers
      return notFound();
    }
    const data = await res.json();
    const post = data?.post || null;
    const related = data?.related || [];

    if (!post) {
      // return real 404 so GSC doesn't treat the page as broken HTML
      return notFound();
    }

    const mediaUrl = toAbsolute(post.media || post.mediaUrl) || null;
    const thumbnail = toAbsolute(post.thumbnail) || DEFAULT_THUMB;
    const pageUrl = `${SITE_ROOT}/short/${post._id || id}`;
    const authorName = post?.userId?.username || "FondPeace";
    const isVideo = !!mediaUrl && (mediaUrl.endsWith(".mp4") || (post.mediaType && String(post.mediaType).startsWith("video")));

    // JSON-LD for VideoObject (server-inserted so crawlers see it)
    const videoSchema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: post.title || "FondPeace Video",
      headline: post.title || "FondPeace Video",
      description: buildDescription(post),
      thumbnailUrl: [thumbnail || DEFAULT_THUMB],
      // include contentUrl only if we have a media URL
      ...(mediaUrl ? { contentUrl: mediaUrl } : {}),
      embedUrl: `${SITE_ROOT}/embed/short/${post._id || id}`,
      uploadDate: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
      datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
      dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : (post.createdAt ? new Date(post.createdAt).toISOString() : undefined),
      duration: post.duration ? (Number(post.duration) ? secToISO(Number(post.duration)) : post.duration) : undefined,
      width: post.width || 1280,
      height: post.height || 720,
      encodingFormat: isVideo ? "video/mp4" : undefined,
      isAccessibleForFree: true,
      publisher: {
        "@type": "Organization",
        name: "FondPeace",
        url: SITE_ROOT,
        logo: { "@type": "ImageObject", url: `${SITE_ROOT}/fondpeace.jpg`, width: 512, height: 512 },
      },
      author: { "@type": "Person", name: authorName },
      creator: { "@type": "Person", name: authorName },
      interactionStatistic: buildInteractionSchema(post),
      keywords: extractKeywords(post),
      inLanguage: "hi-IN",
      isFamilyFriendly: true,
      potentialAction: { "@type": "WatchAction", target: pageUrl },
      mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
      genre: [
        "Entertainment",
        "Short Video",
        "Funny",
        "Viral",
        "Dance",
        "Music",
        "Comedy",
        "Lifestyle",
        "News",
        "Motivation"
      ],
    };

    return (
      <main className="min-h-screen bg-white">
        {/* JSON-LD inserted server-side for crawlers */}
        <script
          key="video-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />

        <LeftSidebar />
        <section className="max-w-3xl mx-auto px-4 py-6">
          {/* Server-rendered hidden <video> so crawlers detect video content even though player is client */}
          {mediaUrl && (
            <video
              src={mediaUrl}
              poster={thumbnail}
              preload="metadata"
              style={{ display: "none" }}
            />
          )}

          {/* Client component: loads only on client (no-SSR) to avoid breaking crawler */}
           <ReelsFeedWrapper initialPost={post} initialRelated={related} />
        </section>
      </main>
    );
  } catch (e) {
    console.error("Page component error:", e);
    // If anything goes wrong, return a 404 so indexing doesn't get invalid HTML
    return notFound();
  }
}











// // app/short/[id]/page.jsx
// import { FaHeart, FaCommentDots, FaEye, FaShareAlt } from "react-icons/fa";
 
// const API_BASE = "https://backend-k.vercel.app";
// const SITE_ROOT = "https://fondpeace.com";
// const CANONICAL_ROOT = `${SITE_ROOT}/post`; // canonical social page

// /* --------------------------- Helpers --------------------------- */
// function toAbsolute(url) {
//   if (!url) return null;
//   if (url.startsWith("http")) return url;
//   if (url.startsWith("/")) return `${SITE_ROOT}${url}`;
//   return `${SITE_ROOT}/${url}`;
// }

// function secToISO(sec) {
//   if (sec == null) return undefined;
//   const s = Number(sec);
//   if (!s || isNaN(s)) return undefined;
//   const h = Math.floor(s / 3600);
//   const m = Math.floor((s % 3600) / 60);
//   const sLeft = s % 60;
//   let iso = "PT";
//   if (h) iso += `${h}H`;
//   if (m) iso += `${m}M`;
//   if (sLeft || (!h && !m)) iso += `${sLeft}S`;
//   return iso;
// }

// function likesCount(post) {
//   return Array.isArray(post?.likes) ? post.likes.length : 0;
// }
// function commentsCount(post) {
//   return Array.isArray(post?.comments) ? post.comments.length : 0;
// }
// function viewsCount(post) {
//   return typeof post?.views === "number" ? post.views : 0;
// }

// function buildInteractionSchema(post) {
//   return [
//     {
//       "@type": "InteractionCounter",
//       interactionType: { "@type": "LikeAction" },
//       userInteractionCount: likesCount(post),
//     },
//     {
//       "@type": "InteractionCounter",
//       interactionType: { "@type": "CommentAction" },
//       userInteractionCount: commentsCount(post),
//     },
//     {
//       "@type": "InteractionCounter",
//       interactionType: { "@type": "WatchAction" },
//       userInteractionCount: viewsCount(post),
//     },
//   ];
// }

// function buildDescription(post) {
//   const title = post?.title || "";
//   const author = post?.userId?.username;
//   if (title && author) return `${title} uploaded by ${author}. Watch, like, and comment on FondPeace.`;
//   if (title) return title;
//   return "Discover trending posts and videos on FondPeace.";
// }

// /* ------------------------- Next metadata ------------------------ */
// export async function generateMetadata({ params }) {
//   const id = params?.id;
//   try {
//     const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
//     const data = await res.json();
//     const post = data?.post ?? null;
//     if (!post) return { title: "Video Not Found | FondPeace" };

//     const mediaUrl = toAbsolute(post.media);
//     const thumb = toAbsolute(post.thumbnail || post.media || "");
//     const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));

//     const titleTag = post.title ? `${post.title} (Watch) | FondPeace` : "Video Watch Page | FondPeace";
//     const desc = buildDescription(post);
//     const canonicalUrl = `${CANONICAL_ROOT}/${id}`;

//     return {
//       title: titleTag,
//       description: desc,
//       alternates: { canonical: canonicalUrl },
//       openGraph: {
//   title: titleTag,
//   description: desc,
//   url: `${SITE_ROOT}/post/${id}`,
//   type: isVideo ? "video.other" : "article",
//   images: [
//     {
//       url: thumb,
//       secureUrl: thumb,
//       type: "image/jpeg",
//       width: 1280,
//       height: 720,
//     }
//   ],
//   ...(isVideo && {
//     videos: [
//       {
//         url: mediaUrl,
//         secureUrl: mediaUrl,
//         type: "video/mp4",
//         width: 1280,
//         height: 720,
//       }
//     ]
//   })
// },

//       robots: { index: false, follow: true }, // Let search index the post canonical; this page holds VideoObject
//     };
//   } catch (err) {
//     console.error("generateMetadata error", err);
//     return { title: "Video Post | FondPeace" };
//   }
// }

// /* ---------------------------- Watch Page Component ----------------------------- */
// export default async function WatchPage({ params }) {
//   const id = params?.id;
//   const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
//   const data = await res.json();
//   const post = data?.post ?? null;

//   if (!post) {
//     return (
//       <main className="w-full min-h-screen flex items-center justify-center">
//         <div className="p-6 text-center">Video not found.</div>
//       </main>
//     );
//   }

//   const mediaUrl = toAbsolute(post.media);
//   const thumbnail = toAbsolute(post.thumbnail || post.media || "");
//   const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));
//   const pageUrl = `${SITE_ROOT}/shorts/${id}`;
//   const canonicalUrl = `${CANONICAL_ROOT}/${id}`;

//   const publisher = {
//     "@type": "Organization",
//     name: "FondPeace",
//     url: SITE_ROOT,
//   };

//   const jsonLd = isVideo
//     ? {
//         "@context": "https://schema.org",
//         "@type": "VideoObject",
//         url: pageUrl,
//         name: post.title,
//         description: buildDescription(post),
//         thumbnailUrl: [thumbnail],
//         contentUrl: mediaUrl,
//         embedUrl: mediaUrl,
//         uploadDate: new Date(post.createdAt || Date.now()).toISOString(),
//         ...(post.duration ? { duration: secToISO(post.duration) } : {}),
//         publisher,
//         interactionStatistic: buildInteractionSchema(post),
//         // Important: link back to the canonical social page so Google knows the host canonical
//         mainEntityOfPage: {
//           "@type": "WebPage",
//           "@id": canonicalUrl,
//         },
//       }
//     : null;

//   if (!isVideo) {
//     return (
//       <main className="p-6 text-center">
//         This watch URL is for videos only. Go to <a href={canonicalUrl} className="text-blue-600 underline">social post</a>.
//       </main>
//     );
//   }

//   return (
//     <main className="w-full min-h-screen bg-black text-white flex items-stretch">
//       {/* JSON-LD */}
//       {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

//       {/* Mobile-first reel layout: video fills most height; interactions overlay */}
//       <section className="w-full flex flex-col md:flex-row items-stretch justify-center">
//         <div className="w-full md:w-2/3 lg:w-3/4 flex items-center justify-center">
//           <div className="w-full max-w-3xl">
//             {/* Video area - mobile: tall, desktop: standard aspect */}
//             <div className="w-full relative">
//               <video
//                 controls
//                 preload="metadata"
//                 poster={thumbnail || undefined}
//                 className="w-full h-[75vh] md:h-auto md:aspect-video object-cover"
//                 playsInline
//               >
//                 <source src={mediaUrl} type="video/mp4" />
//                 Your browser does not support the video tag.
//               </video>

//               {/* bottom caption overlay (mobile) */}
//               <div className="absolute left-4 bottom-4 md:static md:mt-4 md:bg-transparent text-white">
//                 <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg md:rounded-none md:p-0">
//                   <div className="font-semibold text-sm md:text-lg">{post.userId?.username || "FondPeace"}</div>
//                   <div className="text-xs md:text-sm text-gray-200 mt-1">{post.title}</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right column: interactions (on desktop) or overlay on mobile */}
//         <aside className="w-full md:w-1/3 lg:w-1/4 flex flex-col items-center md:items-end gap-4 p-4 md:p-6">
//           <div className="flex flex-col items-center gap-6 mt-6 md:mt-0">
//             <button className="flex flex-col items-center gap-1">
//               <FaHeart className="text-red-500 text-2xl md:text-3xl" />
//               <span className="text-sm text-gray-200">{likesCount(post)}</span>
//             </button>

//             <button className="flex flex-col items-center gap-1">
//               <FaCommentDots className="text-white text-2xl md:text-3xl" />
//               <span className="text-sm text-gray-200">{commentsCount(post)}</span>
//             </button>

//             <button className="flex flex-col items-center gap-1">
//               <FaShareAlt className="text-white text-2xl md:text-3xl" />
//               <span className="text-sm text-gray-200">Share</span>
//             </button>

//             <div className="flex flex-col items-center gap-1">
//               <FaEye className="text-white text-2xl md:text-3xl" />
//               <span className="text-sm text-gray-200">{viewsCount(post) || 0}</span>
//             </div>
//           </div>

//           {/* Info / actions */}
//           <div className="w-full md:w-auto mt-4 md:mt-6 text-center md:text-right">
//             <a href={canonicalUrl} className="inline-block text-sm text-blue-400 hover:text-blue-200 underline">
//               View on feed
//             </a>
//             <div className="mt-3 text-sm text-gray-300">{buildDescription(post)}</div>
//             {post.duration && <div className="mt-2 text-xs text-gray-400">Duration: {secToISO(post.duration)}</div>}
//           </div>
//         </aside>
//       </section>
//     </main>
//   );
// }





