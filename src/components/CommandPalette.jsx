"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Home,
  Film,
  Flame,
  PlusSquare,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Compass,
  LifeBuoy,
  Sparkles,
} from "lucide-react";
import { playTap, playChime, isSoundEnabled, toggleSound } from "@/utils/soundEffects";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setSoundOn(isSoundEnabled());

    const handleKeyDown = (e) => {
      // Toggle palette on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        playTap();
      }
      // Close on Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleNavigate = (path) => {
    playTap();
    setIsOpen(false);
    setQuery("");
    router.push(path);
  };

  const handleToggleSound = () => {
    const nextState = toggleSound();
    setSoundOn(nextState);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      playChime();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleNavigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isOpen) return null;

  const quickNav = [
    { label: "Home Feed", path: "/", icon: Home, badge: "Feed" },
    { label: "Shorts & Video Reels", path: "/shorts", icon: Film, badge: "Watch" },
    { label: "Trending Topics", path: "/", icon: Flame, badge: "Viral" },
    { label: "Create Post or Poll", path: "/create", icon: PlusSquare, badge: "Creator" },
    { label: "About Platform", path: "/aboutus", icon: Compass, badge: "Info" },
  ];

  const filteredNav = quickNav.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-16 sm:pt-28 px-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center px-4 py-3.5 border-b border-gray-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search anything..."
            className="w-full text-base bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-1 text-[11px] font-semibold text-gray-400 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
        </form>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Navigation Section */}
          <div>
            <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Navigation
            </div>
            <div className="space-y-1">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800/80 text-gray-700 dark:text-gray-200 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Tools Section */}
          <div className="pt-2 border-t border-gray-100 dark:border-slate-800/80">
            <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-1.5">
              Quick Actions
            </div>
            <div className="space-y-1">
              {/* Sound Toggle */}
              <button
                onClick={handleToggleSound}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/60 text-gray-700 dark:text-gray-200 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500">
                    {soundOn ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
                  </div>
                  <span className="text-sm font-medium">UI Micro-Sounds</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${soundOn ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-800'}`}>
                  {soundOn ? "ON" : "OFF"}
                </span>
              </button>

              {/* Copy Current Page Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/60 text-gray-700 dark:text-gray-200 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium">Copy Page Link</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  {copied ? "Copied!" : "Share"}
                </span>
              </button>

              {/* Contact Support */}
              <button
                onClick={() => handleNavigate("/contactus")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/60 text-gray-700 dark:text-gray-200 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Help & Support</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">Help</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-slate-950/50 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-400 flex items-center justify-between">
          <span>Tip: Press <kbd className="font-semibold text-gray-600 dark:text-gray-300">Enter</kbd> to search anywhere</span>
          <span className="font-mono text-[11px]">FondPeace Spotlight</span>
        </div>
      </div>
    </div>
  );
}
