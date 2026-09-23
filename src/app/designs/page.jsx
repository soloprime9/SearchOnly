"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2, Smartphone, Monitor, Sparkles, CheckCircle2 } from "lucide-react";

const DESIGNS = [
  {
    id: "home",
    title: "1. Home Feed Interface",
    tag: "Feed & Discovery",
    desc: "Clean glassmorphic navigation, in-feed 5-second composer, ambient glow video cards, interactive reactions bar, and clickable topic hashtags.",
    image: "/designs/home_feed_ui.jpg",
    features: [
      "Glassmorphism Frosted Top Header",
      "In-Feed Creator Composer (Thought, Poll, Link)",
      "Ambient Mode Video Backlight Glow",
      "Clickable Inline #Hashtags & @Mentions",
      "Smart 1-Click TL;DR Key Takeaways"
    ]
  },
  {
    id: "shorts",
    title: "2. Fullscreen Shorts & Reels View",
    tag: "9:16 Video Player",
    desc: "Vertical edge-to-edge video player with right-side floating interaction dock, pulsating audio vinyl disc, and verified creator overlay.",
    image: "/designs/shorts_reels_ui.jpg",
    features: [
      "9:16 Fullscreen Vertical Snap Layout",
      "Floating Right Action Dock (Likes, Comments, Repost, Share)",
      "Spinning Vinyl Record & Soundwave Equalizer",
      "Double-Tap 10s Seek (Rewind/Forward)",
      "Pre-buffered Zero Lag Instant Play"
    ]
  },
  {
    id: "profile",
    title: "3. Creator Profile & Studio Dashboard",
    tag: "Creator Hub",
    desc: "Hero fluid gradient banner, story aura avatar, verified shield badges, live metrics counters, and 3-column media portfolio grid.",
    image: "/designs/creator_profile_ui.jpg",
    features: [
      "Fluid Gradient Hero Banner",
      "Dual Verification: Blue Creator Tick + Green Email Shield",
      "Real-Time Metrics: Followers, Total Views, Appreciations",
      "Connected Social Handles (YouTube, Instagram, TikTok, X)",
      "3-Column Media Grid with Live Hover View Counters"
    ]
  }
];

export default function DesignShowcasePage() {
  const [activeTab, setActiveTab] = useState("home");
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const current = DESIGNS.find((d) => d.id === activeTab) || DESIGNS[0];

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-4 sm:p-8 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                FondPeace Visual Design Gallery
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                2026 UI System
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              High-fidelity visual templates, transitions & responsive layouts
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span>Back to App</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto mt-8">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl max-w-xl mx-auto mb-8">
          {DESIGNS.map((design) => (
            <button
              key={design.id}
              onClick={() => setActiveTab(design.id)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === design.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {design.title.split(". ")[1]}
            </button>
          ))}
        </div>

        {/* Showcase Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center: Big Visual Image Card */}
          <div className="lg:col-span-8 bg-zinc-950/80 rounded-3xl p-3 sm:p-4 border border-white/10 shadow-2xl relative group overflow-hidden">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video sm:aspect-auto flex items-center justify-center">
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-auto max-h-[620px] object-contain rounded-2xl cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.01]"
                onClick={() => setFullscreenImage(current.image)}
              />

              {/* Click to Zoom Overlay Button */}
              <button
                onClick={() => setFullscreenImage(current.image)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                title="View Fullscreen High-Res"
              >
                <Maximize2 size={18} />
              </button>
            </div>
          </div>

          {/* Right: Detailed Architecture & Specs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-950/60 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <span className="px-3 py-1 text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full inline-block mb-3">
                {current.tag}
              </span>
              <h2 className="text-xl font-extrabold text-white">{current.title}</h2>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                {current.desc}
              </p>

              <div className="mt-6 pt-5 border-t border-white/10">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-400" />
                  <span>Key Visual Highlights</span>
                </h3>
                <ul className="space-y-2.5">
                  {current.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Device Responsiveness Note */}
            <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/30 border border-blue-500/20 rounded-3xl p-5">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-2">
                <Smartphone size={15} />
                <Monitor size={15} />
                <span>Device Adaptability</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Every element automatically scales from 375px mobile screens (touch gestures, bottom docks) to 4K ultra-wide desktop monitors (ambient glow, multi-column feed).
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Lightbox Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Fullscreen preview"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
          />
        </div>
      )}
    </div>
  );
}
