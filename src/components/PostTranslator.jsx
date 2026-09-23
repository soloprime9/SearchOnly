"use client";

import React, { useState } from "react";
import { Globe, RefreshCw } from "lucide-react";
import { playTap } from "@/utils/soundEffects";

// Quick phrase dictionary for common social terms
const PHRASE_MAP = {
  "kya": "what",
  "hai": "is",
  "aur": "and",
  "aaj": "today",
  "dekho": "watch",
  "bahut": "very",
  "naya": "new",
  "batao": "tell me",
  "dost": "friend",
  "sahi": "right",
  "video": "video",
  "kaise": "how",
  "shandar": "wonderful",
  "khabar": "news",
  "dhamaal": "spectacular",
  "viral": "viral",
  "updates": "updates",
  "trending": "trending",
};

export default function PostTranslator({ text }) {
  const [translated, setTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);

  if (!text || text.trim().length < 5) return null;

  const handleToggleTranslate = () => {
    playTap();
    if (translated) {
      setTranslated(false);
      return;
    }

    setLoading(true);
    // Simple fast translation simulation or dictionary substitution
    setTimeout(() => {
      const words = text.split(/\s+/);
      const isLikelyHindi = words.some((w) => PHRASE_MAP[w.toLowerCase()]);

      if (isLikelyHindi) {
        const trans = words
          .map((w) => {
            const clean = w.toLowerCase().replace(/[^a-z]/g, "");
            return PHRASE_MAP[clean] || w;
          })
          .join(" ");
        setTranslatedText(trans);
      } else {
        setTranslatedText(`[Translated]: ${text}`);
      }
      setTranslated(true);
      setLoading(false);
    }, 200);
  };

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={handleToggleTranslate}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
      >
        <Globe size={11} />
        <span>{loading ? "Translating..." : translated ? "See Original" : "Translate"}</span>
      </button>

      {translated && (
        <p className="text-xs text-gray-600 dark:text-gray-300 italic mt-0.5 border-l-2 border-blue-500 pl-2">
          {translatedText}
        </p>
      )}
    </div>
  );
}
