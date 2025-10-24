/*
// app/post/[id]/page.jsx
import SinglePostPage from "@/components/SinglePostPage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://backend-k.vercel.app";

/** Helper: safely shorten text for SERP display 
function truncate(text = "", max = 60) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1).trim() + "…" : text;
}

/** Normalize OpenGraph image (preferred OG size 1200x630) 
function ogImage(post) {
  return post.thumbnail || post.media || "https://www.fondpeace.com/Fondpeace.jpg";
}

/** Build unique @id for schema objects 
function schemaId(seoUrl, type) {
  return `${seoUrl}#${type}`;
}

export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch post");

    const post = await res.json();

    // Basic fields & fallbacks
    const fullTitle = (post.title || "Untitled Post").trim();
    const serptitle = truncate(fullTitle, 60);
    const metaTitle = `${serptitle} - FondPeace`; // brand-last recommended
    const seoDesc =
      post.title && post.userId?.username
        ? `${post.title} uploaded by ${post.userId.username}. Watch, like, and comment on FondPeace.`
        : "Discover trending posts, videos, and updates on FondPeace.";
    const seoImage = ogImage(post);
    const seoUrl = `https://fondpeace.com/post/${id}`;
    const publishedTime = post.createdAt || new Date().toISOString();
    const modifiedTime = post.updatedAt || publishedTime;
    const authorName = post.userId?.username || post.author || "FondPeace Creator";

    // Detect media type: video or image (default to image)
    const isVideo = !!post.mediaType && post.mediaType.startsWith("video");
    const mediaUrl = post.media || null;
    const mediaType = post.mediaType || (isVideo ? "video/mp4" : "image/jpeg");

    // Keywords (note: Google ignores meta keywords, but other engines use it)
    const seoKeywords = post.tags?.length
      ? post.tags.join(", ")
      : post.title
      ? post.title.split(" ").join(", ")
      : "Fondpeace, social media, trending posts, latest updates";

    // Interaction stats fallbacks
    const viewCount = Number(post.views || 0);
    const likeCount = Number(post.likes || 0);

    // JSON-LD schema (single object). Add @id and mainEntityOfPage for clarity.
    let jsonLd = {
      "@context": "https://schema.org",
      "@id": schemaId(seoUrl, isVideo ? "video" : "image"),
      "mainEntityOfPage": { "@type": "WebPage", "@id": seoUrl },
      "publisher": {
        "@type": "Organization",
        "name": "FondPeace",
        "logo": {
          "@type": "ImageObject",
          "url": "https://fondpeace.com/Fondpeace.jpg"
        }
      },
      "author": { "@type": "Person", "name": authorName },
      "isAccessibleForFree": true
    };

    if (isVideo) {
      jsonLd = {
        ...jsonLd,
        "@type": "VideoObject",
        "name": fullTitle,
        "description": seoDesc,
        "thumbnailUrl": [seoImage],
        "uploadDate": publishedTime,
        "dateModified": modifiedTime,
        "contentUrl": mediaUrl || "",
        "embedUrl": seoUrl,
        "duration": post.duration || "PT2M",
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": { "@type": "WatchAction" },
          "userInteractionCount": viewCount || 0
        },
        "isAccessibleForFree": true,
        "availability": "https://schema.org/InStock",
        "potentialAction": {
          "@type": "WatchAction",
          "target": [seoUrl]
        },
        "discussionUrl": `${seoUrl}#comments`
      };
    } else {
      // ImageObject
      jsonLd = {
        ...jsonLd,
        "@type": "ImageObject",
        "name": fullTitle,
        "description": seoDesc,
        "contentUrl": mediaUrl || seoImage,
        "thumbnailUrl": [seoImage],
        "uploadDate": publishedTime,
        "dateModified": modifiedTime,
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": { "@type": "LikeAction" },
          "userInteractionCount": likeCount || 0
        },
        "isAccessibleForFree": true,
        "discussionUrl": `${seoUrl}#comments`
      };
    }

    // Robots meta (explicit)
    const robots = {
      index: true,
      follow: true,
      nocache: false,
      // allow large previews of images & videos which helps Discover:
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1
    };

    // Build metadata object returned by Next.js App Router
    return {
      title: metaTitle,
      description: seoDesc,
      keywords: seoKeywords,
      alternates: { canonical: seoUrl },
      robots,
      openGraph: {
        title: fullTitle,
        description: seoDesc,
        url: seoUrl,
        siteName: "FondPeace",
        type: isVideo ? "video.other" : "website",
        publishedTime,
        modifiedTime,
        images: [
          {
            url: seoImage,
            width: 1200,
            height: 630,
            alt: fullTitle
          }
        ],
        ...(isVideo
          ? {
              videos: [
                {
                  url: mediaUrl,
                  secureUrl: mediaUrl,
                  type: mediaType,
                  width: post.videoWidth || 1280,
                  height: post.videoHeight || 720
                }
              ]
            }
          : {})
      },
      twitter: {
        card: "summary_large_image",
        title: fullTitle,
        description: seoDesc,
        site: "@FondPeace",
        creator: `@${authorName.replace(/\s+/g, "")}`,
        images: [seoImage]
      },
      other: {
        // single clean JSON-LD string (no duplicates)
        "script:ld+json": JSON.stringify(jsonLd)
      }
    };
  } catch (err) {
    console.error("generateMetadata error:", err);
    return {
      title: "Post Not Found - FondPeace",
      description: "The requested post could not be loaded.",
      alternates: { canonical: "https://fondpeace.com/post" },
      robots: { index: false, follow: true }
    };
  }
}

export default async function Page({ params }) {
  const { id } = params;

  try {
    const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load post");

    const post = await res.json();
    return <SinglePostPage post={post} />;
  } catch (err) {
    console.error("Page load error:", err);
    return (
      <div className="p-8 text-center text-gray-600">
        <h2 className="text-xl font-semibold">Post Not Found</h2>
        <p className="mt-2">Sorry, we couldn’t load this content. Please try again later.</p>
      </div>
    );
  }
}






*/



// app/post/[id]/page.jsx
import SinglePostPage from "@/components/SinglePostPage";

export async function generateMetadata({ params }) {
  const { id } = params;
  const API_BASE = "https://backend-k.vercel.app";

  try {
    const res = await fetch(`${API_BASE}/post/single/${id}`, { cache: "no-store" });
    const post = await res.json();

    // ✅ Core SEO values
    const seoTitle = post.title ? `${post.title} | FondPeace` : "Post | FondPeace";
    const seoDesc =
      post.title && post.userId?.username
        ? `${post.title} uploaded by ${post.userId.username}. Watch, like, and comment on FondPeace.`
        : "Discover trending posts, videos, and updates on FondPeace.";
    const seoImage = post.thumbnail || post.media || "https://fondpeace.com/default.jpg";
    const seoUrl = `https://fondpeace.com/post/${id}`;
    const seoKeywords = post.tags?.length
      ? post.tags.join(", ")
      : post.title
      ? post.title.split(" ").join(", ")
      : "Fondpeace, social media, trending posts, latest updates";

    // ✅ Timestamps & author
    const publishedTime = post.createdAt || new Date().toISOString();
    const modifiedTime = post.updatedAt || publishedTime;
    const authorName = post.userId?.username || "FondPeace";

    // ✅ JSON-LD Schema (Rich Snippets)
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": post.mediaType?.startsWith("video") ? "VideoObject" : "Article",
      headline: seoTitle,
      description: seoDesc,
      image: [seoImage],
      datePublished: publishedTime,
      dateModified: modifiedTime,
      author: {
        "@type": "Person",
        name: authorName,
      },
      publisher: {
        "@type": "Organization",
        name: "FondPeace",
        logo: {
          "@type": "ImageObject",
          url: "https://fondpeace.com/Fondpeace.jpg",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": seoUrl,
      },
      ...(post.mediaType?.startsWith("video") && {
        contentUrl: post.media,
        embedUrl: seoUrl,
        thumbnailUrl: seoImage,
        uploadDate: publishedTime,
      }),
    };

    // ✅ Return metadata
    return {
      title: seoTitle,
      description: seoDesc,
      keywords: seoKeywords,
      alternates: { canonical: seoUrl },
      openGraph: {
        title: seoTitle,
        description: seoDesc,
        url: seoUrl,
        siteName: "FondPeace",
        type: post.mediaType?.startsWith("video") ? "video.other" : "article",
        publishedTime,
        modifiedTime,
        images: [
          {
            url: seoImage,
            width: 1200,
            height: 630,
            alt: seoTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@Fondpeace",
        creator: authorName,
        title: seoTitle,
        description: seoDesc,
        images: [seoImage],
      },
      other: {
        "article:author": authorName,
        "article:published_time": publishedTime,
        "article:modified_time": modifiedTime,
        "script:ld+json": JSON.stringify(jsonLd),
      },
    };
  } catch {
    return {
      title: "Post Not Found | FondPeace",
      description: "Error loading post.",
      alternates: { canonical: "https://fondpeace.com/post" },
    };
  }
}

export default async function Page({ params }) {
  const { id } = params;
  const res = await fetch(`https://backend-k.vercel.app/post/single/${id}`, {
    cache: "no-store",
  });
  const post = await res.json();

  return (
    <main className="w-full min-h-screen bg-white text-gray-900">
      {/* ✅ Responsive SEO header */}
      <header className="w-full md:m-2 flex justify-evenly items-center py-3 border-b border-gray-200 bg-white shadow-sm">
        <div>
          <h1 className="font-bold text-lg md:text-xl">
            <strong>
              <a
                href="https://www.fondpeace.com/"
                className="text-blue-600 hover:text-blue-700 transition-colors"
                aria-label="Fondpeace Homepage"
              >
                Fondpeace
              </a>
            </strong>
          </h1>
        </div>
      </header>

      {/* ✅ Post content */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <SinglePostPage post={post} />
      </section>
    </main>
  );
}









/*

"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import jwt from "jsonwebtoken";

export default function SinglePostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [comment, setComment] = useState("");
  const videoRef = useRef(null);

  const API_BASE = "https://backend-k.vercel.app";

  // 🔹 Fetch logged in user from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.UserId) {
          setUserId(decoded.UserId);
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  // 🔹 Fetch single post
  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/post/single/${id}`);
        setPost(data);
      } catch (err) {
        console.error("Failed to load post", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // 🔹 Like/Dislike a post
  const handleLikePost = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to like");

    try {
      const res = await axios.post(
        `${API_BASE}/post/like/${post._id}`,
        {},
        { headers: { "x-auth-token": token } }
      );
      setPost(res.data);
    } catch {
      alert("Failed to toggle like");
    }
  };

  // 🔹 Add a comment
  const handleComment = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userId) return alert("Not authenticated");
    if (!comment.trim()) return alert("Comment cannot be empty");

    try {
      const res = await axios.post(
        `${API_BASE}/post/comment/${post._id}`,
        { CommentText: comment, userId },
        { headers: { "x-auth-token": token } }
      );
      setComment("");
      setPost((prev) => ({ ...prev, comments: res.data.comments }));
    } catch {
      alert("Failed to post comment");
    }
  };

  // 🔹 Prevent right-click (images & videos)
  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);
    return () => document.removeEventListener("contextmenu", disableRightClick);
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!post) return <div className="p-6 text-center">Post not found</div>;

  const isVideo = post.mediaType?.startsWith("video");
  const hasLiked = post.likes?.some((id) => id.toString() === userId?.toString());

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-4">
        //* User Info 
        <div className="flex items-center gap-3 mb-4">
          <img
            src={"https://www.fondpeace.com/og-image.jpg"}
            alt="profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <span className="font-semibold text-gray-900">
            {post.userId?.username || "Unknown"}
          </span>
        </div>

        //* Post Title 
        <p className="text-gray-800 mb-4">{post.title}</p>

        //* Media 
        {post.media && (
          <>
            {isVideo ? (
              <video
                ref={videoRef}
                src={post.media}
                controls
                controlsList="nodownload noremoteplayback noplaybackrate"
                className="w-full max-w-[600px] aspect-square rounded-lg mb-4 object-cover shadow-md mx-auto"
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <img
                src={post.media}
                alt="media"
                className="w-full max-w-[600px] aspect-square rounded-lg mb-4 object-cover shadow-md mx-auto"
                onContextMenu={(e) => e.preventDefault()}
              />
            )}
          </>
        )}

        //* Likes & Comments Actions 
        <div className="flex justify-between items-center mb-4 text-gray-600">
          <button
            onClick={handleLikePost}
            className={`text-sm font-medium ${
              hasLiked ? "text-red-600" : "text-gray-600"
            }`}
          >
            {hasLiked ? "💔 Dislike" : "❤️ Like"} ({post.likes?.length || 0})
          </button>
          <span className="text-sm">
            💬 {post.comments?.length || 0} Comments
          </span>
        </div>

        //* Add Comment 
        <div className="mt-4">
          <input
            type="text"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleComment}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
          >
            Post Comment
          </button>
        </div>

        //* Show Comments *
        <div className="mt-4 space-y-2">
          {post.comments?.map((cmt, i) => (
            <div key={i} className="bg-gray-100 p-3 rounded-md">
              <p className="font-semibold text-gray-800">
                {cmt.userId?.username || "User"}
              </p>
              <p className="text-gray-700">{cmt.CommentText}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
        }

*/









