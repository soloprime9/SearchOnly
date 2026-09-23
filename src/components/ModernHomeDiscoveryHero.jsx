"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  MessageSquare, 
  Film, 
  BarChart3, 
  Coins, 
  Sparkles, 
  PlusCircle, 
  ArrowRight, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Zap,
  Share2
} from "lucide-react";
import { playTap, playPop } from "@/utils/soundEffects";

export default function ModernHomeDiscoveryHero({ onSelectCategory }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const pillars = [
    {
      id: "discussions",
      title: "Community Discussions",
      tag: "Discussions & Ideas",
      desc: "Share essays, insights, open questions, and thoughtful perspectives.",
      icon: MessageSquare,
      actionText: "Read Discussions",
      badge: "Open Feed",
      action: () => {
        playTap();
        if (onSelectCategory) onSelectCategory("discussion");
        const feedElem = document.getElementById("community-feed-stream");
        if (feedElem) feedElem.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      id: "shorts",
      title: "Viral Shorts & Reels",
      tag: "9:16 Video Player",
      desc: "Full-screen vertical videos, instant audio, and creator highlights.",
      icon: Film,
      href: "/short/698c432d0a8059958d20a4f4",
      actionText: "Watch Shorts",
      badge: "Live",
    },
    {
      id: "polls",
      title: "Interactive Polls",
      tag: "Community Pulse",
      desc: "Vote on hot debates, compare community opinions, and see live results.",
      icon: BarChart3,
      actionText: "Vote in Polls",
      badge: "Real-time",
      action: () => {
        playTap();
        if (onSelectCategory) onSelectCategory("discussion");
        const feedElem = document.getElementById("community-feed-stream");
        if (feedElem) feedElem.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      id: "monetization",
      title: "Creator Monetization",
      tag: "Earn & Grow",
      desc: "Get tipped with a 95% revenue split and share 60% ad revenue.",
      icon: Coins,
      href: "/monetization",
      actionText: "Creator Hub",
      badge: "95% Split",
    },
  ];

  return (
    <div className="w-full mb-6 text-white select-none">
      {/* ─── Hero Container (Monochrome Minimalist Luxury) ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-white/[0.12] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        
        {/* Subtle monochrome ambient backlight glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/20 text-white text-[11px] font-bold tracking-wide uppercase">
              <Zap className="w-3 h-3 fill-white text-white" />
              <span>FondPeace Platform</span>
              <span className="w-1 h-1 rounded-full bg-white/60" />
              <span className="text-zinc-400 normal-case font-medium">Community & Creators</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Where Ideas, Video & Creators Connect.
            </h1>

            {/* Subtitle / Value Prop */}
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              Explore authentic discussions, viral 9:16 short reels, and interactive community polls. 
              Share your voice and earn directly with transparent creator monetization.
            </p>
          </div>

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => {
              playPop();
              setIsExpanded(!isExpanded);
            }}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-zinc-400 hover:text-white transition active:scale-95 shrink-0"
            title={isExpanded ? "Collapse Guide" : "Expand Guide"}
            aria-label="Toggle Guide"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="relative z-10 mt-5 pt-5 border-t border-white/[0.08] space-y-5 animate-in fade-in duration-200">
            
            {/* 4 Feature Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pillars.map((pillar) => {
                const IconComponent = pillar.icon;
                const Content = (
                  <div className="h-full flex flex-col justify-between p-3.5 rounded-2xl bg-black/60 border border-white/[0.08] hover:border-white/30 hover:bg-white/[0.04] transition-all duration-200 group">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.08] group-hover:bg-white text-white group-hover:text-black flex items-center justify-center transition-all duration-200">
                          <IconComponent size={16} />
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/[0.06] text-zinc-300 border border-white/10">
                          {pillar.badge}
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-white group-hover:text-white transition-colors">
                        {pillar.title}
                      </h2>
                      <p className="text-[11.5px] text-zinc-400 mt-1 leading-snug">
                        {pillar.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-zinc-300 group-hover:text-white">
                      <span>{pillar.actionText}</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );

                if (pillar.href) {
                  return (
                    <Link
                      key={pillar.id}
                      href={pillar.href}
                      onClick={() => playTap()}
                      className="block text-left"
                    >
                      {Content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={pillar.action}
                    className="block text-left w-full cursor-pointer"
                  >
                    {Content}
                  </button>
                );
              })}
            </div>

            {/* Visual Platform Metrics Ribbon (Lightly Contrasting Glass Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-white text-black flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  50K+
                </div>
                <div className="text-[11px] leading-tight truncate">
                  <span className="font-bold text-white block truncate">Thinkers</span>
                  <span className="text-zinc-400 text-[10px] truncate">Open community</span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-white text-black flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  120K+
                </div>
                <div className="text-[11px] leading-tight truncate">
                  <span className="font-bold text-white block truncate">Reels Watched</span>
                  <span className="text-zinc-400 text-[10px] truncate">9:16 Shorts views</span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-white text-black flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  95%
                </div>
                <div className="text-[11px] leading-tight truncate">
                  <span className="font-bold text-white block truncate">Tip Payout</span>
                  <span className="text-zinc-400 text-[10px] truncate">Direct to creators</span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-white text-black flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                  0s
                </div>
                <div className="text-[11px] leading-tight truncate">
                  <span className="font-bold text-white block truncate">Zero Lag</span>
                  <span className="text-zinc-400 text-[10px] truncate">Instant playback</span>
                </div>
              </div>
            </div>

            {/* Quick Action Dock */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/80 border border-white/[0.1]">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Ready to share your voice with the world?</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href="/upload"
                  onClick={() => playTap()}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-zinc-200 transition active:scale-95 shadow-md shadow-white/10"
                >
                  <PlusCircle size={14} />
                  <span>Create Post</span>
                </Link>

                <Link
                  href="/short/698c432d0a8059958d20a4f4"
                  onClick={() => playTap()}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-xs border border-white/15 transition active:scale-95"
                >
                  <Film size={14} />
                  <span>Watch Shorts</span>
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
