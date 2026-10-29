const SITE_ROOT = "https://www.fondpeace.com";
const DEFAULT_THUMB = "https://www.fondpeace.com/Fondpeace.jpg";

export function toAbsolute(url) {
  if (!url || typeof url !== "string") return null;
  const clean = url.trim();
  if (!clean) return null;
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  if (clean.startsWith("//")) return `https:${clean}`;
  if (clean.startsWith("/")) return `${SITE_ROOT}${clean}`;
  return `${SITE_ROOT}/${clean}`;
}

export function extractYouTubeThumbnail(text) {
  if (!text || typeof text !== "string") return null;
  const match = text.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v|shorts)\/))([a-zA-Z0-9_-]{11})/i
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export function resolvePostThumbnail(post) {
  if (!post) return DEFAULT_THUMB;

  // 1. Direct YouTube ID if already normalized or known
  if (post.youtubeId && typeof post.youtubeId === "string" && post.youtubeId.trim().length === 11) {
    return `https://img.youtube.com/vi/${post.youtubeId.trim()}/hqdefault.jpg`;
  }

  // 2. Auto-detect YouTube URL in post.link, post.media, post.linkPreview, title or description
  const candidates = [
    post.link,
    post.media,
    post.mediaUrl,
    post.linkPreview?.url,
    post.title,
    post.content,
    post.description,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) {
      const match = c.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v|shorts)\/))([a-zA-Z0-9_-]{11})/i
      );
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }
  }

  // 3. Link preview image (for link posts, articles, news, videos)
  if (
    post.linkPreview?.image &&
    typeof post.linkPreview.image === "string" &&
    post.linkPreview.image.trim()
  ) {
    const abs = toAbsolute(post.linkPreview.image.trim());
    if (abs) return abs;
  }

  // 4. Explicit post thumbnail (allow YouTube hqdefault.jpg; only reject generic local placeholders)
  if (post.thumbnail && typeof post.thumbnail === "string" && post.thumbnail.trim()) {
    const t = post.thumbnail.trim();
    if (!t.endsWith("/default.jpg") && !t.includes("Fondpeace.jpg")) {
      const abs = toAbsolute(t);
      if (abs) return abs;
    }
  }

  // 5. Direct media file if image
  const mediaStr = post.media || post.mediaUrl;
  if (mediaStr && typeof mediaStr === "string" && mediaStr.trim()) {
    const isVideo =
      /\.(mp4|mov|webm|mkv|m4v|m3u8)$/i.test(mediaStr) ||
      (typeof post.mediaType === "string" && post.mediaType.startsWith("video"));
    if (!isVideo) {
      const abs = toAbsolute(mediaStr.trim());
      if (abs) return abs;
    }
  }

  // 6. Array of images fallback (multi-photo post)
  if (
    Array.isArray(post.images) &&
    post.images.length &&
    typeof post.images[0] === "string" &&
    post.images[0].trim()
  ) {
    const abs = toAbsolute(post.images[0].trim());
    if (abs) return abs;
  }

  // 7. Dynamic branded OG banner if post has title & author
  const rawTitle = (post.title || "").trim();
  const cleanTitle = rawTitle.replace(/#[a-zA-Z0-9_]+/g, "").trim();
  const authorName = post.userId?.username || "Creator";
  if (cleanTitle) {
    return `${SITE_ROOT}/api/og?title=${encodeURIComponent(
      cleanTitle.slice(0, 100)
    )}&author=${encodeURIComponent(authorName)}`;
  }

  return DEFAULT_THUMB;
}
