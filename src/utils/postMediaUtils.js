// src/utils/postMediaUtils.js

// Universal YouTube URL regex matching watch, shorts, live, embed, youtu.be, and ytimg CDN
export const YOUTUBE_REGEX =
  /(?:(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|vi)\/|.*[?&]v=|shorts\/|live\/))|(?:youtu\.be\/)|(?:ytimg\.com\/vi\/))([^"&?\/\s]{11})/i;

// Common video file extensions (handling optional query string parameters like ?alt=media)
export const VIDEO_EXT_REGEX = /\.(mp4|webm|mov|m4v|m3u8)(\?.*)?$/i;

/**
 * Extracts an 11-character YouTube video ID from a post or any string/object.
 */
export function extractPostYouTubeId(item) {
  if (!item) return null;
  if (typeof item === "string") {
    const match = item.match(YOUTUBE_REGEX);
    return match && match[1] ? match[1] : null;
  }
  if (item.youtubeId && typeof item.youtubeId === "string" && item.youtubeId.trim().length === 11) {
    return item.youtubeId.trim();
  }
  const candidates = [
    item.media,
    item.mediaUrl,
    item.link,
    item.linkPreview?.url,
    item.thumbnail,
    item.title,
    item.content,
    item.description,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) {
      const match = c.match(YOUTUBE_REGEX);
      if (match && match[1]) return match[1];
    }
  }
  return null;
}

/**
 * Checks whether a post is a playable short/video (native video or YouTube video link post).
 * Non-video link posts (articles, news), photo posts, and discussions return false.
 */
export function isPlayableShortPost(post) {
  if (!post) return false;
  if (post.isYouTubeShort) return true;
  if (post.mediaType?.startsWith("video") || post.mtype?.startsWith("video")) return true;
  if (Boolean(extractPostYouTubeId(post))) return true;

  const mediaCandidates = [post.media, post.mediaUrl, post.link, post.linkPreview?.url];
  for (const m of mediaCandidates) {
    if (typeof m === "string" && m.trim()) {
      const clean = m.trim();
      if (VIDEO_EXT_REGEX.test(clean) || clean.includes("/video/")) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Returns canonical route path for a post: 'shorts' if playable short, else 'post'.
 */
export function getPostPath(post) {
  return isPlayableShortPost(post) ? "shorts" : "post";
}

/**
 * Generates canonical share URL for a post based on its type.
 */
export function getPostShareUrl(post, origin) {
  const base =
    origin ||
    (typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "https://www.fondpeace.com");
  if (!post?._id) return base;
  return `${base}/${getPostPath(post)}/${post._id}`;
}

/**
 * Generates formatted copy/share text containing post title and link separated by newline:
 * Title of post
 * https://www.fondpeace.com/shorts/...
 */
export function getPostShareText(post, origin) {
  const url = getPostShareUrl(post, origin);
  const title = (post?.title || "").trim();
  return title ? `${title}\n${url}` : url;
}

