// ✓ GOOGLE-OPTIMIZED POST PAGE (VIDEO + IMAGE + ARTICLE)
// ✓ AUTO DETECT MEDIA TYPE
// ✓ FIXES "VIDEO ISN’T ON WATCH PAGE" ERROR

import SinglePostPage from "@/components/SinglePostPage";
import { FaHeart, FaCommentDots, FaEye,FaArrowLeft  } from "react-icons/fa";
import Link from "next/link";
import { redirect } from "next/navigation";
const API_BASE = "https://backend-k.vercel.app";
const SITE_ROOT = "https://fondpeace.com";
const DEFAULT_AVATAR = "https://fondpeace.com/Fondpeace.jpg";


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
  const likes = likesCount(post);
  const comments = commentsCount(post);
  const views = viewsCount(post);

  // SEO-friendly, high-CTR, single flowing paragraph without periods
  return `🔥 ${views} Views, ${likes} Likes, ${comments} Comments, watch "${post.title}" uploaded by ${author} on FondPeace, join now to watch latest videos and updates`;
}

function extractKeywords(post) {
  if (Array.isArray(post.tags) && post.tags.length) return post.tags.join(", ");
  if (Array.isArray(post.hashtags) && post.hashtags.length)
    return post.hashtags.map(h => h.replace("#", "")).join(", ");
  return post.title.split(" ").slice(0, 10).join(", ");
}

/* ------------------------- generateMetadata ------------------------- */
export async function generateMetadata({ params }) {
  const id = params?.id;
  const pageUrl = `${SITE_ROOT}/post/${id}`;

  try {
    const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
    const data = await res.json();
    const post = data?.post;

    if (!post) return { title: "Post Not Found | FondPeace" };

    const mediaUrl = toAbsolute(post.media || post.mediaUrl);
    const thumb = toAbsolute(post.thumbnail || mediaUrl);

    const isVideo = mediaUrl?.endsWith(".mp4");
    const isImage = /^image\//i.test(post.mediaType || "") || /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp|svg|jfif)$/i.test(mediaUrl || "");


    const titleTag = `${post.title} - FondPeace`;


    return {
      title: titleTag,
      description: buildDescription(post),
      keywords: extractKeywords(post),
      alternates: { canonical: pageUrl },

      openGraph: {
  title: titleTag,
  description: buildDescription(post),
  url: pageUrl,
  type: isVideo ? "video.other" : "article",
  images: [{ url: thumb }],
  ...(isVideo && {
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
  title: titleTag,
  description: buildDescription(post),
  image: thumb,
  ...(isVideo && { player: mediaUrl })
},

    };
  } catch {
    return { title: "Post | FondPeace" };
  }
}

/* ------------------------------ PAGE ------------------------------ */
export default async function Page({ params }) {
  const id = params?.id;
  const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });

  if (!res.ok) {
    console.log("API error", await res.text());
    redirect("/");
  }

  const data = await res.json();
  const post = data?.post;
  console.log("Post: ", post);
  const related = data?.related ?? [];

  if (!post) {
    redirect("/");
  }

  const pageUrl = `${SITE_ROOT}/post/${post._id}`;
  const mediaUrl = toAbsolute(post.media || post.mediaUrl);
  const thumbnail = toAbsolute(post.thumbnail || mediaUrl);
  const authorName = post.userId?.username || "FondPeace";

  const isVideo = mediaUrl?.endsWith(".mp4");
  const isImage = /^image\//i.test(post.mediaType || "") || /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp|svg|jfif)$/i.test(mediaUrl || "");


  /* ---------------------- JSON-LD ---------------------- */
const jsonLdOptimized = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_ROOT}/post/${post._id}#webpage`,
      "url": `${SITE_ROOT}/post/${post._id}`,
      "name": post.title ? post.title.substring(0, 110) : "FondPeace Post",
      "mainEntity": { "@id": `${SITE_ROOT}/post/${post._id}#post` },
      "breadcrumb": { "@id": `${SITE_ROOT}/post/${post._id}#breadcrumb` }
    },
    {
      "@type": "SocialMediaPosting",
      "@id": `${SITE_ROOT}/post/${post._id}#post`,
      "url": `${SITE_ROOT}/post/${post._id}`,
      "headline": post.title ? post.title.substring(0, 110) : "FondPeace Post",
      "articleBody": post.title || "",
      "dateCreated": new Date(post.createdAt).toISOString(),
      "dateModified": new Date(post.updatedAt || post.createdAt).toISOString(),
      "mainEntityOfPage": { "@id": `${SITE_ROOT}/post/${post._id}#webpage` },
      "author": {
        "@type": "Person",
        "@id": `${SITE_ROOT}/profile/${post.userId?.username || "FondPeace"}#person`,
        "name": post.userId?.username || "FondPeace",
        "url": `${SITE_ROOT}/profile/${post.userId?.username || "FondPeace"}`,
        "image": toAbsolute(post.userId?.profilePic) || DEFAULT_AVATAR,
        "identifier": {
          "@type": "PropertyValue",
          "propertyID": "Username",
          "value": post.userId?.username || "FondPeace"
        }
      },
      "image": {
        "@type": "ImageObject",
        "url": toAbsolute(post.media || post.thumbnail || DEFAULT_AVATAR),
        "width": 1080,
        "height": 1350,
        "caption": post.title ? post.title.substring(0, 110) : "Post Image",
        "representativeOfPage": true
      },
      "commentCount": commentsCount(post),
      "interactionStatistic": buildInteractionSchema(post),
      "comment": (post.comments || []).map((c) => ({
        "@type": "Comment",
        "@id": `${SITE_ROOT}/post/${post._id}#comment-${c._id}`,
        "text": c.CommentText || "",
        "dateCreated": new Date(c.createdAt).toISOString(),
        "author": {
          "@type": "Person",
          "name": c.userId?.username || "User",
          "url": `${SITE_ROOT}/profile/${c.userId?.username || "User"}`
        },
        "interactionStatistic": buildCommentInteractionSchema(c)
      }))
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_ROOT}/post/${post._id}#breadcrumb`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "FondPeace",
          "item": SITE_ROOT
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": post.userId?.username || "User",
          "item": `${SITE_ROOT}/profile/${post.userId?.username || "FondPeace"}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title ? post.title.substring(0, 110) : "Post",
          "item": `${SITE_ROOT}/post/${post._id}`
        }
      ]
    }
  ]
};


  
  return (
  <main className="w-full min-h-screen bg-white">

    {/* JSON-LD */}
   
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLdOptimized)
  }}
/>

       {/* HEADER – Instagram style */}
<header className="bg-white  sticky top-0 z-50">
  <div className="max-w-3xl mx-auto px-1 mb-2 h-12 flex items-center justify-between">
    
    {/* Back Button → Home */}
    <Link
      href="/"
      className="p-2 -ml-2"
      aria-label="Go to home"
    >
      <FaArrowLeft className="text-lg text-gray-900" />
    </Link>

    {/* Center Title */}
    <p className="text-md font-semibold text-gray-900">
      Post
    </p>

    {/* Right Spacer (for symmetry like Instagram) */}
    <div className="w-6" />
  </div>
</header>


    <section className="max-w-3xl mx-auto px-4 py-8">
      <article className="bg-white shadow-md rounded-2xl overflow-hidden p-6">



        {/* User Profile */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <img
              src={post.user?.profilePic || "/Fondpeace.jpg"}
              alt={post.userId?.username || "User"}
              className="w-11 h-11 rounded-full object-cover border"
              loading="lazy"
            />
            <div>
              <span className="font-semibold text-gray-800 block">
                {post.userId?.username || "Anonymous"}
              </span>
              <span className="text-gray-500 text-sm">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Menu button */}
          <button className="text-gray-500 hover:text-black transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
            </svg>
          </button>
        </div>

        {/* Post Title */}
        <h1 className="text-gray-800 mb-4">
          {post.title}
        </h1>

        {/* Media Section */}
        {isVideo ? (
          <video
            src={mediaUrl}
            poster={thumbnail}
            controls
            className="rounded-xl w-full max-h-[480px] bg-black"
          />
        ) : isImage ? (
          <img
            src={mediaUrl}
            alt={post.title}
            className="rounded-xl w-full object-cover"
            loading="lazy"
          />
        ) : null}

        {/* Post Content */}
        <SinglePostPage initialPost={post} />
      </article>
    </section>



    
    {Array.isArray(related) && related.length > 0 && (
  <aside className="max-w-5xl mx-auto mt-10 px-4">
    <p className="text-xl font-semibold mb-4 text-gray-900">
      Related Posts
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {related.map((r) => {
        const thumb = toAbsolute(r.thumbnail || "");

        return (
          <a
            key={r._id}
            href={`/short/${r._id}`}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border"
          >
            {/* ✅ THUMBNAIL CONTAINER FIX */}
            <div className="w-full aspect-video bg-gray-200 overflow-hidden relative">
  <img
    src={thumb}
    alt={r.title}
    className="w-full h-full object-cover object-center"
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

}










// // app/post/[id]/page.jsx
// import SinglePostPage from "@/components/SinglePostPage";
// import { FaHeart, FaCommentDots, FaEye } from "react-icons/fa";

// const API_BASE = "https://backend-k.vercel.app";
// const SITE_ROOT = "https://fondpeace.com";

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
//   if (!post) return 0;
//   if (Array.isArray(post.likes)) return post.likes.length;
//   if (typeof post.likes === "number") return post.likes;
//   return 0;
// }
// function commentsCount(post) {
//   if (!post) return 0;
//   if (Array.isArray(post.comments)) return post.comments.length;
//   if (typeof post.commentCount === "number") return post.commentCount;
//   return 0;
// }
// function viewsCount(post) {
//   if (!post) return 0;
//   if (typeof post.views === "number") return post.views;
//   return 0;
// }

// function buildInteractionSchema(post) {
//   return [
//     { "@type": "InteractionCounter", interactionType: { "@type": "LikeAction" }, userInteractionCount: likesCount(post) },
//     { "@type": "InteractionCounter", interactionType: { "@type": "CommentAction" }, userInteractionCount: commentsCount(post) },
//     { "@type": "InteractionCounter", interactionType: { "@type": "WatchAction" }, userInteractionCount: viewsCount(post) },
//   ];
// }

// function buildDescription(post) {
//   const title = post?.title || "";
//   const author = post?.userId?.username;
//   if (title && author) return `${title} uploaded by ${author}. Watch, like, and comment on FondPeace.`;
//   if (title) return title;
//   return "Discover trending posts and videos on FondPeace.";
// }

// function extractKeywords(post) {
//   if (!post) return "FondPeace, social media, trending posts";
//   if (Array.isArray(post.tags) && post.tags.length) return post.tags.map(t => t.trim()).filter(Boolean).join(", ");
//   if (Array.isArray(post.hashtags) && post.hashtags.length) return post.hashtags.map(h => h.replace(/^#/, "").trim()).filter(Boolean).join(", ");
//   const title = post.title || "";
//   const stopwords = new Set(["the","and","for","with","this","that","from","your","you","a","an","of","on","in","to","is","by","at","it"]);
//   const words = title
//     .split(/\s+/)
//     .map((w) => w.replace(/[^\w\u00C0-\u017F-]/g, "").toLowerCase())
//     .filter((w) => w && w.length > 2 && !stopwords.has(w));
//   return words.slice(0, 12).join(", ") || "FondPeace, social media, trending posts";
// }

// /* -------------------- Related posts JSON-LD builder -------------------- */
// function buildRelatedItemList(related = [], mainPostId) {
//   if (!Array.isArray(related) || related.length === 0) return null;

//   const itemList = related
//     .map((r, idx) => {
//       if (!r || r._id === mainPostId) return null; // skip main post to avoid duplication
//       const mediaUrl = toAbsolute(r.media || r.mediaUrl || "");
//       const thumb = toAbsolute(r.thumbnail || r.media || r.mediaUrl || "");
//       const isVideo = r.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4"));
//       const authorName = r.userId?.username || "FondPeace";
//       const genre = Array.isArray(r.tags) && r.tags.length ? `Trending, Entertainment, ${r.tags.join(", ")}` : "Trending, Entertainment, Social Media";
//       const keywords = Array.isArray(r.tags) && r.tags.length ? r.tags.join(", ") : (Array.isArray(r.hashtags) ? r.hashtags.join(", ") : "FondPeace, social media, trending posts");
//       const pageUrl = `${SITE_ROOT}/post/${r._id}`;

//       const baseItem = {
//         url: pageUrl,
//         name: r.title || "",
//         headline: r.title || "",
//         description: r.description || `${r.title || "Related post"} on FondPeace.com`,
//         thumbnailUrl: thumb || undefined,
//         uploadDate: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
//         publisher: { "@type": "Organization", name: "FondPeace", url: SITE_ROOT },
//         author: { "@type": "Person", name: authorName },
//         interactionStatistic: buildInteractionSchema(r),
//         genre,
//         keywords,
//         inLanguage: "hi-IN",
//         isFamilyFriendly: true,
//         contentRating: "General",
//         potentialAction: { "@type": isVideo ? "WatchAction" : "ReadAction", target: pageUrl },
//         mainEntityOfPage: pageUrl,
//         creator: { "@type": "Person", name: authorName },
//       };

//       if (isVideo) {
//         return {
//           "@type": "ListItem",
//           position: idx + 1,
//           item: {
//             "@context": "https://schema.org",
//             "@type": "VideoObject",
//             ...baseItem,
//             contentUrl: mediaUrl || undefined,
//             embedUrl: pageUrl,
//             duration: r.duration ? secToISO(r.duration) : undefined,
//           },
//         };
//       } else if (r.mediaType?.startsWith("image") || thumb) {
//         return {
//           "@type": "ListItem",
//           position: idx + 1,
//           item: {
//             "@context": "https://schema.org",
//             "@type": "ImageObject",
//             ...baseItem,
//             contentUrl: mediaUrl || undefined,
//           },
//         };
//       } else {
//         return {
//           "@type": "ListItem",
//           position: idx + 1,
//           item: {
//             "@context": "https://schema.org",
//             "@type": "Article",
//             ...baseItem,
//             image: thumb ? [thumb] : undefined,
//             datePublished: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
//             dateModified: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
//           },
//         };
//       }
//     })
//     .filter(Boolean);

//   if (!itemList.length) return null;

//   return {
//     "@context": "https://schema.org",
//     "@type": "ItemList",
//     name: "Related Posts",
//     itemListElement: itemList,
//   };
// }

// /* ------------------------- generateMetadata ------------------------ */
// /**
//  * All OpenGraph / Twitter / canonical / robots metadata are returned here.
//  * No meta tags will be injected in the page body.
//  */
// export async function generateMetadata({ params }) {
//   const id = params?.id;
//   const pageUrl = `${SITE_ROOT}/post/${id}`;

//   try {
//     const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
//     const data = await res.json();
//     const post = data?.post ?? null;

//     if (!post) {
//       return { title: "Post Not Found | FondPeace" };
//     }

//     const mediaUrl = toAbsolute(post.media || post.mediaUrl || "");
//     const thumb = toAbsolute(post.thumbnail || post.media || post.mediaUrl || `${SITE_ROOT}/og-image.jpg`);
//     const extraImages = Array.isArray(post.extraImages) ? post.extraImages.map(toAbsolute) : [];
//     const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));
//     const titleTag = post.title ? `${post.title} | FondPeace` : "Post | FondPeace";
//     const desc = buildDescription(post);
//     const keywords = extractKeywords(post);

//     // genre + hashtags
//     const genreList = [
//       "Trending",
//       "Entertainment",
//       "Social Media",
//       ...(Array.isArray(post.tags) ? post.tags : []),
//       ...(Array.isArray(post.hashtags) ? post.hashtags : []),
//     ].filter(Boolean);
//     const genre = genreList.join(", ");

//     const likes = likesCount(post);
//     const views = viewsCount(post);
//     const comments = commentsCount(post);

//     const publisher = {
//       "@type": "Organization",
//       name: "FondPeace",
//       url: SITE_ROOT,
//       logo: { "@type": "ImageObject", url: `${SITE_ROOT}/logo.png` },
//     };

//     // OpenGraph object returned by Next.js metadata
//     const openGraph = {
//       title: titleTag,
//       description: desc,
//       url: pageUrl,
//       type: isVideo ? "video.other" : "article",
//       site_name: "FondPeace",
//       locale: "hi_IN",
//       images: [{ url: thumb }, ...extraImages.map((u) => ({ url: u }))],
//       article: {
//         author: post.userId?.username || "FondPeace",
//         tag: Array.isArray(post.tags) ? post.tags.join(", ") : undefined,
//         published_time: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
//       },
//       // non-standard helpers (some scrapers read these)
//       "og:likes": likes,
//       "og:views": views,
//       "og:comments": comments,
//     };

//     if (isVideo) {
//       openGraph.videos = [
//         {
//           url: mediaUrl,
//           type: "video/mp4",
//           width: 1280,
//           height: 720,
//           duration: post.duration ? secToISO(post.duration) : undefined,
//           release_date: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
//           tags: Array.isArray(post.tags) ? post.tags.join(", ") : undefined,
//           secure_url: mediaUrl && mediaUrl.startsWith("https") ? mediaUrl : undefined,
//         },
//       ];
//     }

//     const twitter = {
//       card: isVideo ? "player" : "summary_large_image",
//       title: titleTag,
//       description: desc,
//       image: thumb,
//       "twitter:label1": "Likes",
//       "twitter:data1": likes.toString(),
//       "twitter:label2": "Views",
//       "twitter:data2": views.toString(),
//     };
//     if (isVideo) {
//       twitter.player = pageUrl;
//       twitter.player_width = 1280;
//       twitter.player_height = 720;
//       twitter.player_stream = mediaUrl;
//     }

//     return {
//       title: titleTag,
//       description: desc,
//       keywords,
//       alternates: { canonical: pageUrl },
//       openGraph,
//       twitter,
//       robots: { index: true, follow: true },
//     };
//   } catch (err) {
//     console.error("generateMetadata error", err);
//     return { title: "Post | FondPeace" };
//   }
// }

// /* ---------------------------- Page (server) ----------------------------- */
// export default async function Page({ params }) {
//   const id = params?.id;
//   const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
//   const data = await res.json();
//   const post = data?.post ?? null;
//   const related = data?.related ?? [];

//   if (!post) {
//     return (
//       <main className="w-full min-h-screen flex items-center justify-center">
//         <div className="p-6 text-center">Post not found.</div>
//       </main>
//     );
//   }

//   // prepare common variables
//   const mediaUrl = toAbsolute(post.media || post.mediaUrl || "");
//   const thumbnail = toAbsolute(post.thumbnail || post.media || post.mediaUrl || `${SITE_ROOT}/og-image.jpg`);
//   const extraImages = Array.isArray(post.extraImages) ? post.extraImages.map(toAbsolute) : [];
//   const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));
//   const isImage = Boolean(post.mediaType?.startsWith("image") || /\.(jpg|jpeg|png|webp|gif)$/i.test(mediaUrl));
//   const pageUrl = `${SITE_ROOT}/post/${post._id}`;
//   const authorName = post.userId?.username || "FondPeace";

//   // build genre list
//   const genreList = [
//     "Trending",
//     "Entertainment",
//     "Social Media",
//     ...(Array.isArray(post.tags) ? post.tags : []),
//     ...(Array.isArray(post.hashtags) ? post.hashtags : []),
//   ].filter(Boolean);
//   const genre = genreList.join(", ");

//   // Main JSON-LD (VideoObject / ImageObject / Article)
//   const jsonLdMain =
//     isVideo
//       ? {
//           "@context": "https://schema.org",
//           "@type": "VideoObject",
//           // url: pageUrl, <-- REMOVED THIS CONFLICTING LINE
//           name: post.title,
//           headline: post.title,
//           description: buildDescription(post),
//           thumbnailUrl: thumbnail,
//           contentUrl: mediaUrl || undefined, // Video URL #1
//           embedUrl: pageUrl, // Explicitly set the player URL to address "not on a watch page"
//           uploadDate: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
//           datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
//           dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
//           publisher: { "@type": "Organization", name: "FondPeace", url: SITE_ROOT, logo: { "@type": "ImageObject", url: `${SITE_ROOT}/logo.png` } },
//           author: { "@type": "Person", name: authorName },
//           creator: { "@type": "Person", name: authorName },
//           interactionStatistic: buildInteractionSchema(post),
//           duration: post.duration ? secToISO(post.duration) : undefined,
//           genre,
//           keywords: extractKeywords(post),
//           inLanguage: "hi-IN",
//           isFamilyFriendly: true,
//           contentRating: "General",
//           potentialAction: { "@type": "WatchAction", target: pageUrl },
//           mainEntityOfPage: pageUrl,
//         }
//       : isImage
//       ? {
//           "@context": "https://schema.org",
//           "@type": "ImageObject",
//           url: pageUrl,
//           name: post.title,
//           headline: post.title,
//           description: buildDescription(post),
//           contentUrl: mediaUrl || undefined,
//           thumbnailUrl: thumbnail,
//           datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
//           dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
//           publisher: { "@type": "Organization", name: "FondPeace", url: SITE_ROOT, logo: { "@type": "ImageObject", url: `${SITE_ROOT}/logo.png` } },
//           author: { "@type": "Person", name: authorName },
//           interactionStatistic: buildInteractionSchema(post),
//           genre,
//           keywords: extractKeywords(post),
//           inLanguage: "hi-IN",
//           isFamilyFriendly: true,
//           contentRating: "General",
//           potentialAction: { "@type": "ReadAction", target: pageUrl },
//           mainEntityOfPage: pageUrl,
//         }
//       : {
//           "@context": "https://schema.org",
//           "@type": "Article",
//           url: pageUrl,
//           name: post.title,
//           headline: post.title,
//           description: buildDescription(post),
//           image: [thumbnail, ...extraImages],
//           datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
//           dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
//           publisher: { "@type": "Organization", name: "FondPeace", url: SITE_ROOT, logo: { "@type": "ImageObject", url: `${SITE_ROOT}/logo.png` } },
//           author: { "@type": "Person", name: authorName },
//           interactionStatistic: buildInteractionSchema(post),
//           genre,
//           keywords: extractKeywords(post),
//           inLanguage: "hi-IN",
//           isFamilyFriendly: true,
//           contentRating: "General",
//           potentialAction: { "@type": "ReadAction", target: pageUrl },
//           mainEntityOfPage: pageUrl,
//         };

//   // Breadcrumb schema
//   const breadcrumbSchema = {
//     "@context": "https://schema.org",
//     "@type": "BreadcrumbList",
//     itemListElement: [
//       { "@type": "ListItem", position: 1, name: "Home", item: SITE_ROOT },
//       { "@type": "ListItem", position: 2, name: "Posts", item: `${SITE_ROOT}/posts` },
//       { "@type": "ListItem", position: 3, name: post.title || "Post", item: pageUrl },
//     ],
//   };

//   // Website + SearchAction
//   const websiteSchema = {
//     "@context": "https://schema.org",
//     "@type": "WebSite",
//     name: "FondPeace",
//     url: SITE_ROOT,
//     potentialAction: {
//       "@type": "SearchAction",
//       target: `${SITE_ROOT}/search?q={search_term_string}`,
//       "query-input": "required name=search_term_string",
//     },
//   };

//   // Speakable (for voice)
//   const speakableSchema = {
//     "@context": "https://schema.org",
//     "@type": "SpeakableSpecification",
//     xpath: [],
//     cssSelector: [".post-title", ".post-description"],
//   };

//   // Organization (full)
//   const organizationSchema = {
//     "@context": "https://schema.org",
//     "@type": "Organization",
//     name: "FondPeace",
//     url: SITE_ROOT,
//     logo: `${SITE_ROOT}/logo.png`,
//     sameAs: [
//       "https://www.facebook.com/fondpeace",
//       "https://www.instagram.com/fondpeace",
//       "https://www.youtube.com/@fondpeace"
//     ],
//   };

//   // Related posts ItemList
//   // const relatedItemList = buildRelatedItemList(related, post._id);

//   return (
//     <main className="w-full min-h-screen bg-gray-50 text-gray-900">
//       {/* JSON-LD scripts (multiple) - best for Google */}
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMain) }} />
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }} />
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
//       {relatedItemList && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedItemList) }} />}

//       <section className="max-w-4xl mx-auto px-4 py-6 md:py-12">
//         <article className="bg-white shadow rounded-2xl overflow-hidden">
//           <div className="p-5 md:p-8">
//             {/* header */}
//             <div className="flex items-center gap-4 mb-4">
//               <img src={`${SITE_ROOT}/og-image.jpg`} alt="FondPeace" className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" />
//               <div>
//                 <div className="font-semibold text-gray-900 text-sm md:text-base">{authorName}</div>
//                 <div className="text-xs text-gray-500">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</div>
//               </div>
//             </div>

//             {/* title */}
//             <h1 className="post-title text-lg md:text-2xl font-bold leading-tight mb-4">{post.title}</h1>

//             {/* media */}
//             <div className="mb-6 post-description">
//               {isVideo && mediaUrl ? (
//                 <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md">
//                   <video src={mediaUrl} poster={thumbnail} controls preload="metadata" className="w-full h-full object-cover rounded-xl" />
//                 </div>
//               ) : mediaUrl ? (
//                 <img src={mediaUrl} alt={post.title} className="w-full rounded-xl object-cover shadow-md" />
//               ) : null}
//             </div>

//             {/* main component */}
//             <SinglePostPage initialPost={post} related={related} />
//           </div>
//         </article>

//         {/* Related posts UI */}
//          {Array.isArray(related) && related.length > 0 && (
//           <aside className="mt-8">
//             <h2 className="text-xl font-semibold mb-4">Related Posts</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {related.map((r) => {
//                 const thumb = toAbsolute(r.thumbnail || r.media || "");
//                 return (
//                   <a key={r._id} href={`/post/${r._1}`} className="block bg-white rounded-lg shadow hover:shadow-lg overflow-hidden">
//                     <div className="w-full h-48 bg-gray-100 overflow-hidden">
//                       <img src={thumb} alt={r.title} className="w-full h-full object-cover" />
//                     </div>
//                     <div className="p-3">
//                       <p className="font-semibold text-gray-900 line-clamp-2 text-sm">{r.title}</p>
//                       <div className="flex items-center gap-3 text-gray-500 text-xs mt-2">
//                         <FaHeart className="text-red-600" /><span>{likesCount(r)}</span>
//                         <span>•</span>
//                         <FaCommentDots /><span>{commentsCount(r)}</span>
//                         <span>•</span>
//                         <FaEye /><span>{viewsCount(r) || 0}</span>
//                       </div>
//                     </div>
//                   </a>
//                 );
//               })} 
//             </div>
//           </aside>
//         )}
//       </section>
//     </main>
//   );
// }







// // app/post/[id]/page.jsx
// import SinglePostPage from "@/components/SinglePostPage";
// import { FaHeart, FaCommentDots, FaEye } from "react-icons/fa";
 
// const API_BASE = "https://backend-k.vercel.app";
// const SITE_ROOT = "https://fondpeace.com";
// const WATCH_ROOT = `${SITE_ROOT}/short`;

// /* --------------------------- Helpers (kept) --------------------------- */
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

// function buildHasPartRelated(related = []) {
//   return (related || []).map((r) => {
//     const url = `${SITE_ROOT}/post/${r._id}`;
//     const media = toAbsolute(r.media || "");
//     const thumb = toAbsolute(r.thumbnail || r.media || "");
//     const Desc = `${r.title || "Trending post"} on FondPeace.com – watch, like, and comment.`;
//     return {
//       "@type": "ImageObject",
//       name: r.title || "",
//       description: Desc,
//       contentUrl: media,
//       url,
//       thumbnailUrl: thumb,
//       uploadDate: new Date(r.createdAt || Date.now()).toISOString(),
//     };
//   });
// }

// function buildRelatedItemList(related = []) {
//   if (!related.length) return null;
//   return {
//     "@context": "https://schema.org",
//     "@type": "ItemList",
//     name: "Related Posts",
//     itemListElement: related.map((r, idx) => ({
//       "@type": "ListItem",
//       position: idx + 1,
//       item: buildHasPartRelated([r])[0],
//     })),
//   };
// }

// function extractKeywords(post) {
//   if (!post) return "FondPeace, social media, trending posts";
//   if (Array.isArray(post.tags) && post.tags.length) {
//     return post.tags.map((t) => t.trim()).filter(Boolean).join(", ");
//   }
//   const title = post.title || "";
//   const stopwords = new Set([
//     "the","and","for","with","this","that","from","your","you","a","an","of","on","in","to","is","by","at","it"
//   ]);
//   const words = title
//     .split(/\s+/)
//     .map((w) => w.replace(/[^\w\u00C0-\u017F-]/g, "").toLowerCase())
//     .filter((w) => w && w.length > 2 && !stopwords.has(w));
//   return (words.slice(0, 12).join(", ") || "FondPeace, social media, trending posts");
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
//     if (!post) return { title: "Post Not Found | FondPeace" };

//     const mediaUrl = toAbsolute(post.media);
//     const thumb = toAbsolute(post.thumbnail || post.media || "");
//     const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));

//     const titleTag = post.title ? `${post.title} | FondPeace` : "Post | FondPeace";
//     const desc = buildDescription(post);
//     const keywords = extractKeywords(post);

//     return {
//       title: titleTag,
//       description: desc,
//       keywords,
//       alternates: { canonical: `${SITE_ROOT}/post/${id}` },

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

      
//       robots: { index: true, follow: true },
//     };
//   } catch (err) {
//     console.error("generateMetadata error", err);
//     return { title: "Post | FondPeace" };
//   }
// }

// /* ---------------------------- Page (server) ----------------------------- */
// export default async function Page({ params }) {
//   const id = params?.id;
//   const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
//   const data = await res.json();
//   const post = data?.post ?? null;
//   const related = data?.related ?? [];

//   if (!post) {
//     return (
//       <main className="w-full min-h-screen flex items-center justify-center">
//         <div className="p-6 text-center">Post not found.</div>
//       </main>
//     );
//   }

//   const mediaUrl = toAbsolute(post.media);
//   const thumbnail = toAbsolute(post.thumbnail || post.media || "");
//   const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));
//   const isImage = Boolean(!isVideo && mediaUrl && (post.mediaType?.startsWith("image") || /\.(jpg|jpeg|png|webp|gif)$/.test(mediaUrl)));

//   const pageUrl = `${SITE_ROOT}/post/${id}`;
//   const publisher = {
//     "@type": "Organization",
//     name: "FondPeace",
//     url: SITE_ROOT,
//   };

//   // --- FINAL JSON-LD LOGIC (SocialMediaPosting host page) ---
//   const jsonLd = {
//     "@context": "https://schema.org",
//     "@type": "Article",
//     url: pageUrl,
//     headline: post.title,
//     articleBody: buildDescription(post),
//     image: [thumbnail],
//     datePublished: new Date(post.createdAt || Date.now()).toISOString(),
//     publisher,
//     interactionStatistic: buildInteractionSchema(post),
//     // If video: link to the dedicated watch page (host page pattern)
//     ...(isVideo && {
//       associatedMedia: {
//         "@type": "VideoObject",
//         url: `${WATCH_ROOT}/${id}`,         // watch page (VideoObject lives there)
//         contentUrl: mediaUrl || undefined, // helpful but optional here
//         thumbnailUrl: thumbnail || undefined,
//         name: post.title,
//         description: buildDescription(post),
//         uploadDate: new Date(post.createdAt || Date.now()).toISOString(),
//         ...(post.duration ? { duration: secToISO(post.duration) } : {}),
//       },
//     }),
//   };
//   // --- end jsonLd ---

//   const relatedItemList = buildRelatedItemList(related);

//   return (
//     <main className="w-full min-h-screen bg-gray-50 text-gray-900">
//       {/* JSON-LD */}
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
//       {relatedItemList && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedItemList) }} />}

//       <section className="max-w-4xl mx-auto px-4 py-6 md:py-12">
//         <article className="bg-white shadow rounded-2xl overflow-hidden">
//           <div className="p-5 md:p-8">
//             {/* header */}
//             <div className="flex items-center gap-4 mb-4">
//               <img src={`${SITE_ROOT}/og-image.jpg`} alt="FondPeace" className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" />
//               <div>
//                 <div className="font-semibold text-gray-900 text-sm md:text-base">{post.userId?.username || "FondPeace"}</div>
//                 <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
//               </div>
//             </div>

//             {/* title */}
//             <h1 className="text-lg md:text-2xl font-bold leading-tight mb-4">{post.title}</h1>

//             {/* media (video or image) — NO CLICK, NO REDIRECT */}
// <div className="mb-6">
//   {isVideo && mediaUrl ? (
//     <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md">
//       <video
//         src={mediaUrl}
//         poster={thumbnail || mediaUrl}
//         controls
//         preload="metadata"
//         className="w-full h-full object-cover rounded-xl"
//       />
//     </div>
//   ) : mediaUrl ? (
//     <img
//       src={mediaUrl}
//       alt={post.title}
//       className="w-full rounded-xl object-cover shadow-md"
//     />
//   ) : null}
// </div>

// <SinglePostPage initialPost={post} related={related} />
 
//           </div>
//         </article>

//         {/* Related posts */}
//         {Array.isArray(related) && related.length > 0 && (
//           <aside className="mt-8">
//             <h2 className="text-xl font-semibold mb-4">Related Posts</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {related.map((r) => {
//                 const thumb = toAbsolute(r.thumbnail || r.media || "");
//                 return (
//                   <a key={r._id} href={`/post/${r._id}`} className="block bg-white rounded-lg shadow hover:shadow-lg overflow-hidden">
//                     <div className="w-full h-48 bg-gray-100 overflow-hidden">
//                       <img src={thumb} alt={r.title} className="w-full h-full object-cover" />
//                     </div>
//                     <div className="p-3">
//                       <p className="font-semibold text-gray-900 line-clamp-2 text-sm">{r.title}</p>
//                       <div className="flex items-center gap-3 text-gray-500 text-xs mt-2">
//                         <FaHeart className="text-red-600" />
//                         <span>{likesCount(r)}</span>
//                         <span>•</span>
//                         <FaCommentDots />
//                         <span>{commentsCount(r)}</span>
//                         <span>•</span>
//                         <FaEye />
//                         <span>{viewsCount(r) || 0}</span>
//                       </div>
//                     </div>
//                   </a>
//                 );
//               })}
//             </div>
//           </aside>
//         )}
//       </section>
//     </main>
//   );
// }










// // app/post/[id]/page.jsx - UPDATED FOR VIDEO HOST PAGE PATTERN
// import SinglePostPage from "@/components/SinglePostPage";
// import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaEye } from "react-icons/fa";

// const API_BASE = "https://backend-k.vercel.app"; // set your API
// const SITE_ROOT = "https://fondpeace.com"; // set your site root
// const WATCH_ROOT = `${SITE_ROOT}/short`; // New Watch Page root

// /* --------------------------- Helpers (unchanged) --------------------------- */

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

// /* counts derived exactly from your schema */
// function likesCount(post) {
//   return Array.isArray(post?.likes) ? post.likes.length : 0;
// }
// function commentsCount(post) {
//   return Array.isArray(post?.comments) ? post.comments.length : 0;
// }
// function viewsCount(post) {
//   return typeof post?.views === "number" ? post.views : 0;
// }

// /* structured data helpers (unchanged) */
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

//  function buildHasPartRelated(related = []) {
//   return (related || []).map(r => {
//     const url = `${SITE_ROOT}/post/${r._id}`;
//     const media = toAbsolute(r.media || "");
//     const thumb = toAbsolute(r.thumbnail || r.media || "");
//     const Desc = `${r.title || "Trending post"} on FondPeace.com – watch the latest updates, like, comment, and share with your friends. Discover trending content, join the conversation, and stay up to date with what’s popular today!`

//     // IMPORTANT: Related items always use ImageObject, even if media is a video
//     return {
//       "@type": "ImageObject",
//       name: r.title || "",
//       description: Desc,
//       contentUrl: media,
//       url,
//       thumbnailUrl: thumb,
//       uploadDate: new Date(r.createdAt || Date.now()).toISOString(),
//     };
//   });
// }


//  function buildRelatedItemList(related = []) {
//   if (!related.length) return null;
//   return {
//     "@context": "https://schema.org",
//     "@type": "ItemList",
//     name: "Related Posts",
//     itemListElement: related.map((r, idx) => ({
//       "@type": "ListItem",
//       position: idx + 1,
//       item: buildHasPartRelated([r])[0],
//     })),
//   };
// }


// /* keywords and description helpers (unchanged) */
// function extractKeywords(post) {
//   if (!post) return "FondPeace, social media, trending posts";
//   if (Array.isArray(post.tags) && post.tags.length) {
//     return post.tags.map((t) => t.trim()).filter(Boolean).join(", ");
//   }
//   const title = post.title || "";
//   const stopwords = new Set([
//     "the","and","for","with","this","that","from","your","you","a","an","of","on","in","to","is","by","at","it"
//   ]);
//   const words = title
//     .split(/\s+/)
//     .map((w) => w.replace(/[^\w\u00C0-\u017F-]/g, "").toLowerCase())
//     .filter((w) => w && w.length > 2 && !stopwords.has(w));
//   return (words.slice(0, 12).join(", ") || "FondPeace, social media, trending posts");
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
//     const related = data?.related ?? [];

//     if (!post) return { title: "Post Not Found | FondPeace" };

//     const mediaUrl = toAbsolute(post.media);
//     const thumb = toAbsolute(post.thumbnail || post.media || "");
//     const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));

//     const titleTag = post.title ? `${post.title} | FondPeace` : "Post | FondPeace";
//     const desc = buildDescription(post);
//     const keywords = extractKeywords(post);

//     return {
//       title: titleTag,
//       description: desc,
//       keywords,
//       // Canonical stays /post/[id] for organic ranking purposes
//       alternates: { canonical: `${SITE_ROOT}/post/${id}` },
//       openGraph: {
//         title: titleTag,
//         description: desc,
//         url: `${SITE_ROOT}/post/${id}`,
//         type: isVideo ? "video.other" : "article",
//         images: [{ url: thumb }],
//       },
//       robots: { index: true, follow: true },
//     };
//   } catch (err) {
//     console.error("generateMetadata error", err);
//     return { title: "Post | FondPeace" };
//   }
// }

// /* ---------------------------- Page ----------------------------- */

// export default async function Page({ params }) {
//   const id = params?.id;
//   const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
//   const data = await res.json();
//   const post = data?.post ?? null;
//   const related = data?.related ?? [];

//   if (!post) {
//     return (
//       <main className="w-full min-h-screen flex items-center justify-center">
//         <div className="p-6 text-center">Post not found.</div>
//       </main>
//     );
//   }

//   const mediaUrl = toAbsolute(post.media);
//   const thumbnail = toAbsolute(post.thumbnail || post.media || "");

//   const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));
//   const isImage = Boolean(!isVideo && mediaUrl && (post.mediaType?.startsWith("image") || /\.(jpg|jpeg|png|webp|gif)$/.test(mediaUrl)));

//   // Define common properties for structured data
//   const pageUrl = `${SITE_ROOT}/post/${id}`;
//   const publisher = {
//     "@type": "Organization",
//     name: "FondPeace",
//     url: SITE_ROOT,
//   };

//   // --- FINAL JSON-LD LOGIC ---
//   // If it's a video, use Article schema and point to the /watch page for video indexing.
//   const jsonLd = isVideo
//     ? {
//         "@context": "https://schema.org",
//         "@type": "Article", 
//         url: pageUrl, 
//         headline: post.title,
//         description: buildDescription(post),
//         image: [thumbnail], // Use image property for Article schema
//         datePublished: new Date(post.createdAt || Date.now()).toISOString(),
//         publisher: publisher,
//         interactionStatistic: buildInteractionSchema(post),
//         // OPTIONAL: Host Page Pattern uses this to link to the dedicated video page
//         associatedMedia: {
//             "@type": "VideoObject",
//             url: `${WATCH_ROOT}/${id}`,
//             name: post.title,
//         }
//       }
//     : isImage
//     ? {
//         "@context": "https://schema.org",
//         "@type": "ImageObject",
//         url: pageUrl,
//         name: post.title,
//         description: buildDescription(post),
//         contentUrl: mediaUrl,
//         thumbnailUrl: [thumbnail],
//         datePublished: new Date(post.createdAt || Date.now()).toISOString(),
//         publisher: publisher,
//         interactionStatistic: buildInteractionSchema(post),
//       }
//     : {
//         "@context": "https://schema.org",
//         "@type": "Article",
//         url: pageUrl,
//         headline: post.title,
//         description: buildDescription(post),
//         image: [thumbnail],
//         datePublished: new Date(post.createdAt || Date.now()).toISOString(),
//         publisher: publisher,
//         interactionStatistic: buildInteractionSchema(post),
//       };
//   // --- END FINAL JSON-LD LOGIC ---

//   const relatedItemList = buildRelatedItemList(related);

//   return (
//     <main className="w-full min-h-screen bg-gray-50 text-gray-900">
//       {/* JSON-LD */}
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
//       {relatedItemList && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedItemList) }} />}

//       <section className="container mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-12">
//         <article className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
//           <div className="p-5 sm:p-6 md:p-8">
            
//             {/* header */}
//             <div className="flex items-center gap-4 mb-5">
//               <img 
//                 src={`${SITE_ROOT}/og-image.jpg`} 
//                 alt="FondPeace" 
//                 className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200"
//               />
//               <div>
//                 <div className="font-semibold text-gray-900 text-sm sm:text-base">{post.userId?.username || "FondPeace"}</div>
//                 <div className="text-xs sm:text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
//               </div>
//             </div>

//             {/* title */}
//             <h1 className="text-lg sm:text-2xl md:text-3xl font-bold leading-snug mb-6">{post.title}</h1>

//             {/* media */}
//             <div className="mb-6">
//               {isVideo && mediaUrl ? (
//                 <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md">
//                   <video 
//                     controls 
//                     preload="metadata" 
//                     poster={thumbnail || undefined} 
//                     className="w-full h-full object-cover rounded-xl"
//                     playsInline
//                   >
//                     <source src={mediaUrl} type="video/mp4" />
//                     Your browser does not support the video tag.
//                   </video>
//                 </div>
//               ) : mediaUrl ? (
//                 <img src={mediaUrl} alt={post.title} className="w-full rounded-xl object-cover shadow-md" />
//               ) : null}
//             </div>

//             <SinglePostPage initialPost={post} related={related} />
//           </div>
//         </article>


//         {/* Related posts - Finalized to use Images only */}
//         {Array.isArray(related) && related.length > 0 && (
//           <aside className="max-w-4xl mx-auto mt-10">
//             <h2 className="text-xl sm:text-2xl font-semibold mb-5">Related Posts</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {related.map((r) => {
//                 const rMedia = toAbsolute(r.media || "");
//                 const thumb = toAbsolute(r.thumbnail || r.media || "");
//                 // rIsVideo check is no longer used for rendering, ensuring <img> is always used

//                 return (
//                   <a
//                     key={r._id}
//                     href={`/post/${r._id}`}
//                     className="block bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-xl transition duration-300 ease-in-out"
//                   >
//                     <div className="w-full h-56 sm:h-64 md:h-56 lg:h-48 bg-gray-100 overflow-hidden">
//                       <img src={thumb || rMedia} alt={r.title} className="w-full h-full object-cover" />
//                     </div>
//                     <div className="p-4">
//                       <p className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base">{r.title}</p>
//                       <div className="flex items-center gap-3 text-gray-500 text-xs sm:text-sm mt-2">
//                         <FaHeart className="text-red-600" />
//                         <span>{likesCount(r)}</span>
//                         <span>•</span>
//                         <FaCommentDots />
//                         <span>{commentsCount(r)}</span>
//                         <span>•</span>
//                         <FaEye />
//                         <span>{viewsCount(r) || 0}</span>
//                       </div>
//                     </div>
//                   </a>
//                 );
//               })}
//             </div>
//           </aside>
//         )}
        
//       </section>
//     </main>
//   );
// }








// // // app/post/[id]/page.jsx
// // import SinglePostPage from "@/components/SinglePostPage";
// // import { FaHeart, FaRegHeart, FaCommentDots, FaShareAlt, FaEye } from "react-icons/fa";

// // const API_BASE = "https://backend-k.vercel.app"; // set your API
// // const SITE_ROOT = "https://fondpeace.com"; // set your site root

// // /* --------------------------- Helpers --------------------------- */

// // function toAbsolute(url) {
// //   if (!url) return null;
// //   if (url.startsWith("http")) return url;
// //   if (url.startsWith("/")) return `${SITE_ROOT}${url}`;
// //   return `${SITE_ROOT}/${url}`;
// // }

// // function secToISO(sec) {
// //   if (sec == null) return undefined;
// //   const s = Number(sec);
// //   if (!s || isNaN(s)) return undefined;
// //   const h = Math.floor(s / 3600);
// //   const m = Math.floor((s % 3600) / 60);
// //   const sLeft = s % 60;
// //   let iso = "PT";
// //   if (h) iso += `${h}H`;
// //   if (m) iso += `${m}M`;
// //   if (sLeft || (!h && !m)) iso += `${sLeft}S`;
// //   return iso;
// // }

// // /* counts derived exactly from your schema */
// // function likesCount(post) {
// //   return Array.isArray(post?.likes) ? post.likes.length : 0;
// // }
// // function commentsCount(post) {
// //   return Array.isArray(post?.comments) ? post.comments.length : 0;
// // }
// // function viewsCount(post) {
// //   return typeof post?.views === "number" ? post.views : 0;
// // }

// // /* structured data helpers */
// // function buildInteractionSchema(post) {
// //   return [
// //     {
// //       "@type": "InteractionCounter",
// //       interactionType: { "@type": "LikeAction" },
// //       userInteractionCount: likesCount(post),
// //     },
// //     {
// //       "@type": "InteractionCounter",
// //       interactionType: { "@type": "CommentAction" },
// //       userInteractionCount: commentsCount(post),
// //     },
// //     {
// //       "@type": "InteractionCounter",
// //       interactionType: { "@type": "WatchAction" },
// //       userInteractionCount: viewsCount(post),
// //     },
// //   ];
// // }

// //  function buildHasPartRelated(related = []) {
// //   return (related || []).map(r => {
// //     const url = `${SITE_ROOT}/post/${r._id}`;
// //     const media = toAbsolute(r.media || "");
// //     const thumb = toAbsolute(r.thumbnail || r.media || "");
// //     const Desc = `${r.title || "Trending post"} on FondPeace.com – watch the latest updates, like, comment, and share with your friends. Discover trending content, join the conversation, and stay up to date with what’s popular today!`

// //     if (r.mediaType?.startsWith("video") || media.endsWith(".mp4")) {
// //       return {
// //         "@type": "VideoObject",
// //         name: r.title || "",
// //         description: Desc,

// //         contentUrl: media,
// //         url,
// //         thumbnailUrl: thumb,
// //         uploadDate: new Date(r.createdAt || Date.now()).toISOString(),
// //       };
// //     } else {
// //       return {
// //         "@type": "ImageObject",
// //         name: r.title || "",
// //         description: Desc,
// //         contentUrl: media,
// //         url,
// //         thumbnailUrl: thumb,
// //         uploadDate: new Date(r.createdAt || Date.now()).toISOString(),
// //       };
// //     }
// //   });
// // }


// //  function buildRelatedItemList(related = []) {
// //   if (!related.length) return null;
// //   return {
// //     "@context": "https://schema.org",
// //     "@type": "ItemList",
// //     name: "Related Posts",
// //     itemListElement: related.map((r, idx) => ({
// //       "@type": "ListItem",
// //       position: idx + 1,
// //       item: buildHasPartRelated([r])[0],
// //     })),
// //   };
// // }


// // /* keywords and description helpers */
// // function extractKeywords(post) {
// //   if (!post) return "FondPeace, social media, trending posts";
// //   if (Array.isArray(post.tags) && post.tags.length) {
// //     return post.tags.map((t) => t.trim()).filter(Boolean).join(", ");
// //   }
// //   const title = post.title || "";
// //   const stopwords = new Set([
// //     "the","and","for","with","this","that","from","your","you","a","an","of","on","in","to","is","by","at","it"
// //   ]);
// //   const words = title
// //     .split(/\s+/)
// //     .map((w) => w.replace(/[^\w\u00C0-\u017F-]/g, "").toLowerCase())
// //     .filter((w) => w && w.length > 2 && !stopwords.has(w));
// //   return (words.slice(0, 12).join(", ") || "FondPeace, social media, trending posts");
// // }

// // function buildDescription(post) {
// //   const title = post?.title || "";
// //   const author = post?.userId?.username;
// //   if (title && author) return `${title} uploaded by ${author}. Watch, like, and comment on FondPeace.`;
// //   if (title) return title;
// //   return "Discover trending posts and videos on FondPeace.";
// // }

// // /* ------------------------- Next metadata ------------------------ */

// // export async function generateMetadata({ params }) {
// //   const id = params?.id;
// //   try {
// //     const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
// //     const data = await res.json();
// //     const post = data?.post ?? null;
// //     const related = data?.related ?? [];

// //     if (!post) return { title: "Post Not Found | FondPeace" };

// //     const mediaUrl = toAbsolute(post.media);
// //     const thumb = toAbsolute(post.thumbnail || post.media || "");
// //     const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));

// //     const titleTag = post.title ? `${post.title} | FondPeace` : "Post | FondPeace";
// //     const desc = buildDescription(post);
// //     const keywords = extractKeywords(post);

// //     return {
// //       title: titleTag,
// //       description: desc,
// //       keywords,
// //       alternates: { canonical: `${SITE_ROOT}/post/${id}` },
// //       openGraph: {
// //         title: titleTag,
// //         description: desc,
// //         url: `${SITE_ROOT}/post/${id}`,
// //         type: isVideo ? "video.other" : "article",
// //         images: [{ url: thumb }],
// //       },
// //       robots: { index: true, follow: true },
// //     };
// //   } catch (err) {
// //     console.error("generateMetadata error", err);
// //     return { title: "Post | FondPeace" };
// //   }
// // }

// // /* ---------------------------- Page ----------------------------- */

// // export default async function Page({ params }) {
// //   const id = params?.id;
// //   const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
// //   const data = await res.json();
// //   const post = data?.post ?? null;
// //   const related = data?.related ?? [];

// //   if (!post) {
// //     return (
// //       <main className="w-full min-h-screen flex items-center justify-center">
// //         <div className="p-6 text-center">Post not found.</div>
// //       </main>
// //     );
// //   }

// //   const mediaUrl = toAbsolute(post.media);
// //   const thumbnail = toAbsolute(post.thumbnail || post.media || "");

// //   const isVideo = Boolean(post.mediaType?.startsWith("video") || (mediaUrl && mediaUrl.endsWith(".mp4")));
// //   const isImage = Boolean(!isVideo && mediaUrl && (post.mediaType?.startsWith("image") || /\.(jpg|jpeg|png|webp|gif)$/.test(mediaUrl)));

// //   // Define common properties for structured data
// //   const pageUrl = `${SITE_ROOT}/post/${id}`;
// //   const publisher = {
// //     "@type": "Organization",
// //     name: "FondPeace",
// //     url: SITE_ROOT,
// //   };

// //   const jsonLd = isVideo
// //     ? {
// //         "@context": "https://schema.org",
// //         "@type": "VideoObject",
// //         url: pageUrl, 
// //         name: post.title,
// //         description: buildDescription(post),
// //         thumbnailUrl: [thumbnail],
// //         contentUrl: mediaUrl,
// //         embedUrl: mediaUrl,
// //         uploadDate: new Date(post.createdAt || Date.now()).toISOString(),
// //         ...(post.duration ? { duration: secToISO(post.duration) } : {}),
// //         publisher: publisher,
// //         interactionStatistic: buildInteractionSchema(post),
// //       }
// //     : isImage
// //     ? {
// //         "@context": "https://schema.org",
// //         "@type": "ImageObject",
// //         url: pageUrl,
// //         name: post.title,
// //         description: buildDescription(post),
// //         contentUrl: mediaUrl,
// //         thumbnailUrl: [thumbnail],
// //         datePublished: new Date(post.createdAt || Date.now()).toISOString(),
// //         publisher: publisher,
// //         interactionStatistic: buildInteractionSchema(post),
// //       }
// //     : {
// //         "@context": "https://schema.org",
// //         "@type": "Article",
// //         url: pageUrl,
// //         headline: post.title,
// //         description: buildDescription(post),
// //         image: [thumbnail],
// //         datePublished: new Date(post.createdAt || Date.now()).toISOString(),
// //         publisher: publisher,
// //         interactionStatistic: buildInteractionSchema(post),
// //       };

// //   const relatedItemList = buildRelatedItemList(related);

// //   // ✅ FIX: Added return here
// //   return (
// //     <main className="w-full min-h-screen bg-gray-50 text-gray-900">
// //       {/* JSON-LD */}
// //       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
// //       {relatedItemList && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedItemList) }} />}

// //       <section className="container mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-12">
// //         <article className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
// //           <div className="p-5 sm:p-6 md:p-8">
            
// //             {/* header */}
// //             <div className="flex items-center gap-4 mb-5">
// //               <img 
// //                 src={`${SITE_ROOT}/og-image.jpg`} 
// //                 alt="FondPeace" 
// //                 className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200"
// //               />
// //               <div>
// //                 <div className="font-semibold text-gray-900 text-sm sm:text-base">{post.userId?.username || "FondPeace"}</div>
// //                 <div className="text-xs sm:text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
// //               </div>
// //             </div>

// //             {/* title */}
// //             <h1 className="text-lg sm:text-2xl md:text-3xl font-bold leading-snug mb-6">{post.title}</h1>

// //             {/* media */}
// //             <div className="mb-6">
// //               {isVideo && mediaUrl ? (
// //                 <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md">
// //                   <video 
// //                     controls 
// //                     preload="metadata" 
// //                     poster={thumbnail || undefined} 
// //                     className="w-full h-full object-cover rounded-xl"
// //                     playsInline
// //                   >
// //                     <source src={mediaUrl} type="video/mp4" />
// //                     Your browser does not support the video tag.
// //                   </video>
// //                 </div>
// //               ) : mediaUrl ? (
// //                 <img src={mediaUrl} alt={post.title} className="w-full rounded-xl object-cover shadow-md" />
// //               ) : null}
// //             </div>

// //             <SinglePostPage initialPost={post} related={related} />
// //           </div>
// //         </article>


// //         {/* Related posts - IMPORTANT: use images only (no <video>) so Google doesn't detect multiple videos */}
// //         {Array.isArray(related) && related.length > 0 && (
// //           <aside className="max-w-4xl mx-auto mt-10">
// //             <h2 className="text-xl sm:text-2xl font-semibold mb-5">Related Posts</h2>
// //             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// //               {related.map((r) => {
// //                 const rMedia = toAbsolute(r.media || "");
// //                 const thumb = toAbsolute(r.thumbnail || r.media || "");
// //                 return (
// //                   <a
// //                     key={r._id}
// //                     href={`/post/${r._id}`}
// //                     className="block bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-xl transition duration-300 ease-in-out"
// //                   >
// //                     {/* Use thumbnail image only to avoid extra video tags */}
// //                     <div className="w-full h-56 sm:h-64 md:h-56 lg:h-48 bg-gray-100 overflow-hidden">
// //                       <img src={thumb || rMedia} alt={r.title} className="w-full h-full object-cover" />
// //                     </div>
// //                     <div className="p-4">
// //                       <p className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base">{r.title}</p>
// //                       <div className="flex items-center gap-3 text-gray-500 text-xs sm:text-sm mt-2">
// //                         <FaHeart className="text-red-600" />
// //                         <span>{likesCount(r)}</span>
// //                         <span>•</span>
// //                         <FaCommentDots />
// //                         <span>{commentsCount(r)}</span>
// //                         <span>•</span>
// //                         <FaEye />
// //                         <span>{viewsCount(r) || 0}</span>
// //                       </div>
// //                     </div>
// //                   </a>
// //                 );
// //               })}
// //             </div>
// //           </aside>
// //         )}
        
// //       </section>
// //     </main>
// //   );
// // }





















































































