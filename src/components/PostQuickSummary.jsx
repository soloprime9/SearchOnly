"use client";

import React, { useState } from "react";
import { Zap, ChevronDown, ChevronUp, Sparkles, Check } from "lucide-react";
import { playPop, playTap } from "@/utils/soundEffects";

// Helper to intelligently summarize post text into 2-3 crisp bullet points
function extractKeyTakeaways(text) {
  if (!text) return [];
  // Clean text
  const clean = text.replace(/#\w+/g, "").trim();
  const sentences = clean
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  if (sentences.length === 0) {
    return [text.slice(0, 100) + "..."];
  }
  if (sentences.length <= 3) {
    return sentences;
  }
  // Pick first, middle, and last punchy sentence
  return [sentences[0], sentences[Math.floor(sentences.length / 2)], sentences[sentences.length - 1]];
}

export default function PostQuickSummary({ text }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Only show for posts with enough substance (> 100 characters or multiple lines)
  if (!text || text.length < 100) return null;

  const takeaways = extractKeyTakeaways(text);
  if (takeaways.length === 0) return null;

  const handleCopy = (e) => {
    e.stopPropagation();
    playTap();
    navigator.clipboard.writeText(takeaways.map((t, i) => `${i + 1}. ${t}`).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mt-2 text-xs">
      <button
        type="button"
        onClick={() => {
          playPop();
          setIsOpen(!isOpen);
        }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 font-bold hover:bg-amber-100 transition-all text-[11px] shadow-xs active:scale-95"
      >
        <Zap size={12} className="fill-amber-500 text-amber-500" />
        <span>Quick Takeaways</span>
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {isOpen && (
        <div className="mt-2 p-3 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 rounded-xl border border-amber-200/80 dark:border-amber-900/40 space-y-2 animate-in fade-in duration-200 shadow-sm">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
            <span className="flex items-center gap-1">
              <Sparkles size={11} /> 3-Second Summary
            </span>
            <button
              onClick={handleCopy}
              className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 normal-case font-bold"
            >
              {copied ? (
                <>
                  <Check size={11} className="text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Copied</span>
                </>
              ) : (
                "Copy"
              )}
            </button>
          </div>

          <ul className="space-y-1.5">
            {takeaways.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-800 dark:text-gray-200 text-[11px] leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
