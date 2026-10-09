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

  // 1. Explicit post thumbnail (if valid and not default placeholder)
  if (post.thumbnail && typeof post.thumbnail === "string" && post.thumbnail.trim()) {
    const t = post.thumbnail.trim();
    if (!t.includes("Fondpeace.jpg") && !t.includes("default.jpg")) {
      const abs = toAbsolute(t);
      if (abs) return abs;
    }
  }

  // 2. Direct media file (photo / image upload)
  const mediaStr = post.media || post.mediaUrl;
  if (mediaStr && typeof mediaStr === "string" && mediaStr.trim()) {
    const isVideo =
      /\.(mp4|mov|webm|mkv)$/i.test(mediaStr) ||
      (typeof post.mediaType === "string" && post.mediaType.startsWith("video"));
    if (!isVideo) {
      const abs = toAbsolute(mediaStr.trim());
      if (abs) return abs;
    }
  }

  // 3. Link preview image (saved when sharing YouTube, news, blog, articles, etc.)
  if (
    post.linkPreview?.image &&
    typeof post.linkPreview.image === "string" &&
    post.linkPreview.image.trim()
  ) {
    const abs = toAbsolute(post.linkPreview.image.trim());
    if (abs) return abs;
  }

  // 4. Auto-detect YouTube URL in title, content, description or linkPreview.url
  const textBlob = `${post.title || ""} ${post.content || ""} ${post.description || ""} ${post.linkPreview?.url || ""}`;
  const ytThumb = extractYouTubeThumbnail(textBlob);
  if (ytThumb) return ytThumb;

  // 5. Array of images fallback (multi-photo post)
  if (
    Array.isArray(post.images) &&
    post.images.length &&
    typeof post.images[0] === "string" &&
    post.images[0].trim()
  ) {
    const abs = toAbsolute(post.images[0].trim());
    if (abs) return abs;
  }

  // 6. Dynamic branded OG banner if post has title & author
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
