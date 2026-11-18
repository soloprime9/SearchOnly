// src/utils/indexGate.js
// Centralized Google Indexing Quality Gate & Adult/MMS Spam Moderation Filter.
// Keeps normal UGC visible for users while ensuring Google only indexes clean,
// policy-compliant pages and never receives adult/MMS spam in sitemaps or Search.

export const ADULT_SPAM_BLOCKLIST =
  /(xhamster|desihub|missav|blacked\.com|hotwebhd|xnxx|xvideos|pornhub|onlyfans|brazzers|redtube|youporn|sex\s*video|mms\s*sex|viral\s*mms|viral\s*link|telegram\s*link|full\s*video\s*download|bf\s*video|chudai|randi|bhabhi\s*muh|panty\s*viral|sex\s*racket|having\s*sex|nude\s*video|\bporn\b|\bxxx\b|\b18\+\b|सेक्स\s*रैकेट|सेक्स\s*वीडियो)/i;

/**
 * Returns true if a post object or raw string contains blocked adult, MMS, or link-spam terms.
 */
export function isBlockedAdultOrSpam(input) {
  if (!input) return false;
  if (typeof input === "string") {
    return ADULT_SPAM_BLOCKLIST.test(input);
  }
  const combined = [
    input.title || "",
    input.description || "",
    input.content || "",
    input.linkPreview?.title || "",
    input.linkPreview?.url || "",
    Array.isArray(input.tags) ? input.tags.join(" ") : "",
    Array.isArray(input.hashtags) ? input.hashtags.join(" ") : "",
  ].join(" ");

  return ADULT_SPAM_BLOCKLIST.test(combined);
}

/**
 * Counts meaningful human-readable words (excluding #hashtags and raw URLs).
 */
export function countCleanWords(text = "") {
  return String(text)
    .replace(/#[\w\u0590-\u05ff\u0900-\u097f]+/g, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 2).length;
}

/**
 * Determines whether a post/video page should be indexed by Google (and included in sitemaps).
 * - Always rejects adult/MMS/porn spam.
 * - Link-only posts without original commentary stay `noindex` unless they have real community comments.
 * - Requires at least 5 clean words OR 2+ community comments.
 */
export function shouldIndexPost(post) {
  if (!post || !post._id) return false;
  if (isBlockedAdultOrSpam(post)) return false;

  const rawTitle = (post.title || "").trim();
  const cleanWords = countCleanWords(rawTitle);
  const comments = Array.isArray(post.comments)
    ? post.comments.length
    : Number(post.commentCount || 0);

  // Pure URL-only post with zero commentary and < 2 comments -> noindex
  const isRawUrlOnly = /^https?:\/\/\S+$/i.test(rawTitle);
  if (isRawUrlOnly && comments < 2) return false;

  // External link share with zero/minimal original text -> require 6+ clean words or 2+ comments
  const isExternalLinkPost =
    post.mediaType === "link" || post.mtype === "link" || Boolean(post.linkPreview?.url && !post.media);
  if (isExternalLinkPost) {
    return cleanWords >= 6 || comments >= 2;
  }

  return cleanWords >= 5 || comments >= 2;
}

/**
 * Determines whether a creator profile page has enough clean activity to be indexed by Google.
 */
export function shouldIndexProfile(profileData) {
  const user = profileData?.user;
  if (!user || !user.username) return false;
  if (isBlockedAdultOrSpam(`${user.username} ${user.name || ""} ${user.bio || ""}`)) {
    return false;
  }

  const posts = Array.isArray(profileData?.posts) ? profileData.posts : [];
  const cleanPostsCount = posts.filter((p) => !isBlockedAdultOrSpam(p)).length;
  const followersCount = Array.isArray(user.Followers) ? user.Followers.length : 0;
  const hasRealBio = countCleanWords(user.bio || "") >= 6;

  return cleanPostsCount >= 2 || followersCount >= 5 || (cleanPostsCount >= 1 && hasRealBio);
}

/**
 * Determines whether a topic/hashtag page has enough clean posts to be indexed by Google.
 */
export function shouldIndexTopic(topicName, posts = []) {
  if (!topicName || isBlockedAdultOrSpam(topicName)) return false;
  if (!Array.isArray(posts)) return false;
  const cleanPostsCount = posts.filter((p) => !isBlockedAdultOrSpam(p)).length;
  return cleanPostsCount >= 2;
}
