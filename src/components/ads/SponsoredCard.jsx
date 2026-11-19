"use client";

import { usePathname } from "next/navigation";
import { ADS_CONFIG, isAdsBlockedPath } from "@/data/adsConfig";
import { Sparkles, ExternalLink, Flame } from "lucide-react";

export default function SponsoredCard({ className = "" }) {
  const pathname = usePathname();
  const blocked = isAdsBlockedPath(pathname);

  if (!ADS_CONFIG.enabled || !ADS_CONFIG.smartlink?.enabled || blocked) {
    return null;
  }

  const smartlinkUrl = ADS_CONFIG.smartlink.url;
  if (!smartlinkUrl) return null;

  return (
    <div
      className={`w-full max-w-[600px] mx-auto my-3 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/25 shadow-lg text-[var(--text-primary)] transition-all hover:border-amber-400/40 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Flame className="w-3 h-3 text-amber-400" />
          Sponsored Partner
        </span>
        <span className="text-[10px] font-mono text-zinc-400">Ad</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Trending Partner Rewards & Offers</span>
          </h4>
          <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
            Exclusive deals, trending downloads, and rewards from verified FondPeace partners.
          </p>
        </div>

        <a
          href={smartlinkUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 shrink-0"
        >
          <span>Check Offer</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
