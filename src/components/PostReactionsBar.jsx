"use client";

import React from "react";
import { playPop, playTap } from "@/utils/soundEffects";
import { triggerHeartBurst } from "@/utils/confetti";

export const REACTIONS = [
  { id: "heart", emoji: "❤️", label: "Love" },
  { id: "fire", emoji: "🔥", label: "Fire" },
  { id: "laugh", emoji: "😂", label: "Haha" },
  { id: "insight", emoji: "💡", label: "Insightful" },
  { id: "rocket", emoji: "🚀", label: "Rocket" },
];

export default function PostReactionsBar({ isOpen, onSelect, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute bottom-full left-0 mb-2 z-40 flex items-center gap-1 p-1.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200 dark:border-zinc-800 animate-in zoom-in-90 slide-in-from-bottom-2 duration-150"
      onMouseLeave={onClose}
      onClick={(e) => e.stopPropagation()}
    >
      {REACTIONS.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={(e) => {
            if (e && e.clientX && e.clientY) {
              triggerHeartBurst(e.clientX, e.clientY);
            }
            playPop();
            onSelect(r);
            if (onClose) onClose();
          }}
          className="w-8 h-8 flex items-center justify-center text-lg hover:scale-135 active:scale-95 transition-transform rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 group relative"
          title={r.label}
        >
          <span>{r.emoji}</span>
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {r.label}
          </span>
        </button>
      ))}
    </div>
  );
}
