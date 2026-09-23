"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Home, Flame, Film, Compass, ArrowLeft, LifeBuoy } from "lucide-react";
import { playTap } from "@/utils/soundEffects";

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      playTap();
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Glowing 404 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>404 • Page Not Found</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-6xl font-black text-gray-950 dark:text-white tracking-tight mb-4">
          Lost in the <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Digital Peace?</span>
        </h1>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-8 leading-relaxed">
          The page or post you are looking for might have been moved, renamed, or does not exist. Discover what's happening right now:
        </p>

        {/* Live Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
          <div className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all">
            <Search className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, creators, or topics..."
              className="w-full px-3 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="m-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shrink-0 shadow-sm"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mb-8">
          <Link
            href="/"
            onClick={() => playTap()}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/70 dark:bg-zinc-950/50 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-md hover:border-blue-500/40 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Home Feed</span>
          </Link>

          <Link
            href="/short/698c432d0a8059958d20a4f4"
            onClick={() => playTap()}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/70 dark:bg-zinc-950/50 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-md hover:border-pink-500/40 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Shorts</span>
          </Link>

          <Link
            href="/search"
            onClick={() => playTap()}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/70 dark:bg-zinc-950/50 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-md hover:border-amber-500/40 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Trending</span>
          </Link>

          <Link
            href="/aboutus"
            onClick={() => playTap()}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/70 dark:bg-zinc-950/50 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-md hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">About Us</span>
          </Link>
        </div>

        {/* Back Link & Support */}
        <div className="flex items-center justify-center gap-6 text-xs sm:text-sm text-gray-500">
          <button
            onClick={() => { playTap(); router.back(); }}
            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
          <Link
            href="/contactus"
            onClick={() => playTap()}
            className="inline-flex items-center gap-1.5 hover:text-gray-800 dark:hover:text-gray-200 font-semibold transition-colors"
          >
            <LifeBuoy className="w-4 h-4" /> Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
