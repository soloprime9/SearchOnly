"use client";

import React, { useState } from "react";
import Link from "next/link";
import LeftSidebar from "@/components/LeftSidebar";
import {
  Sparkles,
  TrendingUp,
  Users,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  FileCheck2,
  Mail,
} from "lucide-react";
import { playTap } from "@/utils/soundEffects";

export default function MonetizationPage() {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "What types of content are eligible for the FondPeace Creator Program?",
      a: "Original posts, thoughtful community discussions, original photography, and original short-form videos or reels are eligible for creator review. Reuploaded, scraped, spam, or copyrighted third-party material without permission is not eligible.",
    },
    {
      q: "Does FondPeace guarantee fixed earnings or payouts?",
      a: "No. FondPeace does not promise guaranteed income, fixed RPM rates, or automatic payouts. Creator monetization and partnership opportunities depend on content originality, genuine audience engagement, brand campaign availability, and compliance review.",
    },
    {
      q: "How can creators collaborate with brands or sponsors on FondPeace?",
      a: "Creators who maintain an active, authentic profile with original content can connect with our team via the Contact page for verified sponsor collaborations, featured community campaigns, and creator spotlight opportunities.",
    },
    {
      q: "What guidelines must creators follow to stay in good standing?",
      a: "All creators must follow our Terms & Conditions and DMCA Copyright Policy, avoid misleading clickbait or automated engagement, and clearly disclose any sponsored posts or paid partnerships.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-[76px_minmax(0,1fr)]
          xl:grid-cols-[220px_minmax(0,1fr)]
          max-w-[1440px]
          mx-auto
          gap-4 lg:gap-6
          px-2 sm:px-4
          py-3
        "
      >
        <aside className="shrink-0">
          <LeftSidebar sticky={true} />
        </aside>

        <main className="w-full min-w-0 max-w-5xl mx-auto py-6 sm:py-10 pb-24 lg:pb-12 px-2">
          {/* ─── Hero Header ─── */}
          <header className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FondPeace Creator Program</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-950 dark:text-white leading-[1.15]">
              Creator Tools, Reach &amp;{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Sustainable Growth
              </span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
              FondPeace gives independent writers, filmmakers, and community voices clean distribution, transparent analytics, and structured partnership pathways — built around originality rather than hype or false promises.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/upload"
                onClick={() => playTap()}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Start Publishing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#eligibility"
                onClick={() => playTap()}
                className="px-6 py-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 font-bold text-sm border border-black/10 dark:border-white/10 transition-all active:scale-95"
              >
                Review Guidelines
              </a>
            </div>
          </header>

          {/* ─── 4 Realistic Program Pillars ─── */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14" aria-label="Creator Program Features">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950/70 border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Audience Analytics
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Track impressions, views, replies, bookmarks, and topic discovery across your posts and short videos inside your creator dashboard.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950/70 border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Organic Distribution
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Posts and vertical shorts receive clean, fast-loading watch pages and topic indexing so new audiences can discover your work naturally.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950/70 border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Brand Partnerships
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Eligible creators can partner directly with brands and community sponsors for transparent, clearly labeled product showcases and collaborations.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950/70 border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Creator Attribution
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Every upload stays tied to your public creator profile with clear ownership, comment controls, and DMCA copyright protection.
              </p>
            </div>
          </section>

          {/* ─── Honest Monetization & Ad Placement Model ─── */}
          <section className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-950/80 border border-black/10 dark:border-white/10 shadow-sm mb-14">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 text-xs font-bold mb-3">
                <FileCheck2 className="w-3.5 h-3.5 text-blue-500" />
                <span>How Creator Monetization Works</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                Transparent Standards Without Unrealistic Promises
              </h2>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                FondPeace sustains platform hosting and infrastructure through selective in-feed ad placements and creator partnerships. As creator monetization features expand, participation is evaluated case-by-case based on genuine audience engagement, original content quality, and policy compliance.
              </p>
              <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong>Transparency Notice:</strong> FondPeace does not guarantee fixed monthly income, per-view payout rates, or instant monetization approval. Revenue opportunities depend on active advertiser campaigns, regional demand, and adherence to our{" "}
                <Link href="/termcondition" className="underline font-semibold">
                  Terms &amp; Conditions
                </Link>
                .
              </div>
            </div>
          </section>

          {/* ─── Creator Eligibility Standards ─── */}
          <section id="eligibility" className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-950/70 border border-black/10 dark:border-white/10 shadow-sm mb-14">
            <div className="max-w-2xl mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                Program Eligibility &amp; Quality Standards
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                To keep FondPeace safe and valuable for readers and advertisers, creators applying for partner features must meet these baseline standards:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    100% Original Content
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Publish authentic commentary, videos, or photography that you created or have full rights to share.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Consistent Activity
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Maintain an active profile with genuine community discussions and real follower engagement.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Policy &amp; DMCA Standing
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Zero spam, automated bot traffic, adult/prohibited material, or unresolved copyright strikes.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <Users className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Interested in creator partnerships or brand campaigns?</span>
              </div>
              <Link
                href="/contactus"
                onClick={() => playTap()}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95 inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Contact Partner Team</span>
              </Link>
            </div>
          </section>

          {/* ─── Frequently Asked Questions ─── */}
          <section className="max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white text-center mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="rounded-2xl bg-white dark:bg-zinc-950/60 border border-black/[0.08] dark:border-white/[0.08] overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        playTap();
                        setOpenFaq(isOpen ? null : i);
                      }}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 font-bold text-sm sm:text-base text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 shrink-0 text-gray-400" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-black/[0.04] dark:border-white/[0.04] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
