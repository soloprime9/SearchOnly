"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, FileText, ArrowLeft, Clock } from "lucide-react";
import { playTap } from "@/utils/soundEffects";

const LEGAL_NAV = [
  { label: "About Us", href: "/aboutus" },
  { label: "Privacy Policy", href: "/privacypolicy" },
  { label: "Terms of Service", href: "/termcondition" },
  { label: "DMCA Policy", href: "/DMCA" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Contact Us", href: "/contactus" },
];

export default function LegalPageLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}) {
  const pathname = usePathname();

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-12 px-3 sm:px-4">
      {/* Top Breadcrumb Link */}
      <div className="mb-4">
        <Link
          href="/"
          onClick={() => playTap()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Main Glass Document Card */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-white/80 dark:bg-zinc-950/70 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.4)]">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-72 h-36 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Header */}
        <header className="relative z-10 mb-8 border-b border-black/[0.06] dark:border-white/[0.06] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FondPeace Official Policies</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-950 dark:text-white mb-2">
            {title}
          </h1>

          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}

          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mt-3">
              <Clock className="w-3 h-3" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          )}
        </header>

        {/* Navigation Tabs Pill Bar */}
        <nav className="relative z-10 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-8 border-b border-black/[0.04] dark:border-white/[0.06]">
          {LEGAL_NAV.map((tab, i) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={i}
                href={tab.href}
                onClick={() => playTap()}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all shrink-0 whitespace-nowrap ${
                  active
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                    : "bg-black/[0.03] dark:bg-white/[0.04] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Article Body with High-Contrast Typography */}
        <article className="relative z-10 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
          {children}
        </article>
      </div>
    </div>
  );
}
