"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, Check, Compass, SlidersHorizontal } from "lucide-react";
import { playTap, playPop, playChime } from "@/utils/soundEffects";
import { toast } from "@/utils/toast";

const AVAILABLE_TOPICS = [
  { id: "Technology", label: "💻 Technology", desc: "AI, Gadgets & Coding" },
  { id: "Cricket", label: "🏏 Cricket", desc: "IPL, Matches & Scores" },
  { id: "Entertainment", label: "🎬 Entertainment", desc: "Movies, Series & Stars" },
  { id: "Trending News", label: "🔥 Trending News", desc: "Viral debates & stories" },
  { id: "Stock Market", label: "📈 Finance & Stocks", desc: "Crypto, Investing & IPOs" },
  { id: "Health", label: "🏋️ Health & Wellness", desc: "Fitness, Diets & Lifestyle" },
  { id: "Reality Shows", label: "📺 Reality Shows", desc: "Bigg Boss, Dramas & TV" },
  { id: "Job Updates", label: "💼 Careers & Jobs", desc: "Hiring, Startups & Guides" },
  { id: "Viral News", label: "⚡ Viral & Memes", desc: "Humor, Relatable & Reels" },
];

export default function PersonalizeFeedModal({ isOpen, onClose, onSaveTopics }) {
  const [selectedTopics, setSelectedTopics] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("fondpeace_my_topics");
        if (stored) {
          setSelectedTopics(JSON.parse(stored));
        } else {
          // Default popular starter topics
          setSelectedTopics(["Technology", "Cricket", "Entertainment"]);
        }
      } catch (_) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTopic = (id) => {
    playTap();
    setSelectedTopics((prev) => {
      if (prev.includes(id)) {
        return prev.filter((t) => t !== id);
      } else {
        if (prev.length >= 6) {
          toast.error("You can choose up to 6 priority topics.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleSave = () => {
    playChime();
    if (typeof window !== "undefined") {
      localStorage.setItem("fondpeace_my_topics", JSON.stringify(selectedTopics));
    }
    if (onSaveTopics) onSaveTopics(selectedTopics);
    toast.success("Feed preferences updated! 🎯");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalize Your Experience</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Pick Your Topics
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Select what you love. We'll curate your feed so you see the best posts first.
            </p>
          </div>
          <button
            onClick={() => {
              playPop();
              onClose();
            }}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-5 max-h-80 overflow-y-auto custom-scrollbar pr-1 relative z-10">
          {AVAILABLE_TOPICS.map((topic) => {
            const isSelected = selectedTopics.includes(topic.id);
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => toggleTopic(topic.id)}
                className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] flex items-center justify-between gap-2 ${
                  isSelected
                    ? "bg-blue-50/80 dark:bg-blue-950/30 border-blue-500/80 shadow-xs ring-1 ring-blue-500/30"
                    : "bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                    {topic.label}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate mt-0.5">
                    {topic.desc}
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : "border border-gray-300 dark:border-zinc-700"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/10 relative z-10">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {selectedTopics.length} selected (up to 6)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playTap();
                onClose();
              }}
              className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/25 transition-all active:scale-95"
            >
              Save & Curate Feed ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
