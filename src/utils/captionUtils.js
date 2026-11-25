// src/utils/captionUtils.js
// Pure caption & title formatting helpers (no SEO indexing gates or blocklists).

/**
 * Clean word-boundary title truncation (never cuts mid-word).
 */
export function truncateWords(s = "", max = 95) {
  const str = String(s || "").replace(/\s+/g, " ").trim();
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  const idx = cut.lastIndexOf(" ");
  return (idx > Math.floor(max * 0.4) ? cut.slice(0, idx) : cut).trim() + "…";
}

function splitSingleLineAtBoundary(text, maxLen = 120) {
  const s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length <= maxLen) return { head: s, tail: "" };

  const windowStr = s.slice(0, maxLen + 15);
  const sentenceRegex = /[.!?।:]\s+/g;
  let match;
  let bestEnd = -1;
  while ((match = sentenceRegex.exec(windowStr)) !== null) {
    const endPos = match.index + 1;
    if (endPos >= 25 && endPos <= maxLen + 15) {
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

  const cut = s.slice(0, maxLen);
  const spaceIdx = cut.lastIndexOf(" ");
  const splitAt = spaceIdx > Math.floor(maxLen * 0.4) ? spaceIdx : maxLen;
  return {
    head: s.slice(0, splitAt).trim(),
    tail: s.slice(splitAt).trim(),
  };
}

/**
 * Splits a single social caption at render time into:
 * - headline: first line or first sentence (word-boundary capped up to ~120 chars) for H1 & <title>
 * - body: remaining text rendered as a clean <p> paragraph below H1
 * - metaDescription: first ~160 chars of body, or full clean caption if body is empty
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
      : truncateWords(fallbackTitle || "FondPeace Post", 95);
    const fallbackBody = cleanedExplicit && cleanedExplicit !== fallbackHeadline ? cleanedExplicit : "";
    return {
      headline: fallbackHeadline,
      body: fallbackBody,
      metaDescription: truncateWords(fallbackBody || fallbackHeadline, 160),
      fullClean: cleanedExplicit || fallbackHeadline,
    };
  }

  const MAX_HEADLINE = 120;
  let headline = "";
  let remainder = "";

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
    if (single.length <= 140) {
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
  const metaDescription = truncateWords(body || fullClean, 160);

  return { headline, body, metaDescription, fullClean };
}
