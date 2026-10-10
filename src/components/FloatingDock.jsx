"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Film, PlusCircle, Search, ArrowUp, Volume2, VolumeX } from "lucide-react";
import { playTap, playChime, isSoundEnabled, toggleSound } from "@/utils/soundEffects";

export default function FloatingDock() {
  const pathname = usePathname();
  const router = useRouter();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [soundActive, setSoundActive] = useState(true);

  useEffect(() => {
    setSoundActive(isSoundEnabled());

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 320);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    playChime();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openSpotlight = () => {
    playTap();
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true,
        bubbles: true,
      })
    );
  };

  const handleToggleAudio = () => {
    const next = toggleSound();
    setSoundActive(next);
  };

  if (pathname === "/") return null;

  return (
    <div className="hidden lg:flex fixed bottom-5 left-1/2 -translate-x-1/2 z-[9000] pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1.5 p-2 rounded-full bg-[var(--bg-surface)]/90 backdrop-blur-2xl border border-[var(--border-subtle)] shadow-2xl shadow-blue-900/10 dark:shadow-black/60 animate-scaleIn transition-all">
        {/* Home */}
        <Link
          href="/"
          onClick={() => playTap()}
          className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
            pathname === "/"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          }`}
          title="Home Feed"
        >
          <Home className="w-4 h-4" />
        </Link>

        {/* Shorts */}
        <Link
          href="/shorts"
          onClick={() => playTap()}
          className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
            pathname === "/shorts"
              ? "bg-pink-600 text-white shadow-md shadow-pink-500/30 scale-105"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          }`}
          title="Shorts & Reels"
        >
          <Film className="w-4 h-4" />
        </Link>

        {/* Create Post (Hero Plus with Pulse) */}
        <Link
          href="/create"
          onClick={() => playTap()}
          className="relative p-2.5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-transform flex items-center justify-center group"
          title="Create New Post"
        >
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <PlusCircle className="w-4 h-4" />
        </Link>

        {/* Quick Search / Spotlight */}
        <button
          onClick={openSpotlight}
          className="p-2.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors flex items-center justify-center"
          title="Quick Spotlight (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Audio Toggle */}
        <button
          onClick={handleToggleAudio}
          className="p-2.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors flex items-center justify-center"
          title={soundActive ? "Mute Micro-Sounds" : "Unmute Micro-Sounds"}
        >
          {soundActive ? (
            <Volume2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <VolumeX className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>

        {/* Dynamic Back To Top Pill */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="ml-1 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 transition-all flex items-center gap-1 animate-fadeIn"
            title="Scroll to Top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Top</span>
          </button>
        )}
      </div>
    </div>
  );
}
