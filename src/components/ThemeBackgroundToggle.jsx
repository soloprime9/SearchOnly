"use client";

import React from "react";
import { useThemeBackground } from "@/context/ThemeBackgroundContext";
import { Sparkles, CircleDot } from "lucide-react";

export default function ThemeBackgroundToggle({ variant = "icon" }) {
  const { bgTheme, toggleBgTheme, setBgTheme } = useThemeBackground();

  // Dual Icon Pill Variant (Sleek, compact icons only — no bloated text labels)
  if (variant === "full" || variant === "icons") {
    return (
      <div 
        className="flex items-center justify-between w-full p-1 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-xs"
        role="group"
        aria-label="Background theme selector"
      >
        {/* Midnight Dim Icon Option */}
        <button
          type="button"
          onClick={() => setBgTheme("dim")}
          className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all cursor-pointer relative group ${
            bgTheme === "dim"
              ? "bg-blue-600/90 text-cyan-200 shadow-sm shadow-blue-500/25 scale-[1.02]"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
          }`}
          title="Midnight Dim (Deep Navy Slate)"
          aria-label="Switch to Midnight Dim"
        >
          <Sparkles 
            size={16} 
            className={`transition-transform duration-200 group-hover:scale-110 ${
              bgTheme === "dim" ? "text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" : ""
            }`} 
          />
        </button>

        {/* Pitch Black / OLED Icon Option */}
        <button
          type="button"
          onClick={() => setBgTheme("black")}
          className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all cursor-pointer relative group ${
            bgTheme === "black"
              ? "bg-zinc-800 text-white border border-white/20 shadow-sm scale-[1.02]"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
          }`}
          title="Pitch Black (OLED Lights Out)"
          aria-label="Switch to Pitch Black"
        >
          <CircleDot 
            size={16} 
            className={`transition-transform duration-200 group-hover:scale-110 ${
              bgTheme === "black" ? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" : ""
            }`} 
          />
        </button>
      </div>
    );
  }

  // Single Compact Icon Toggle Variant (For Navbars & Collapsed Sidebar)
  return (
    <button
      type="button"
      onClick={toggleBgTheme}
      className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-gray-300 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer relative group"
      title={
        bgTheme === "dim"
          ? "Theme: Midnight Dim (Tap for Pitch Black)"
          : "Theme: Pitch Black (Tap for Midnight Dim)"
      }
      aria-label="Toggle Background Appearance"
    >
      {bgTheme === "dim" ? (
        <Sparkles size={14} className="text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)] transition-transform group-hover:scale-110" />
      ) : (
        <CircleDot size={14} className="text-zinc-200 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-110" />
      )}
    </button>
  );
}
