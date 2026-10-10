"use client";

import React from "react";
import { useThemeBackground } from "@/context/ThemeBackgroundContext";
import { Moon, Sun, Sparkles, CircleDot } from "lucide-react";

export default function ThemeBackgroundToggle({ variant = "icon" }) {
  const { bgTheme, toggleBgTheme, setBgTheme } = useThemeBackground();

  if (variant === "full") {
    return (
      <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-xl">
        <button
          type="button"
          onClick={() => setBgTheme("dim")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            bgTheme === "dim"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
          }`}
          title="Midnight Dim: Rich navy slate dark mode (easy on the eyes)"
        >
          <Sparkles size={13} className="text-cyan-300" />
          <span>Midnight Dim</span>
        </button>

        <button
          type="button"
          onClick={() => setBgTheme("black")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            bgTheme === "black"
              ? "bg-zinc-800 text-white border border-white/20 shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
          }`}
          title="Lights Out: Pure Pitch Black (OLED Battery Saver)"
        >
          <CircleDot size={13} className="text-zinc-300" />
          <span>Pitch Black</span>
        </button>
      </div>
    );
  }

  // Compact Pill / Icon Variant
  return (
    <button
      type="button"
      onClick={toggleBgTheme}
      className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-bold transition-all active:scale-95 cursor-pointer group"
      title={
        bgTheme === "dim"
          ? "Current: Midnight Dim. Click to switch to Pitch Black."
          : "Current: Pitch Black. Click to switch to Midnight Dim."
      }
      aria-label="Toggle Background Appearance"
    >
      {bgTheme === "dim" ? (
        <>
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
          <span className="text-[11px] font-semibold text-cyan-300 hidden sm:inline">Dim</span>
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-zinc-400 border border-white/30" />
          <span className="text-[11px] font-semibold text-zinc-300 hidden sm:inline">Black</span>
        </>
      )}
    </button>
  );
}
