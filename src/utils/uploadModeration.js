// src/utils/uploadModeration.js
// Upload-time safety guard used by Upload.jsx & QuickPostComposer.jsx to block explicit adult/MMS spam uploads.

export const ADULT_SPAM_BLOCKLIST =
  /(xhamster|desihub|missav|blacked\.com|hotwebhd|xnxx|xvideos|pornhub|onlyfans|brazzers|redtube|youporn|sex\s*video|mms\s*sex|viral\s*mms|viral\s*link|telegram\s*link|full\s*video\s*download|bf\s*video|\bchudai\b|\bchudwa\w*|\bchut\b|\blund\b|\bgaand\b|\bchatwa\w*|faad\s*di|\brandi\b|bhabhi\s*muh|panty\s*viral|sex\s*racket|\bhaving\s+sex\b(?!\s+education)|nude\s*video|sofik\s*sonali|palli\s*gram|hot\s*hd\s*porn|19\s*minute|gold\s*medalist\s*scandal|\bporn\b|\bxxx\b|\b18\+\b|सेक्स\s*रैकेट|सेक्स\s*वीडियो|अश्लील\s*वीडियो)/i;

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
