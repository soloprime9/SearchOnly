"use client";

import React, { useEffect } from "react";
import { X, Command } from "lucide-react";
import { playPop } from "@/utils/soundEffects";

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: "J", desc: "Next post in feed" },
    { key: "K", desc: "Previous post in feed" },
    { key: "L", desc: "Like / Heart active post" },
    { key: "M", desc: "Mute / Unmute video audio" },
    { key: "C", desc: "Open comments on active post" },
    { key: "S", desc: "Save / Bookmark post" },
    { key: "/", desc: "Focus search bar" },
    { key: "?", desc: "Toggle this shortcuts guide" },
    { key: "Esc", desc: "Close any modal or drawer" },
  ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0c101c] border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Command className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-bold text-[15px] leading-tight">Keyboard Shortcuts</h3>
              <p className="text-gray-400 text-xs">Navigate FondPeace like a power user</p>
            </div>
          </div>
          <button
            onClick={() => {
              playPop();
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((item, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-gray-300 text-sm font-medium">{item.desc}</span>
              <kbd className="px-2.5 py-1 bg-white/[0.08] border border-white/15 rounded-lg text-white font-mono text-xs font-bold shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/[0.08] text-center">
          <span className="text-gray-500 text-xs">Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px] text-gray-300">?</kbd> anywhere to open anytime</span>
        </div>
      </div>
    </div>
  );
}
