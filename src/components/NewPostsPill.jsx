"use client";

import React from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { playChime } from "@/utils/soundEffects";

export default function NewPostsPill({ count = 1, onRefresh }) {
  if (!count || count <= 0) return null;

  const handleClick = () => {
    playChime();
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (onRefresh) onRefresh();
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-top-4 fade-in duration-200">
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl shadow-blue-500/30 border border-blue-400/30 text-xs sm:text-sm font-bold backdrop-blur-lg transition-all active:scale-95 group"
      >
        <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: "3s" }} />
        <span>{count} New {count === 1 ? "Post" : "Posts"} Available</span>
        <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
}
