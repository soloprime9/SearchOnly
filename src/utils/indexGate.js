// src/utils/indexGate.js
// Centralized Google Indexing Quality Gate & Adult/MMS Spam Moderation Filter.
// Keeps normal UGC visible for users while ensuring Google only indexes clean,
// policy-compliant pages and never receives adult/MMS spam in sitemaps or Search.

import { extractPostYouTubeId, VIDEO_EXT_REGEX } from "@/utils/postMediaUtils";

export const ADULT_SPAM_BLOCKLIST =
  /(xhamster|desihub|missav|blacked\.com|hotwebhd|xnxx|xvideos|pornhub|onlyfans|brazzers|redtube|youporn|sex\s*video|mms\s*sex|viral\s*mms|viral\s*link|telegram\s*link|full\s*video\s*download|bf\s*video|chudai|chudwa|chudwaya|\bchut\b|\blund\b|\bgaand\b|chatwa|faad\s*di|randi|bhabhi\s*muh|panty\s*viral|sex\s*racket|having\s*sex|nude\s*video|sofik\s*sonali|palli\s*gram|hot\s*hd\s*porn|19\s*minute|gold\s*medalist\s*scandal|\bporn\b|\bxxx\b|\b18\+\b|सेक्स\s*रैकेट|सेक्स\s*वीडियो|अश्लील\s*वीडियो)/i;

/**
 * Clean word-boundary title truncation (never cuts mid-word like "18th November 2").
 */
export function truncateWords(s = "", max = 55) {
  const str = String(s || "").replace(/\s+/g, " ").trim();
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  const idx = cut.lastIndexOf(" ");
  return (idx > Math.floor(max * 0.4) ? cut.slice(0, idx) : cut).trim() + "…";
}

/**
 * Splits a single social caption at render time into:
 * - headline: first line or first sentence (word-boundary capped around ~65 chars) for H1 & <title>
 * - body: remaining text rendered as a clean <p> paragraph below H1 (empty for short captions)
 * - metaDescription: first ~155 chars of body, or full clean caption if body is empty
 * Strips inline #hashtags (which render separately as /topic/ links) and raw URLs.
 */
export function splitCaption(rawCaption = "", explicitDescription = "", fallbackTitle = "") {
  const stripInlineNoise = (str) =>
    String(str || "")
      .replace(/https?:\/\/\S+/gi, "")
      .replace(/#[\w\u0590-\u05ff\u0900-\u097f]+/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  const cleanedCaption = stripInlineNoise(rawCaption);
  const cleanedExplicit = stripInlineNoise(explicitDescription);

  if (!cleanedCaption) {
    const fallbackHeadline = cleanedExplicit
      ? splitCaption(cleanedExplicit, "", fallbackTitle).headline
      : truncateWords(fallbackTitle || "FondPeace Post", 65);
    const fallbackBody = cleanedExplicit && cleanedExplicit !== fallbackHeadline ? cleanedExplicit : "";
    return {
      headline: fallbackHeadline,
      body: fallbackBody,
      metaDescription: truncateWords(fallbackBody || fallbackHeadline, 155),
      fullClean: cleanedExplicit || fallbackHeadline,
    };
  }

  const MAX_HEADLINE = 65;
  let headline = "";
  let remainder = "";

  // 1. Check newline split first (natural user line break)
  const lines = cleanedCaption
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    const firstLine = lines[0];
    const restLines = lines.slice(1).join("\n");
    if (firstLine.length <= MAX_HEADLINE) {
      headline = firstLine;
      remainder = restLines;
    } else {
      const { head, tail } = splitSingleLineAtBoundary(firstLine, MAX_HEADLINE);
      headline = head;
      remainder = [tail, restLines].filter(Boolean).join("\n");
    }
  } else {
    const single = lines[0] || cleanedCaption;
    if (single.length <= MAX_HEADLINE) {
      headline = single;
      remainder = "";
    } else {
      const { head, tail } = splitSingleLineAtBoundary(single, MAX_HEADLINE);
      headline = head;
      remainder = tail;
    }
  }

  const bodyParts = [remainder, cleanedExplicit].filter(Boolean);
  const body = bodyParts.join("\n\n").trim();
  const fullClean = [cleanedCaption, cleanedExplicit].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const metaDescription = truncateWords(body || fullClean, 155);

  return { headline, body, metaDescription, fullClean };
}

function splitSingleLineAtBoundary(text, maxLen = 65) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length <= maxLen) return { head: s, tail: "" };

  // Prefer natural sentence / clause boundary (. ! ? । :) between char 18 and maxLen + 5
  const windowStr = s.slice(0, maxLen + 5);
  const sentenceRegex = /[.!?।:]\s+/g;
  let match;
  let bestEnd = -1;
  while ((match = sentenceRegex.exec(windowStr)) !== null) {
    const endPos = match.index + 1; // include punctuation
    if (endPos >= 18 && endPos <= maxLen + 5) {
      bestEnd = endPos;
      break;
    }
  }

  if (bestEnd > 0) {
    return {
      head: s.slice(0, bestEnd).trim(),
      tail: s.slice(bestEnd).trim(),
    };
  }

  // Fallback: split cleanly on last word boundary <= maxLen
  const cut = s.slice(0, maxLen);
  const spaceIdx = cut.lastIndexOf(" ");
  const splitAt = spaceIdx > Math.floor(maxLen * 0.4) ? spaceIdx : maxLen;
  return {
    head: s.slice(0, splitAt).trim(),
    tail: s.slice(splitAt).trim(),
  };
}

/**
 * Removes copied YouTube original title from a post caption so the index gate
 * only counts the user's OWN original commentary words.
 */
export function stripYouTubeOriginalTitle(caption = "", ytOriginalTitle = "") {
  const raw = String(caption || "").trim();
  const yt = String(ytOriginalTitle || "").trim();
  if (!raw || !yt) return raw;

  // 1. Direct case-insensitive substring removal
  const escaped = yt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  let stripped = raw.replace(new RegExp(escaped, "ig"), " ").trim();

  // 2. Punctuation-normalized token check: if normalized caption still starts with/contains normalized YT title
  const normRaw = stripped.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  const normYt = yt.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  if (normYt && normYt.length >= 10 && normRaw.includes(normYt)) {
    stripped = normRaw.replace(normYt, " ").trim();
  }

  return stripped;
}

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
  const rawDescription = (post.description || "").trim();
  const titleWords = countCleanWords(rawTitle);
  const descWords = countCleanWords(rawDescription);
  const comments = Array.isArray(post.comments)
    ? post.comments.length
    : Number(post.commentCount || 0);

  // Native uploaded videos on our CDN (.mp4, .webm, .mov, .m3u8):
  // Always index clean native creator uploads even when captions are short/hashtag-based.
  const mediaCandidate = (post.media || post.mediaUrl || "").trim();
  const hasNativeUploadedVideo =
    typeof mediaCandidate === "string" && VIDEO_EXT_REGEX.test(mediaCandidate);
  if (hasNativeUploadedVideo) {
    return true;
  }

  // Pure URL-only post with zero description, zero commentary, and < 2 comments -> noindex
  const isRawUrlOnly = /^https?:\/\/\S+$/i.test(rawTitle);
  if (isRawUrlOnly && descWords < 10 && comments < 2) return false;

  // Third-party YouTube embed reposts (without native uploaded video):
  // Strip copied YouTube original title from caption first so we only count the user's
  // OWN original words (15+ clean original words, or 2+ community comments).
  const isYouTubeRepost = Boolean(extractPostYouTubeId(post));
  if (isYouTubeRepost) {
    const ytOriginalTitle = post.linkPreview?.title || "";
    const strippedCaption = stripYouTubeOriginalTitle(rawTitle, ytOriginalTitle);
    const originalWords = countCleanWords(strippedCaption) + descWords;
    return originalWords >= 15 || comments >= 2;
  }

  // External link share -> require original description (15+ words), caption (6+ words), or 2+ comments
  const isExternalLinkPost =
    post.mediaType === "link" || post.mtype === "link" || Boolean(post.linkPreview?.url && !post.media);
  if (isExternalLinkPost) {
    return descWords >= 15 || titleWords >= 6 || comments >= 2;
  }

  return descWords >= 10 || titleWords >= 5 || comments >= 2;
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

/**
 * Deduplicates video posts sharing the exact same underlying media file URL
 * (prevents Google seeing 24 identical copies of the same .mp4 in video-sitemap.xml).
 */
export function dedupeVideosByMedia(posts = []) {
  if (!Array.isArray(posts)) return [];
  const seenMedia = new Set();
  const unique = [];
  for (const post of posts) {
    if (!post?._id) continue;
    const rawMedia = String(post.media || post.mediaUrl || "").trim().toLowerCase();
    if (rawMedia) {
      if (seenMedia.has(rawMedia)) continue;
      seenMedia.add(rawMedia);
    }
    unique.push(post);
  }
  return unique;
}

/**
 * Deduplicates non-video posts with identical normalized titles so duplicate uploads
 * never bloat post-sitemap.xml or sitemap.xml.
 */
export function dedupePostsByTitle(posts = []) {
  if (!Array.isArray(posts)) return [];
  const seenTitles = new Set();
  const unique = [];
  for (const post of posts) {
    if (!post?._id) continue;
    const normTitle = String(post.title || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
    if (normTitle) {
      if (seenTitles.has(normTitle)) continue;
      seenTitles.add(normTitle);
    }
    unique.push(post);
  }
  return unique;
}
