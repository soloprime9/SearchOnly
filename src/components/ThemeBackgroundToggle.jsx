"use client";

import React from "react";
import { useThemeBackground } from "@/context/ThemeBackgroundContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeBackgroundToggle({ variant = "icon" }) {
  const { bgTheme, toggleBgTheme, setBgTheme } = useThemeBackground();

  // Dual Icon Pill Variant (Sleek, compact icons only — White & Black)
  if (variant === "full" || variant === "icons") {
    return (
      <div 
        className="flex items-center justify-between w-full p-1 rounded-xl bg-black/[0.05] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 backdrop-blur-md shadow-xs"
        role="group"
        aria-label="Theme selector (White / Black)"
      >
        {/* White Mode Sun Icon */}
        <button
          type="button"
          onClick={() => setBgTheme("white")}
          className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all cursor-pointer relative group ${
            bgTheme === "white"
              ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30 scale-[1.02]"
              : "text-zinc-500 dark:text-zinc-400 hover:text-amber-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          }`}
          title="White Mode (Clean Light Background)"
          aria-label="Switch to White Background"
        >
          <Sun 
            size={16} 
            className={`transition-transform duration-200 group-hover:scale-110 ${
              bgTheme === "white" ? "text-white drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" : ""
            }`} 
          />
        </button>

        {/* Black Mode Moon Icon */}
        <button
          type="button"
          onClick={() => setBgTheme("black")}
          className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all cursor-pointer relative group ${
            bgTheme === "black"
              ? "bg-zinc-800 text-white border border-white/20 shadow-sm scale-[1.02]"
              : "text-zinc-500 dark:text-zinc-400 hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          }`}
          title="Black Mode (Pitch Black OLED Background)"
          aria-label="Switch to Black Background"
        >
          <Moon 
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
      className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.05] hover:bg-black/[0.1] dark:hover:bg-white/[0.1] border border-black/10 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer relative group"
      title={
        bgTheme === "white"
          ? "White Mode Active (Click for Black Mode)"
          : "Black Mode Active (Click for White Mode)"
      }
      aria-label="Toggle White / Black Theme"
    >
      {bgTheme === "white" ? (
        <Sun size={15} className="text-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)] transition-transform group-hover:scale-110" />
      ) : (
        <Moon size={15} className="text-zinc-200 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-110" />
      )}
    </button>
  );
}
