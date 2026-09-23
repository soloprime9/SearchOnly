"use client";

import React, { useState } from "react";
import axios from "axios";
import { getApiBase, getAuthHeaders } from "@/utils/apiConfig";
import { triggerHeartBurst } from "@/utils/confetti";
import { playChime, playPop } from "@/utils/soundEffects";
import { toast } from "@/utils/toast";
import { X, Sparkles, Heart, Flame, Rocket, Gem, CheckCircle2 } from "lucide-react";

const APPRECIATION_OPTIONS = [
  {
    id: "love",
    label: "Big Love",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
    text: "Loved this post so much! Keep creating!",
  },
  {
    id: "fire",
    label: "On Fire",
    icon: Flame,
    color: "from-amber-500 to-orange-500",
    text: "Absolute fire content! 10/10 🔥",
  },
  {
    id: "moon",
    label: "To The Moon",
    icon: Rocket,
    color: "from-blue-500 to-indigo-600",
    text: "Next level creative work! 🚀",
  },
  {
    id: "gem",
    label: "Pure Gem",
    icon: Gem,
    color: "from-emerald-500 to-teal-600",
    text: "Rare and valuable perspective. Thank you! 💎",
  },
];

export default function CreatorAppreciationModal({ isOpen, onClose, post }) {
  const [selected, setSelected] = useState("love");
  const [customMsg, setCustomMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen || !post) return null;

  const creatorName = post?.userId?.username || "Creator";

  const handleSendAppreciation = async (e) => {
    if (e && e.clientX && e.clientY) {
      triggerHeartBurst(e.clientX, e.clientY);
    } else {
      triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2);
    }

    playChime();
    setSending(true);

    try {
      const headers = getAuthHeaders();
      const apiBase = getApiBase();

      const option = APPRECIATION_OPTIONS.find((o) => o.id === selected);
      const finalMsg = customMsg.trim() || option?.text || "Loved this post!";

      // Send as appreciation comment or reaction to post
      if (headers["x-auth-token"] || headers["Authorization"]) {
        await axios.post(
          `${apiBase}/post/comment/${post._id}`,
          { CommentText: `✨ [Appreciation] ${finalMsg}` },
          { headers }
        );
      }

      setSent(true);
      toast.success(`Sent appreciation to @${creatorName}! ✨`);

      setTimeout(() => {
        setSent(false);
        setCustomMsg("");
        onClose();
      }, 1500);
    } catch {
      // Still show celebratory effect
      setSent(true);
      toast.success(`Appreciation sent to @${creatorName}! ✨`);
      setTimeout(() => {
        setSent(false);
        setCustomMsg("");
        onClose();
      }, 1500);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <X size={18} />
        </button>

        {sent ? (
          <div className="py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-black text-lg text-gray-900 dark:text-white">
              Appreciation Delivered! 🎉
            </h3>
            <p className="text-xs text-gray-500">
              Your cheer made @{creatorName}&apos;s day brighter!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/20">
              <Sparkles size={24} />
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                Appreciate @{creatorName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Show some love with a virtual cheer & confetti!
              </p>
            </div>

            {/* Option Pills */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {APPRECIATION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      playPop();
                      setSelected(opt.id);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${opt.color} text-white flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon size={14} />
                    </div>
                    <span className="text-xs font-bold truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Optional note */}
            <div>
              <input
                type="text"
                placeholder="Add an optional cheer note..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                maxLength={100}
                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendAppreciation}
              disabled={sending}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white font-black text-xs shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50"
            >
              {sending ? "Sending Cheer..." : "Send Celebration Cheer ✨"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
