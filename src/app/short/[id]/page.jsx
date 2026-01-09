// app/short/[id]/page.jsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { FaHeart, FaCommentDots, FaEye,FaArrowLeft  } from "react-icons/fa";


import ReelsFeedWrapper from "@/components/ReelsFeedWrapper"; // (Rename ReelsFeedWrapper.jsx to ReelsFeedWrapper.js/jsx)

// Server-side Constants
const API_SINGLE = "https://backend-k.vercel.app/post/single/";
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
    const title = post?.title || "FondPeace Video";
    return `🔥 ${views} Views, ${likes} Likes, ${comments} Comments, watch "${title}" uploaded by ${author} on FondPeace, join now to watch latest videos and updates`;
}



// --- Metadata Generator (Google Indexing Focus) ---
export async function generateMetadata({ params }) {
  const id = params?.id;
  if (!id) return { title: "Invalid Video | FondPeace" };

  try {
    const res = await fetch(`${API_SINGLE}${id}`, { cache: "no-store" });
    if (!res.ok) return { title: "FondPeace Video" };

    const { post } = await res.json();
    if (!post) return { title: "Video Not Found | FondPeace" };

    const mediaUrl = toAbsolute(post.media || post.mediaUrl); // Fixed syntax
    const thumb = toAbsolute(post.thumbnail || mediaUrl); // Fallback to media if no thumb
    const pageUrl = `${SITE_ROOT}/short/${id}`;

    let rawTitle = post.title || "FondPeace Video";
    if (rawTitle.length > 60) rawTitle = rawTitle.slice(0, 57) + "...";
    const titleTag = `${rawTitle} | FondPeace`;
    const description = buildDescription(post);

    return {
      title: titleTag,
      description,
      keywords: extractKeywords(post),
      alternates: { canonical: pageUrl },
      openGraph: {
        title: titleTag,
        description,
        url: pageUrl,
        siteName: "FondPeace",
        type: "video.other", // Root level for better support
        images: [
          {
            url: thumb,
            width: 1280,
            height: 720,
            alt: titleTag,
          },
        ],
        // Keep videos for LinkedIn/FB compatibility, but WhatsApp will use images
        videos: [
          {
            url: mediaUrl,
            width: 1280,
            height: 720,
            type: "video/mp4",
          },
        ],
      },
      twitter: {
        card: "player", // For embedded player with play button
        title: titleTag,
        description,
        image: thumb, // Fallback static thumbnail (important!)
        site: "@yourfondpeacehandle", // Optional: Add your X handle if available
        player: {
          url: pageUrl, // The page URL (must contain playable video; X embeds the page in iframe)
          width: 1280,
          height: 720,
          // stream: mediaUrl, // Optional: Direct stream URL if supported (for better performance)
        },
      },
    };
  } catch (err) {
    console.error("Metadata error:", err);
    return { title: "FondPeace Video" };
  }
}



// --- Page Component (Server Component) ---
export default async function Page({ params }) {
    const id = params?.id;
    if (!id) return <div>Invalid ID</div>;

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
        const authorName = post?.userId?.username || "FondPeace";
        const isVideo = !!mediaUrl && (mediaUrl.endsWith(".mp4") || (post.mediaType && String(post.mediaType).startsWith("video")));




 
    

const jsonLdFull = {
  "@context": "https://schema.org",
  "@graph": [
    // 1️⃣ WebPage
    {
      "@type": "WebPage",
      "@id": `${SITE_ROOT}/short/${post._id}#webpage`,
      url: `${SITE_ROOT}/short/${post._id}`,
      name: post.title ? post.title.substring(0, 110) : "FondPeace Post",
      mainEntity: { "@id": `${SITE_ROOT}/short/${post._id}#post` },
      breadcrumb: { "@id": `${SITE_ROOT}/short/${post._id}#breadcrumb` }
    },

    // 2️⃣ VideoObject (ONLY when media is video)
    ...(isVideo
  ? [
      {
        "@type": "VideoObject",
        "@id": `${SITE_ROOT}/short/${post._id}#video`,
        name: post.title || "FondPeace Video",
        description: post.title || "FondPeace video post",

        thumbnailUrl: [
          toAbsolute(post.thumbnail || post.media || DEFAULT_AVATAR)
        ],

        contentUrl: toAbsolute(post.media),
        uploadDate: new Date(post.createdAt).toISOString(),

        duration:
          post.duration &&
          (Number(post.duration)
            ? secToISO(Number(post.duration))
            : post.duration),

        author: {
          "@type": "Person",
          name: post.userId?.username || "FondPeace",
          url: `${SITE_ROOT}/profile/${post.userId?.username || "FondPeace"}`
        },

        publisher: {
          "@type": "Organization",
          name: "FondPeace",
          url: SITE_ROOT,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_ROOT}/Fondpeace.jpg`,
            width: 600,
            height: 60
          }
        },

        interactionStatistic: buildInteractionSchema(post),

        keywords: extractKeywords(post),
        inLanguage: "hi-IN",
        isFamilyFriendly: true,
        isAccessibleForFree: true,

        potentialAction: {
          "@type": "WatchAction",
          target: `${SITE_ROOT}/short/${post._id}`
        },

        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_ROOT}/short/${post._id}`
        }
      }
    ]
  : []),


    // 3️⃣ SocialMediaPosting
    {
      "@type": "SocialMediaPosting",
      "@id": `${SITE_ROOT}/short/${post._id}#post`,
      url: `${SITE_ROOT}/short/${post._id}`,
      headline: post.title ? post.title.substring(0, 110) : "FondPeace Post",
      articleBody: post.title || "",
      dateCreated: new Date(post.createdAt).toISOString(),
      dateModified: new Date(post.updatedAt || post.createdAt).toISOString(),
      mainEntityOfPage: { "@id": `${SITE_ROOT}/short/${post._id}#webpage` },

      ...(isVideo && {
        sharedContent: { "@id": `${SITE_ROOT}/short/${post._id}#video` }
      }),

      author: {
        "@type": "Person",
        "@id": `${SITE_ROOT}/profile/${post.userId?.username || "FondPeace"}#person`,
        name: post.userId?.username || "FondPeace",
        url: `${SITE_ROOT}/profile/${post.userId?.username || "FondPeace"}`,
        image: toAbsolute(post.userId?.profilePic) || DEFAULT_AVATAR
      },

      image: {
        "@type": "ImageObject",
        url: toAbsolute(post.media || post.thumbnail || DEFAULT_AVATAR),
        width: 1080,
        height: 1350,
        representativeOfPage: true
      },

      commentCount: commentsCount(post),
      interactionStatistic: buildInteractionSchema(post),

      comment: (post.comments || []).map((c) => ({
        "@type": "Comment",
        "@id": `${SITE_ROOT}/short/${post._id}#comment-${c._id}`,
        text: c.CommentText || "",
        dateCreated: new Date(c.createdAt).toISOString(),
        author: {
          "@type": "Person",
          name: c.userId?.username || "User",
          url: `${SITE_ROOT}/profile/${c.userId?.username || "User"}`
        },
        interactionStatistic: buildCommentInteractionSchema(c)
      }))
    },

    // 4️⃣ Breadcrumb
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_ROOT}/short/${post._id}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "FondPeace",
          item: SITE_ROOT
        },
        {
          "@type": "ListItem",
          position: 2,
          name: post.userId?.username || "User",
          item: `${SITE_ROOT}/profile/${post.userId?.username || "FondPeace"}`
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title ? post.title.substring(0, 110) : "Post",
          item: `${SITE_ROOT}/short/${post._id}`
        }
      ]
    }
  ]
};

        
        return (
            <main className="w-full min-h-screen bg-gray-50">

                {/* JSON-LD: क्रॉलर को इंडेक्स करने के लिए केवल वर्तमान वीडियो का डेटा देता है */}
                <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFull) }}
    />

                {/* Status Bar, etc. */}
                {/* <StatusBar /> */}
                
   

                
                {/* Hidden HTML VideoObject for SEO (authority-level) */}
        <section
          itemScope
          itemType="https://schema.org/VideoObject"
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
            width: "1px",
            height: "1px",
            overflow: "hidden"
          }}
        >
          <h1 itemProp="name">{post.title}</h1>
          <p itemProp="description">{buildDescription(post)}</p>

          <video
            itemProp="contentUrl"
            src={mediaUrl}
            poster={thumbnail}
            preload="metadata"
            controls
          >
            <source src={mediaUrl} type="video/mp4" />
          </video>

          <meta itemProp="thumbnailUrl" content={thumbnail} />
          <meta itemProp="uploadDate" content={post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString()} />
          <meta itemProp="duration" content={post.duration ? (String(post.duration).startsWith("PT") ? post.duration : secToISO(Number(post.duration))) : "PT0M30S"} />

          <div itemProp="interactionStatistic" itemScope itemType="https://schema.org/InteractionCounter">
            <meta itemProp="interactionType" content="https://schema.org/WatchAction" />
            <meta itemProp="userInteractionCount" content={viewsCount(post)} />
          </div>

          <link itemProp="mainEntityOfPage" href={pageUrl} />

          <div itemProp="author" itemScope itemType="https://schema.org/Person">
            <meta itemProp="name" content={authorName} />
          </div>

          <div itemProp="publisher" itemScope itemType="https://schema.org/Organization">
            <meta itemProp="name" content="FondPeace" />
            <meta itemProp="url" content={SITE_ROOT} />
            <div itemProp="logo" itemScope itemType="https://schema.org/ImageObject">
              <meta itemProp="url" content={DEFAULT_THUMB} />
              <meta itemProp="width" content="600" />
              <meta itemProp="height" content="60" />
            </div>
          </div>

          <meta itemProp="keywords" content={extractKeywords(post)} />
          <meta itemProp="isFamilyFriendly" content="true" />
        </section>


                
                {/* CONTENT */}
    <section className="max-w-3xl mx-auto px-2 py-8">
      <article className="bg-white shadow-md rounded-2xl overflow-hidden">

        {/* Reels Feed (UNCHANGED LOGIC) */}
        <div className="w-full p-4">
          <ReelsFeedWrapper
            initialPost={post}
            initialRelated={related}
          />
        </div>

      </article>
    </section>

    {Array.isArray(related) && related.length > 0 && (
  <aside className="max-w-5xl mx-auto mt-10 px-4">
    <p className="text-xl font-semibold mb-4 text-gray-900">Related Posts</p>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {related.map((r) => {
        const thumb = toAbsolute(r.thumbnail || "");
        return (
          <a
            key={r._id}
            href={`/short/${r._id}`}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border"
          >
            <div className="w-full bg-gray-100">
              <img
                src={thumb}
                alt={r.title}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            <div className="p-3">
              <p className="font-medium text-gray-900 line-clamp-2 text-sm">
                {r.title}
              </p>

              <div className="flex items-center gap-3 text-gray-500 text-xs mt-2">
                <FaHeart className="text-red-500" /> {likesCount(r)} 
                <span>•</span>
                <FaCommentDots /> {commentsCount(r)} 
                <span>•</span>
                <FaEye /> {viewsCount(r) || 0}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  </aside>
)}
                
            </main>
        );
    } catch (e) {
        console.error("Page component error:", e);
        return notFound();
    }
}











// // app/short/[id]/page.jsx

// import StatusBar from "@/components/StatusBar";
// import { notFound } from "next/navigation";

// export const dynamic = "force-dynamic";

// import ReelsFeedWrapper from "@/components/ReelsFeedWrapper";

// const API_SINGLE = "https://backend-k.vercel.app/post/single/";
// const SITE_ROOT = "https://www.fondpeace.com";
// const DEFAULT_THUMB = `${SITE_ROOT}/fondpeace.jpg`;

// /* Make any URL absolute relative to SITE_ROOT; returns null when url falsy */
// function toAbsolute(url) {
//   if (!url) return null;
//   if (url.startsWith("http")) return url;
//   if (url.startsWith("/")) return `${SITE_ROOT}${url}`;
//   return `${SITE_ROOT}/${url}`;
// }

// function secToISO(sec) {
//   const s = Number(sec);
//   if (!Number.isFinite(s) || s <= 0) return undefined;
//   const h = Math.floor(s / 3600);
//   const m = Math.floor((s % 3600) / 60);
//   const secLeft = Math.floor(s % 60);
//   let iso = "PT";
//   if (h > 0) iso += `${h}H`;
//   if (m > 0) iso += `${m}M`;
//   if (secLeft > 0 || (h === 0 && m === 0)) iso += `${secLeft}S`;
//   return iso;
// }

// function likesCount(post) {
//   if (!post) return 0;
//   return Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
// }
// function commentsCount(post) {
//   if (!post) return 0;
//   return Array.isArray(post.comments) ? post.comments.length : (post.commentCount || 0);
// }
// function viewsCount(post) {
//   if (!post) return 0;
//   return typeof post.views === "number" ? post.views : (post.views || 0);
// }
// function buildInteractionSchema(post) {
//   return [
//     { "@type": "InteractionCounter", interactionType: { "@type": "LikeAction" }, userInteractionCount: likesCount(post) },
//     { "@type": "InteractionCounter", interactionType: { "@type": "CommentAction" }, userInteractionCount: commentsCount(post) },
//     { "@type": "InteractionCounter", interactionType: { "@type": "WatchAction" }, userInteractionCount: viewsCount(post) },
//   ];
// }

// function buildDescription(post) {
//   const author = post?.userId?.username || "FondPeace";
//   const likes = likesCount(post);
//   const comments = commentsCount(post);
//   const views = viewsCount(post);
//   const title = post?.title || "FondPeace Video";
//   // SEO-friendly single flowing sentence (no periods)
//   return `🔥 ${views} Views, ${likes} Likes, ${comments} Comments, watch "${title}" uploaded by ${author} on FondPeace, join now to watch latest videos and updates`;
// }

// function extractKeywords(post) {
//   if (!post) return "";
//   if (Array.isArray(post.tags) && post.tags.length) return post.tags.join(", ");
//   if (Array.isArray(post.hashtags) && post.hashtags.length)
//     return post.hashtags.map(h => h.replace("#", "")).join(", ");
//   if (post.title) return post.title.split(" ").slice(0, 10).join(", ");
//   return "fondpeace,shorts,video";
// }

// /* Server-side metadata: Next will call this for each /short/[id] request */
// export async function generateMetadata({ params }) {
//   const id = params?.id;
//   if (!id) return { title: "Invalid Video" };

//   try {
//     const res = await fetch(`${API_SINGLE}${id}`, { cache: "no-store" });
//     if (!res.ok) return { title: "Fondpeace Video" };
//     const data = await res.json();
//     const post = data?.post;
//     if (!post) return { title: "Video Not Found" };

//     const mediaUrl = toAbsolute(post.media || post.mediaUrl) || null;
//     const img = toAbsolute(post.thumbnail) || DEFAULT_THUMB;
//     const title = (post.title || "FondPeace Video").slice(0, 160);

//     // robust isVideo detection
//     const isVideo = !!mediaUrl && (mediaUrl.endsWith(".mp4") || mediaUrl.includes("video"));

//     // Build metadata object (keep it minimal & safe)
//     const metadata = {
//       title,
//       description: buildDescription(post),
//       keywords: extractKeywords(post),
//       alternates: { canonical: `${SITE_ROOT}/short/${id}` },
//       openGraph: {
//         title,
//         description: buildDescription(post),
//         url: `${SITE_ROOT}/short/${id}`,
//         type: isVideo ? "video.other" : "article",
//         images: [img],
//         ...(isVideo && {
//           // Next/OpenGraph accepts a video array; include only when we have a valid mediaUrl
//           video: [
//             {
//               url: mediaUrl,
//               type: "video/mp4",
//               width: 1280,
//               height: 720
//             }
//           ]
//         })
//       },
//       twitter: {
//         card: isVideo ? "player" : "summary_large_image",
//         title,
//         description: buildDescription(post),
//         image: img,
//         ...(isVideo && { player: mediaUrl })
//       },
//     };

//     return metadata;
//   } catch (e) {
//     console.error("generateMetadata error:", e);
//     return { title: "Fondpeace Video" };
//   }
// }

// /* Server component renders initial HTML and passes initial post to client player */
// export default async function Page({ params }) {
//   const id = params?.id;
//   if (!id) return <div>Invalid ID</div>;

//   try {
//     const res = await fetch(`${API_SINGLE}${id}`, { cache: "no-store" });
//     if (!res.ok) {
//       // backend failed: show 404 for crawlers
//       return notFound();
//     }
//     const data = await res.json();
//     const post = data?.post || null;
//     const related = data?.related || [];

//     if (!post) {
//       // return real 404 so GSC doesn't treat the page as broken HTML
//       return notFound();
//     }

//     const mediaUrl = toAbsolute(post.media || post.mediaUrl) || null;
//     const thumbnail = toAbsolute(post.thumbnail) || DEFAULT_THUMB;
//     const pageUrl = `${SITE_ROOT}/short/${post._id || id}`;
//     const authorName = post?.userId?.username || "FondPeace";
//     const isVideo = !!mediaUrl && (mediaUrl.endsWith(".mp4") || (post.mediaType && String(post.mediaType).startsWith("video")));

//     // JSON-LD for VideoObject (server-inserted so crawlers see it)
//     const videoSchema = {
//       "@context": "https://schema.org",
//       "@type": "VideoObject",
//       name: post.title || "FondPeace Video",
//       headline: post.title || "FondPeace Video",
//       description: buildDescription(post),
//       thumbnailUrl: [thumbnail || DEFAULT_THUMB],
//       // include contentUrl only if we have a media URL
//       ...(mediaUrl ? { contentUrl: mediaUrl } : {}),
//       embedUrl: `${SITE_ROOT}/embed/short/${post._id || id}`,
//       uploadDate: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
//       datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
//       dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : (post.createdAt ? new Date(post.createdAt).toISOString() : undefined),
//       duration: post.duration ? (Number(post.duration) ? secToISO(Number(post.duration)) : post.duration) : undefined,
//       width: post.width || 1280,
//       height: post.height || 720,
//       encodingFormat: isVideo ? "video/mp4" : undefined,
//       isAccessibleForFree: true,
//       publisher: {
//         "@type": "Organization",
//         name: "FondPeace",
//         url: SITE_ROOT,
//         logo: { "@type": "ImageObject", url: `${SITE_ROOT}/fondpeace.jpg`, width: 512, height: 512 },
//       },
//       author: { "@type": "Person", name: authorName },
//       creator: { "@type": "Person", name: authorName },
//       interactionStatistic: buildInteractionSchema(post),
//       keywords: extractKeywords(post),
//       inLanguage: "hi-IN",
//       isFamilyFriendly: true,
//       potentialAction: { "@type": "WatchAction", target: pageUrl },
//       mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
//       genre: [
//         "Entertainment",
//         "Short Video",
//         "Funny",
//         "Viral",
//         "Dance",
//         "Music",
//         "Comedy",
//         "Lifestyle",
//         "News",
//         "Motivation"
//       ],
//     };

//     return (
//       <main className="min-h-screen bg-white">
//         {/* JSON-LD inserted server-side for crawlers */}
//         <script
//           key="video-jsonld"
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
//         />

//         <StatusBar />
//         <section className="max-w-3xl mx-auto px-4 py-6">
//           {/* Server-rendered hidden <video> so crawlers detect video content even though player is client */}
//           {mediaUrl && (
//             <video
//               src={mediaUrl}
//               poster={thumbnail}
//               preload="metadata"
//               style={{ display: "none" }}
//             />
//           )}

//           {/* Client component: loads only on client (no-SSR) to avoid breaking crawler */}
//            <ReelsFeedWrapper initialPost={post} initialRelated={related} />
//         </section>
//       </main>
//     );
//   } catch (e) {
//     console.error("Page component error:", e);
//     // If anything goes wrong, return a 404 so indexing doesn't get invalid HTML
//     return notFound();
//   }
// }










// // app/short/[id]/page.jsx
// import ReelsFeed from "@/components/ReelsFeed"; // client component
// import StatusBar from "@/components/StatusBar";
// import { notFound } from "next/navigation";

// export const dynamic = "force-dynamic";

// const API_SINGLE = "https://backend-k.vercel.app/post/single/";
// const SITE_ROOT = "https://www.fondpeace.com";
// const DEFAULT_THUMB = `${SITE_ROOT}/fondpeace.jpg`;

// function toAbsolute(url) {
//   if (!url) return null;
//   if (url.startsWith("http")) return url;
//   if (url.startsWith("/")) return `${SITE_ROOT}${url}`;
//   return `${SITE_ROOT}/${url}`;
// }

// function secToISO(sec) {
//   const s = Number(sec);
//   if (!Number.isFinite(s) || s <= 0) return undefined;
//   const h = Math.floor(s / 3600);
//   const m = Math.floor((s % 3600) / 60);
//   const secLeft = Math.floor(s % 60);
//   let iso = "PT";
//   if (h > 0) iso += `${h}H`;
//   if (m > 0) iso += `${m}M`;
//   if (secLeft > 0 || (h === 0 && m === 0)) iso += `${secLeft}S`;
//   return iso;
// }

// function likesCount(post) {
//   if (!post) return 0;
//   return Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
// }
// function commentsCount(post) {
//   if (!post) return 0;
//   return Array.isArray(post.comments) ? post.comments.length : (post.commentCount || 0);
// }
// function viewsCount(post) {
//   if (!post) return 0;
//   return typeof post.views === "number" ? post.views : (post.views || 0);
// }
// function buildInteractionSchema(post) {
//   return [
//     { "@type": "InteractionCounter", interactionType: { "@type": "LikeAction" }, userInteractionCount: likesCount(post) },
//     { "@type": "InteractionCounter", interactionType: { "@type": "CommentAction" }, userInteractionCount: commentsCount(post) },
//     { "@type": "InteractionCounter", interactionType: { "@type": "WatchAction" }, userInteractionCount: viewsCount(post) },
//   ];
// }

// function buildDescription(post) {
//   const author = post?.userId?.username || "FondPeace";
//   const likes = likesCount(post);
//   const comments = commentsCount(post);
//   const views = viewsCount(post);
//   const title = post?.title || "FondPeace Video";
//   // SEO-friendly single flowing sentence (no periods)
//   return `🔥 ${views} Views, ${likes} Likes, ${comments} Comments, watch "${title}" uploaded by ${author} on FondPeace, join now to watch latest videos and updates`;
// }

// function extractKeywords(post) {
//   if (!post) return "";
//   if (Array.isArray(post.tags) && post.tags.length) return post.tags.join(", ");
//   if (Array.isArray(post.hashtags) && post.hashtags.length)
//     return post.hashtags.map(h => h.replace("#", "")).join(", ");
//   if (post.title) return post.title.split(" ").slice(0, 10).join(", ");
//   return "fondpeace,shorts,video";
// }

// /* Server-side metadata: Next will call this for each /short/[id] request */
// export async function generateMetadata({ params }) {
//   const id = params?.id;
//   if (!id) return { title: "Invalid Video" };

//   try {
//     const res = await fetch(`${API_SINGLE}${id}`, { cache: "no-store" });
//     if (!res.ok) return { title: "Fondpeace Video" };
//     const data = await res.json();
//     const post = data?.post;
//     if (!post) return { title: "Video Not Found" };

//     const mediaUrl = toAbsolute(post.media || post.mediaUrl) || null;
//     const img = toAbsolute(post.thumbnail) || DEFAULT_THUMB;
//     const title = (post.title || "Fondpeace Video").slice(0, 160);

//     // robust isVideo detection
//     const isVideo = !!mediaUrl && (mediaUrl.endsWith(".mp4") || mediaUrl.includes("video"));

//     return {
//       title,
//       description: buildDescription(post),
//       keywords: extractKeywords(post),
//       alternates: { canonical: `${SITE_ROOT}/short/${id}` },
//       openGraph: {
//         title,
//         description: buildDescription(post),
//         url: `${SITE_ROOT}/short/${id}`,
//         type: isVideo ? "video.other" : "article",
//         images: [img],
//         ...(isVideo && {
//           video: [
//             {
//               url: mediaUrl,
//               type: "video/mp4",
//               width: 1280,
//               height: 720
//             }
//           ]
//         })
//       },
//       twitter: {
//         card: isVideo ? "player" : "summary_large_image",
//         title,
//         description: buildDescription(post),
//         image: img,
//         ...(isVideo && { player: mediaUrl })
//       },
//     };
//   } catch (e) {
//     console.error("generateMetadata error:", e);
//     return { title: "Fondpeace Video" };
//   }
// }

// /* Server component renders initial HTML and passes initial post to client player */
// export default async function Page({ params }) {
//   const id = params?.id;
//   if (!id) return <div>Invalid ID</div>;

//   try {
//     const res = await fetch(`${API_SINGLE}${id}`, { cache: "no-store" });
//     if (!res.ok) {
//       // backend failed: show 404 for crawlers
//       return notFound();
//     }
//     const data = await res.json();
//     const post = data?.post || null;
//     const related = data?.related || [];

//     if (!post) {
//       // return real 404 so GSC doesn't treat the page as broken HTML
//       return notFound();
//     }

//     const mediaUrl = toAbsolute(post.media || post.mediaUrl) || null;
//     const thumbnail = toAbsolute(post.thumbnail) || DEFAULT_THUMB;
//     const pageUrl = `${SITE_ROOT}/short/${post._id || id}`;
//     const authorName = post?.userId?.username || "FondPeace";
//     const isVideo = !!mediaUrl && (mediaUrl.endsWith(".mp4") || (post.mediaType && String(post.mediaType).startsWith("video")));

//     // JSON-LD for VideoObject (server-inserted so crawlers see it)
//     const videoSchema = {
//       "@context": "https://schema.org",
//       "@type": "VideoObject",
//       name: post.title || "FondPeace Video",
//       headline: post.title || "FondPeace Video",
//       description: buildDescription(post),
//       thumbnailUrl: [thumbnail],
//       contentUrl: mediaUrl,
//       // ideally provide an embedable player URL if available; fallback to page URL
//       embedUrl: `${SITE_ROOT}/embed/short/${post._id || id}`,
//       uploadDate: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
//       datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
//       dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : (post.createdAt ? new Date(post.createdAt).toISOString() : undefined),
//       duration: post.duration ? (Number(post.duration) ? secToISO(Number(post.duration)) : post.duration) : undefined,
//       width: post.width || 1280,
//       height: post.height || 720,
//       encodingFormat: isVideo ? "video/mp4" : undefined,
//       publisher: {
//         "@type": "Organization",
//         name: "FondPeace",
//         url: SITE_ROOT,
//         logo: { "@type": "ImageObject", url: `${SITE_ROOT}/fondpeace.jpg`, width: 512, height: 512 },
//       },
//       author: { "@type": "Person", name: authorName },
//       creator: { "@type": "Person", name: authorName },
//       interactionStatistic: buildInteractionSchema(post),
//       keywords: extractKeywords(post),
//       inLanguage: "hi-IN",
//       isFamilyFriendly: true,
//       potentialAction: { "@type": "WatchAction", target: pageUrl },
//       mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
//       genre: [
//         "Entertainment",
//         "Short Video",
//         "Funny",
//         "Viral",
//         "Dance",
//         "Music",
//         "Comedy",
//         "Lifestyle",
//         "News",
//         "Motivation"
//       ],
//     };

//     return (
//       <main className="min-h-screen bg-white">
//         {/* JSON-LD inserted server-side for crawlers */}
//         <script
//           key="video-jsonld"
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
//         />

//         <StatusBar />
//         <section className="max-w-3xl mx-auto px-4 py-6">
//           {/* Server-rendered hidden <video> so crawlers detect video content even though player is client */}
//           {mediaUrl && (
//             <video
//               src={mediaUrl}
//               poster={thumbnail}
//               preload="metadata"
//               style={{ display: "none" }}
//             />
//           )}

//           {/* Client component: handles infinite scroll, autoplay, and navigation */}
//            <ReelsFeed initialPost={post} initialRelated={related} /> 
//         </section>
//       </main>
//     );
//   } catch (e) {
//     console.error("Page component error:", e);
//     // If anything goes wrong, return a 404 so indexing doesn't get invalid HTML
//     return notFound();
//   }
// }







// // app/short/[id]/page.jsx

// import StatusBar from "@/components/StatusBar";
// import ReelsFeed from "@/components/ReelsFeed";

// export const dynamic = "force-dynamic";

// const API_URL = "https://backend-k.vercel.app/post/single/";
// const SITE_ROOT = "https://www.fondpeace.com";
// const DEFAULT_THUMB = `${SITE_ROOT}/fondpeace.jpg`;

// /* -----------------------------
//    CORRECT METADATA
// ------------------------------ */
// export async function generateMetadata({ params }) {
//   const id = params?.id;

//   if (!id) {
//     return {
//       title: "Invalid Video | FondPeace",
//       description: "Video ID missing",
//     };
//   }

//   try {
//     const res = await fetch(`${API_URL}${id}`, { cache: "no-store" });
//     const data = await res.json();
//     const post = data?.post; // ⭐ correct

//     if (!post) {
//       return {
//         title: "Video Not Found | FondPeace",
//         description: "This video does not exist",
//       };
//     }

//     const mediaUrl = post.media || post.mediaUrl;

//     return {
//       title: `${post.title} - FondPeace`,
//       description: post.description || "Watch trending short videos.",
//       alternates: { canonical: `${SITE_ROOT}/short/${id}` },

//       openGraph: {
//         title: post.title,
//         description: post.description,
//         url: `${SITE_ROOT}/short/${id}`,
//         images: [post.thumbnail || DEFAULT_THUMB],
//         videos: [
//           {
//             url: mediaUrl,
//             width: post.width || 720,
//             height: post.height || 1280,
//           },
//         ],
//       },

//       twitter: {
//         card: "player",
//         title: post.title,
//         description: post.description,
//         images: [post.thumbnail || DEFAULT_THUMB],
//       },
//     };
//   } catch (error) {
//     return {
//       title: "Video | FondPeace",
//       description: "Watch trending short videos.",
//     };
//   }
// }

// /* -----------------------------
//    MAIN PAGE COMPONENT
// ------------------------------ */
// export default async function VideoPage({ params }) {
//   const id = params?.id;

//   console.log("URL PARAM ID:", id);

//   if (!id) {
//     return (
//       <main className="p-8 text-center">
//         <h2>Error: Video ID Not Found</h2>
//       </main>
//     );
//   }

//   let post = null;
//   let related = [];

//   try {
//     const res = await fetch(`${API_URL}${id}`, { cache: "no-store" });
//     const data = await res.json();

//     post = data?.post; // ⭐ correct
//     related = data?.related || []; // ⭐ correct

//     console.log("POST FOUND:", post);
//   } catch (e) {
//     console.error("API ERROR:", e);
//   }

//   if (!post) {
//     return (
//       <main className="p-8 text-center">
//         <h2>Video Not Found</h2>
//         <p>Backend did not return a valid post.</p>
//       </main>
//     );
//   }

//   const mediaUrl = post.media || post.mediaUrl;
//   const thumb = post.thumbnail || DEFAULT_THUMB;

//   return (
//     <main className="min-h-screen bg-white">
//       <StatusBar />

//       <section className="max-w-xl mx-auto px-4 py-6">
//         <h1 className="text-xl font-bold mb-3">{post.title}</h1>

//         <video
//           src={mediaUrl}
//           poster={thumb}
//           controls
//           playsInline
//           preload="metadata"
//           className="w-full rounded-xl"
//         />

//         <p className="mt-4 text-gray-700">{post.description}</p>

//         {/* SHOW RELATED */}
//         {related.length > 0 && (
//           <div className="mt-6">
//             <h2 className="font-bold text-lg mb-3">Related Videos</h2>

//             {related.map((r) => (
//               <div key={r._id} className="mb-4">
//                 <video
//                   src={r.media || r.mediaUrl}
//                   poster={r.thumbnail}
//                   className="w-full rounded-xl"
//                   muted
//                 />
//                 <p className="mt-2">{r.title}</p>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>
//     </main>
//   );
// }





// import Link from 'next/link';
// import StatusBar from '@/components/StatusBar';
// import LatestVideo from '@/components/LatestVideo';

// export const dynamic = 'force-dynamic';

// const API_URL = 'https://backendk-z915.onrender.com/post/shorts';
// const SECOND_API_URL = 'https://backendk-z915.onrender.com/post';

// export async function generateMetadata({ params }) {
//   const { videoid: id } = params;

//   const siteUrl = `https://www.fondpeace.com/short/${id}`;
//   const siteName = 'Fondpeace';

//   try {
//     // Fetch post
//     const response = await fetch(`${API_URL}?page=1&limit=20`, { next: { revalidate: 60 } });
//     const shortsData = await response.json();

//     let post = shortsData?.find(item => item._id === id);

//     if (!post || !post._id) {
//       const res = await fetch(`${SECOND_API_URL}/single/${id}`);
//       post = await res.json();
//     }

//     const content = post?.title?.trim() || 'Watch this short video on Fondpeace';
//     const description = content.slice(0, 160);

//     const mediaUrl = post?.media || post?.medias?.url;
//     if (!mediaUrl) throw new Error('No media URL found.');

//     const thumbnailUrl =
//       post?.thumbnail ||
//       post?.image ||
//       mediaUrl.replace(/\.(mp4|mov|webm)$/i, '.jpg') ||
//       'https://www.fondpeace.com/og-image.jpg';

//     const createdAt = post?.createdAt
//       ? new Date(post.createdAt).toISOString()
//       : new Date().toISOString();

//     const updatedAt = post?.updatedAt
//       ? new Date(post.updatedAt).toISOString()
//       : createdAt;

//     const username = post?.userId?.username || 'Fondpeace';
//     const tagsArray = Array.isArray(post?.tags) ? post.tags : [];

//     return {
//       title: content,
//       description,
//       keywords: [...tagsArray, 'fondpeace', 'short video', 'entertainment'].join(', '),

//       alternates: { canonical: siteUrl },
//       metadataBase: new URL('https://www.fondpeace.com'),

//       openGraph: {
//         title: content,
//         description,
//         url: siteUrl,
//         siteName,
//         type: 'video.other',
//         images: [
//           {
//             url: thumbnailUrl,
//             width: 1280,
//             height: 720,
//             alt: content,
//           },
//         ],
//         videos: [
//           {
//             url: mediaUrl,
//             secureUrl: mediaUrl,
//             width: 1280,
//             height: 720,
//             type: 'video/mp4',
//           },
//         ],
//         article: {
//           authors: [username],
//           publishedTime: createdAt,
//           modifiedTime: updatedAt,
//           tags: tagsArray,
//         },
//       },

//       twitter: {
//         card: 'player',
//         title: content,
//         description,
//         site: '@fondpeace',
//         creator: '@fondpeace',
//         images: [thumbnailUrl],
//         player: mediaUrl,
//         playerWidth: 1280,
//         playerHeight: 720,
//       },

//       other: {
//         'og:video': mediaUrl,
//         'og:video:type': 'video/mp4',
//         'og:video:secure_url': mediaUrl,
//         'twitter:player': mediaUrl,
//         'video:release_date': createdAt,
//         'video:modified_date': updatedAt,
//         'author': username,
//       },
//     };
//   } catch (error) {
//     console.error('Metadata error:', error);

//     return {
//       title: 'Fondpeace',
//       description: 'Watch trending short videos on Fondpeace.',
//       alternates: { canonical: siteUrl },
//       metadataBase: new URL('https://www.fondpeace.com'),
//       openGraph: {
//         title: 'Fondpeace',
//         description: 'Watch trending short videos on Fondpeace.',
//         url: siteUrl,
//         type: 'website',
//       },
//       twitter: {
//         card: 'summary_large_image',
//         title: 'Fondpeace',
//         description: 'Watch trending short videos on Fondpeace.',
//       },
//     };
//   }
// }

// // ---------------------------------------------------------------
// // PAGE COMPONENT WITH FULL VIDEO SCHEMA (GOOGLE RANKING REQUIRED)
// // ---------------------------------------------------------------

// export default async function Page({ params }) {
//   const id = params.videoid;

//   // Fetch exact single post (for schema)
//   const res = await fetch(`https://backendk-z915.onrender.com/post/single/${id}`, {
//     cache: 'no-store',
//   });
//   const post = await res.json();

//   const title = post?.title || "Fondpeace Video";
//   const mediaUrl = post?.media || post?.medias?.url || '';
//   const thumbnailUrl =
//     post?.thumbnail ||
//     post?.image ||
//     mediaUrl.replace(/\.(mp4|mov|webm)$/i, '.jpg') ||
//     'https://www.fondpeace.com/og-image.jpg';

//   const pageUrl = `https://www.fondpeace.com/short/${id}`;
//   const uploadDate = post?.createdAt || new Date().toISOString();

//   // ⭐ GOLDEN VIDEO SCHEMA (Google Video SEO REQUIRED)
//   const videoSchema = {
//     "@context": "https://schema.org",
//     "@type": "VideoObject",
//     name: title,
//     description: title,
//     thumbnailUrl: [thumbnailUrl],
//     uploadDate: new Date(uploadDate).toISOString(),
//     contentUrl: mediaUrl,
//     embedUrl: pageUrl,
//     url: pageUrl,
//     publisher: {
//       "@type": "Organization",
//       name: "Fondpeace",
//       logo: {
//         "@type": "ImageObject",
//         url: "https://www.fondpeace.com/fondpeace.jpg",
//       },
//     },
//   };

//   return (
//     <main>
//       {/* ⭐ Required JSON-LD Schema */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
//       />

//       <StatusBar />

//       <section className="p-4">
//         <h1 className="text-xl font-bold">{title}</h1>

//         <video
//           src={mediaUrl}
//           controls
//           poster={thumbnailUrl}
//           className="w-full rounded-xl mt-3"
//         />

//         {/* Latest videos section */}
//         <LatestVideo />
//       </section>
//     </main>
//   );
// }










// import LatestVideo from '@/components/LatestVideo';
// import Script from 'next/script';

// export const dynamic = 'force-dynamic';

// const SITE_ROOT = "https://www.fondpeace.com";
// const DEFAULT_TITLE = 'Watch Trending Short Video on FondPeace';
// const DEFAULT_DESCRIPTION = 'Discover trending short videos and entertainment on Fondpeace.';
// const DEFAULT_THUMBNAIL = `${SITE_ROOT}/fondpeace.jpg`;

// function toAbsolute(url) {
// if (!url) return null;
// if (url.startsWith("http")) return url;
// if (url.startsWith("/")) return `${SITE_ROOT}${url}`;
// return `${SITE_ROOT}/${url}`;
// }

// function secToISO(sec) {
// const s = Number(sec);
// if (!Number.isFinite(s) || s <= 0) return undefined;
// const h = Math.floor(s / 3600);
// const m = Math.floor((s % 3600) / 60);
// const secLeft = Math.floor(s % 60);
// let iso = "PT";
// if (h > 0) iso += `${h}H`;
// if (m > 0) iso += `${m}M`;
// if (secLeft > 0 || (h === 0 && m === 0)) iso += `${secLeft}S`;
// return iso;
// }

// function likesCount(post) {
// return Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
// }
// function commentsCount(post) {
// return Array.isArray(post.comments) ? post.comments.length : (post.commentCount || 0);
// }
// function viewsCount(post) {
// return typeof post.views === "number" ? post.views : 0;
// }

// function buildInteractionSchema(post) {
// return [
// { "@type": "InteractionCounter", interactionType: { "@type": "LikeAction" }, userInteractionCount: likesCount(post) },
// { "@type": "InteractionCounter", interactionType: { "@type": "CommentAction" }, userInteractionCount: commentsCount(post) },
// { "@type": "InteractionCounter", interactionType: { "@type": "WatchAction" }, userInteractionCount: viewsCount(post) }
// ];
// }

// function buildDescription(post) {
// const title = post?.title?.trim() || "video";
// const author = post?.userId?.username || "FondPeace";
// const likes = likesCount(post);
// const comments = commentsCount(post);
// const views = viewsCount(post);
// return `🔥 ${views} Views, ${likes} Likes, ${comments} Comments, watch "${title}" uploaded by ${author} on FondPeace. Join now to watch latest videos and updates.`;
// }

// async function getPostData(id) {
// let post;
// try {
// const res1 = await fetch(`https://backendk-z915.onrender.com/post/shorts?page=1&limit=5`, { next: { revalidate: 60 } });
// const data = await res1.json();
// post = data?.find?.(v => v._id === id);
// } catch (e) {}

// if (!post?._id) {
// const res2 = await fetch(`https://backendk-z915.onrender.com/post/single/${id}`, { next: { revalidate: 60 } });
// post = await res2.json();
// if (!post?._id) throw new Error("Post not found");
// }

// const pageUrl = `${SITE_ROOT}/short/${id}`;
// const mediaUrl = toAbsolute(post.media || post.medias?.url);
// const thumb = toAbsolute(post.thumbnail || post.image || mediaUrl.replace(/.(mp4|mov|webm)$/i, ".jpg")) || DEFAULT_THUMBNAIL;
// const authorName = post.userId?.username || "FondPeace";
// const titleTag = post?.title?.trim() || DEFAULT_TITLE;
// const description = buildDescription(post);
// const createdAt = post?.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString();
// const updatedAt = post?.updatedAt ? new Date(post.updatedAt).toISOString() : createdAt;
// const genreValue = (Array.isArray(post.tags) && post.tags.length) ? post.tags[0].trim() : "Entertainment";

// return { post, mediaUrl, thumb, authorName, titleTag, description, createdAt, updatedAt, genreValue, pageUrl };
// }

// export default async function Page({ params }) {
// const { videoid } = params;
// let postData = {};
// try {
// postData = await getPostData(videoid);
// } catch (e) {
// console.error(e);
// }

// const { post, mediaUrl, thumb, authorName, titleTag, description, createdAt, updatedAt, genreValue, pageUrl } = postData || {};
// if (!post) return <div className="text-center py-20">Video not found</div>;

// const videoSchema = {
// "@context": "[https://schema.org](https://schema.org)",
// "@type": "VideoObject",
// name: titleTag || "Video",
// description,
// thumbnailUrl: [thumb],
// contentUrl: mediaUrl,
// embedUrl: pageUrl,
// uploadDate: createdAt,
// datePublished: createdAt,
// dateModified: updatedAt,
// duration: post?.duration ? secToISO(Number(post.duration)) : undefined,
// width: post?.width || 1280,
// height: post?.height || 720,
// encodingFormat: "video/mp4",
// publisher: { "@type": "Organization", name: "FondPeace", url: SITE_ROOT, logo: { "@type": "ImageObject", url: `${SITE_ROOT}/logo.jpg`, width: 512, height: 512 } },
// author: { "@type": "Person", name: authorName },
// interactionStatistic: buildInteractionSchema(post),
// genre: genreValue || "Entertainment",
// isFamilyFriendly: true,
// potentialAction: { "@type": "WatchAction", target: pageUrl },
// mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl }
// };

// return ( <main className="min-h-screen bg-white"> <StatusBar /> <section className="max-w-3xl mx-auto px-4 py-8"> 
  
//     {/* ✅ LatestVideo is client-side */}
//     <div className="w-full">
//       <LatestVideo videoId={videoid} />
//     </div>
//   </section>

//   <Script id="video-jsonld" type="application/ld+json">
//     {JSON.stringify(videoSchema)}
//   </Script>
// </main>


// );
// }

















// import Link from 'next/link';
// import StatusBar from '@/components/StatusBar';
// import LatestVideo from '@/components/LatestVideo';

// export const dynamic = 'force-dynamic';

// const API_URL = 'https://backendk-z915.onrender.com/post/shorts';
// const SECOND_API_URL = 'https://backendk-z915.onrender.com/post';

// export async function generateMetadata({ params }) {
//   const { videoid: id } = params;

//   const siteUrl = `https://www.fondpeace.com/short/${id}`;
//   const siteName = 'Fondpeace';

//   try {
//     const response = await fetch(`${API_URL}?page=1&limit=5`, {
//       next: { revalidate: 60 },
//     });
//     const shortsData = await response.json();

//     let post = shortsData?.find?.(item => item._id === id);

//     if (!post || !post._id) {
//       const res = await fetch(`${SECOND_API_URL}/single/${id}`);
//       post = await res.json();
//       console.log("Posts: ", post);
//     }

//     const TagsList = ["fondpeace, video, short, entertainment"];
//     const content = post?.title?.trim() || 'Watch this short video on Fondpeace';
//     const title = content;
//     const description = content.slice(0, 160);
//     const tagsArray = Array.isArray(post?.tags) ? post.tags : [];
//     const keywords = tagsArray.join(', ') + TagsList.join(', ') || TagsList.join(', ');

//     const mediaUrl = post?.media || post?.medias?.url;

//     if (!mediaUrl) throw new Error('No media URL found');

//     const createdAt = post?.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString();
//     const updatedAt = post?.updatedAt ? new Date(post.updatedAt).toISOString() : createdAt;

//     const username = post?.userId?.username || 'Fondpeace';
//     const thumbnailUrl = post?.thumbnail || post?.image || mediaUrl.replace(/\.(mp4|mov|webm)$/, '.jpg') || mediaUrl || "https://www.fondpeace.com/og-image.jpg";


//     return {
//       title,
//       description,
//       keywords,
//       authors: [{ name: username }],
//       alternates: {
//         canonical: siteUrl,
//       },
//       metadataBase: new URL('https://www.fondpeace.com'),
//       openGraph: {
//         title,
//         description,
//         url: siteUrl,
//         siteName,
//         type: 'video.other',
//         locale: 'en_US',
//         images: [
//           {
//             url: thumbnailUrl, // ✅ Using thumbnail URL as thumbnail
//             width: 1280,
//             height: 720,
//             alt: content,
//           },
//         ],
//         videos: [
//           {
//             url: mediaUrl,
//             secureUrl: mediaUrl,
//             width: 1280,
//             height: 720,
//             type: 'video/mp4',
//           },
//         ],
//         article: {
//           authors: [username],
//           publishedTime: createdAt,
//           modifiedTime: updatedAt,
//           tags: tagsArray,
//         },
//       },
//       twitter: {
//         card: 'player',
//         title,
//         description,
//         site: '@fondpeace',
//         creator: '@fondpeace',
//         images: [thumbnailUrl], // ✅ Again, using thumbnail as image
//         player: mediaUrl,
//         playerWidth: 1280,
//         playerHeight: 720,
//       },
//       other: {
//         'og:video': mediaUrl,
//         'og:video:type': 'video/mp4',
//         'og:video:width': '1280',
//         'og:video:height': '720',
//         'og:video:secure_url': mediaUrl,
//         'twitter:player': mediaUrl,
//         'twitter:player:width': '1280',
//         'twitter:player:height': '720',
//         'video:type': 'video/mp4',
//         'video:release_date': createdAt,
//         'video:modified_date': updatedAt,
//         'author': username,
//       },
//     };
//   } catch (error) {
//     console.error("Metadata generation error:", error);

//     return {
//       title: 'Fondpeace',
//       description: 'Watch trending short videos and entertainment on Fondpeace.',
//       keywords: 'fondpeace, video, short, entertainment',
//       alternates: {
//         canonical: siteUrl,
//       },
//       metadataBase: new URL('https://www.fondpeace.com'),
//       openGraph: {
//         title: 'Fondpeace',
//         description: 'Discover trending short videos and entertainment.',
//         type: 'website',
//         url: siteUrl,
//         siteName,
//         images: [],
//       },
//       twitter: {
//         card: 'summary_large_image',
//         title: 'Fondpeace',
//         description: 'Discover trending short videos and entertainment.',
//         images: [],
//       },
//     };
//   }
// }

// export default function Page() {
//    return (
//   <main>
//   helle dear 
//   <LatestVideo />
//   </main>
// );
// }








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
//   const pageUrl = `${SITE_ROOT}/short/${id}`;
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











// // app/short/[id]/page.jsx
// // GOAL: Dedicated Watch Page for Google Video Indexing.
// // This page ensures VideoObject schema is present on the primary content page,
// // resolving the "Video isn't on a watch page" error.

// import { FaHeart, FaCommentDots, FaEye } from "react-icons/fa";

// const API_BASE = "https://backend-k.vercel.app"; // set your API
// const SITE_ROOT = "https://fondpeace.com"; // set your site root
// const CANONICAL_ROOT = `${SITE_ROOT}/post`; // The user-facing URL we want Google to rank

// /* --------------------------- Helpers (Shared Logic) --------------------------- */

// function toAbsolute(url) {
//   if (!url) return null;
//   if (url.startsWith("http")) return url;
//   if (url.startsWith("/")) return `${SITE_ROOT}${url}`;
//   return `${SITE_ROOT}/${url}`;
// }

// function secToISO(sec) {
//   if (sec == null) return undefined;
//   const s = Number(sec);
//   if (!s || isNaN(s)) return undefined;
//   const h = Math.floor(s / 3600);
//   const m = Math.floor((s % 3600) / 60);
//   const sLeft = s % 60;
//   let iso = "PT";
//   if (h) iso += `${h}H`;
//   if (m) iso += `${m}M`;
//   if (sLeft || (!h && !m)) iso += `${sLeft}S`;
//   return iso;
// }

// function likesCount(post) {
//   return Array.isArray(post?.likes) ? post.likes.length : 0;
// }
// function commentsCount(post) {
//   return Array.isArray(post?.comments) ? post.comments.length : 0;
// }
// function viewsCount(post) {
//   return typeof post?.views === "number" ? post.views : 0;
// }

// function buildInteractionSchema(post) {
//   return [
//     {
//       "@type": "InteractionCounter",
//       interactionType: { "@type": "LikeAction" },
//       userInteractionCount: likesCount(post),
//     },
//     {
//       "@type": "InteractionCounter",
//       interactionType: { "@type": "CommentAction" },
//       userInteractionCount: commentsCount(post),
//     },
//     {
//       "@type": "InteractionCounter",
//       interactionType: { "@type": "WatchAction" },
//       userInteractionCount: viewsCount(post),
//     },
//   ];
// }

// function buildDescription(post) {
//   const title = post?.title || "";
//   const author = post?.userId?.username;
//   if (title && author) return `${title} uploaded by ${author}. Watch, like, and comment on FondPeace.`;
//   if (title) return title;
//   return "Discover trending posts and videos on FondPeace.";
// }

// /* ------------------------- Next metadata ------------------------ */

// export async function generateMetadata({ params }) {
//   const id = params?.id;
//   try {
//     const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
//     const data = await res.json();
//     const post = data?.post ?? null;

//     if (!post) return { title: "Video Not Found | FondPeace" };

//     const mediaUrl = toAbsolute(post.media);
//     const thumb = toAbsolute(post.thumbnail || post.media || "");
//     const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));

//     const titleTag = post.title ? `${post.title} (Watch) | FondPeace` : "Video Watch Page | FondPeace";
//     const desc = buildDescription(post);
//     const canonicalUrl = `${CANONICAL_ROOT}/${id}`;

//     return {
//       title: titleTag,
//       description: desc,
//       // IMPORTANT: The Canonical URL points back to the user-facing social page (/post/[id])
//       alternates: { canonical: canonicalUrl },
//       openGraph: {
//         title: titleTag,
//         description: desc,
//         url: `${SITE_ROOT}/short/${id}`,
//         type: isVideo ? "video.other" : "article",
//         images: [{ url: thumb }],
//       },
//       // New: We don't want this page indexed in regular search results, only the video.
//       robots: { index: false, follow: true },
//     };
//   } catch (err) {
//     console.error("generateMetadata error", err);
//     return { title: "Video Post | FondPeace" };
//   }
// }

// /* ---------------------------- Watch Page Component ----------------------------- */

// export default async function WatchPage({ params }) {
//   const id = params?.id;
//   const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
//   const data = await res.json();
//   const post = data?.post ?? null;

//   if (!post) {
//     return (
//       <main className="w-full min-h-screen flex items-center justify-center">
//         <div className="p-6 text-center">Video not found.</div>
//       </main>
//     );
//   }

//   const mediaUrl = toAbsolute(post.media);
//   const thumbnail = toAbsolute(post.thumbnail || post.media || "");

//   const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));

//   const pageUrl = `${SITE_ROOT}/short/${id}`;
//   const canonicalUrl = `${CANONICAL_ROOT}/${id}`;

//   const publisher = {
//     "@type": "Organization",
//     name: "FondPeace",
//     url: SITE_ROOT,
//   };

//   // The primary VideoObject Schema for Indexing
//   const jsonLd = isVideo
//     ? {
//         "@context": "https://schema.org",
//         "@type": "VideoObject",
//         url: pageUrl, 
//         name: post.title,
//         description: buildDescription(post),
//         thumbnailUrl: [thumbnail],
//         contentUrl: mediaUrl,
//         embedUrl: mediaUrl,
//         uploadDate: new Date(post.createdAt || Date.now()).toISOString(),
//         ...(post.duration ? { duration: secToISO(post.duration) } : {}),
//         publisher: publisher,
//         interactionStatistic: buildInteractionSchema(post),
//         // CRITICAL FIX: Explicitly tells Google the video is the main content of the canonical URL
//         mainEntityOfPage: {
//             "@type": "WebPage",
//             "@id": canonicalUrl
//         }
//       }
//     : null;

//   if (!isVideo) {
//     // If not a video, redirect the user back to the canonical social page.
//     return <main className="p-6 text-center">This watch URL is for videos only. Go to <a href={canonicalUrl} className="text-blue-500 underline">Social Post</a></main>
//   }

//   return (
//     <main className="w-full min-h-screen bg-gray-100 text-gray-900 flex justify-center py-6 md:py-10">
//       {/* JSON-LD for guaranteed Video Indexing */}
//       {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

//       <section className="max-w-3xl w-full mx-auto bg-white shadow-xl rounded-lg overflow-hidden border-t-8 border-blue-600">
//         <article className="p-5 sm:p-6 md:p-8">
          
//           {/* 1. AUTHOR INFO - Minimal text above video */}
//           <div className="flex items-center gap-3 mb-5 border-b pb-4">
//             <img 
//               src={`${SITE_ROOT}/og-image.jpg`} 
//               alt="FondPeace" 
//               className="w-12 h-12 rounded-full object-cover"
//             />
//             <div>
//               <div className="font-semibold text-gray-900">{post.userId?.username || "FondPeace"}</div>
//               <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
//             </div>
//           </div>
          
//           {/* 2. VIDEO PLAYER - PRIMARY FOCUS (High up on the page) */}
//           <div className="mb-6">
//             <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
//               <video 
//                 controls 
//                 preload="metadata" 
//                 poster={thumbnail || undefined} 
//                 className="w-full h-full object-cover"
//                 playsInline
//               >
//                 <source src={mediaUrl} type="video/mp4" />
//                 Your browser does not support the video tag.
//               </video>
//             </div>
//           </div>

//           {/* 3. TITLE (H1) AND DETAILS - Immediately below the video */}
//           <h1 className="text-xl md:text-2xl font-bold leading-tight mb-4 text-blue-700">
//                 {post.title}
//             </h1>

//             {/* Description / Body */}
//             <p className="text-gray-700 mb-5">
//                 {buildDescription(post)}
//             </p>

//           {/* 4. INTERACTION STATS */}
//           <div className="flex items-center gap-6 text-gray-600 border-t pt-4">
//                 <div className="flex items-center gap-1">
//                     <FaHeart className="text-red-600" />
//                     <span className="text-sm font-medium">{likesCount(post)} Likes</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                     <FaCommentDots />
//                     <span className="text-sm font-medium">{commentsCount(post)} Comments</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                     <FaEye />
//                     <span className="text-sm font-medium">{viewsCount(post)} Views</span>
//                 </div>
//                 {post.duration && (
//                     <div className="text-sm text-gray-500 ml-auto">
//                         Duration: {secToISO(post.duration)}
//                     </div>
//                 )}
//           </div>

//             {/* Link back to the Social Page for user experience */}
//             <div className="mt-8 text-center">
//                 <a 
//                     href={canonicalUrl} 
//                     className="text-lg font-semibold text-blue-600 hover:text-blue-800 underline transition"
//                 >
//                     View this post on the social feed →
//                 </a>
//             </div>

//         </article>
//       </section>
//     </main>
//   );
// }





        // JSON-LD (Only for the initial/current video: post)
//         const videoSchema = {
//             "@context": "https://schema.org",
//             "@type": "VideoObject",
//             name: post.title || "FondPeace Video",
//             headline: post.title || "FondPeace Video",
//             description: buildDescription(post),
//             thumbnailUrl: [thumbnail || DEFAULT_THUMB],
//             ...(mediaUrl ? { contentUrl: mediaUrl } : {}),
//             embedUrl: `${SITE_ROOT}/embed/short/${post._id || id}`,
//             uploadDate: post.createdAt
//   ? new Date(post.createdAt).toISOString()
//   : new Date().toISOString(),
//             // ... (rest of the schema properties)
//             duration: post.duration ? (Number(post.duration) ? secToISO(Number(post.duration)) : post.duration) : undefined,
//             author: { "@type": "Person", name: authorName },
//             publisher: {
//   "@type": "Organization",
//   name: "FondPeace",
//   url: "https://www.fondpeace.com",
//   logo: {
//     "@type": "ImageObject",
//     url: "https://www.fondpeace.com/Fondpeace.jpg",
//     width: 600,
//     height: 60
//   }
// },

//             interactionStatistic: buildInteractionSchema(post),
//             keywords: extractKeywords(post),
//             inLanguage: "hi-IN",
//             potentialAction: { "@type": "WatchAction", target: pageUrl },
//             isFamilyFriendly: true,
//             isAccessibleForFree: true,
//             mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
//         };
