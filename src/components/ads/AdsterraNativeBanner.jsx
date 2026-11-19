"use client";

import { usePathname } from "next/navigation";
import { ADS_CONFIG, isAdsBlockedPath } from "@/data/adsConfig";
import { Sparkles } from "lucide-react";

export default function AdsterraNativeBanner({ className = "" }) {
  const pathname = usePathname();
  const blocked = isAdsBlockedPath(pathname);

  if (!ADS_CONFIG.enabled || !ADS_CONFIG.nativeBanner?.enabled || blocked) return null;

  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: transparent; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; display: flex; justify-content: center; align-items: center; min-height: 140px; }
        </style>
      </head>
      <body>
        <div id="${ADS_CONFIG.nativeBanner.containerId}"></div>
        <script async="async" data-cfasync="false" src="${ADS_CONFIG.nativeBanner.scriptSrc}"></script>
      </body>
    </html>
  `;

  return (
    <div
      className={`w-full max-w-[600px] mx-auto my-3 p-3 sm:p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-md flex flex-col items-center justify-center transition-all ${className}`}
    >
      {/* Sponsored Header Bar */}
      <div className="w-full flex items-center justify-between px-2 mb-2 pb-1.5 border-b border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-secondary)]">
        <span className="flex items-center gap-1.5 text-amber-500 font-extrabold uppercase tracking-wider text-[10px]">
          <Sparkles className="w-3.5 h-3.5" />
          Sponsored Recommendations
        </span>
        <span className="text-[10px] text-zinc-400 font-medium">Ad</span>
      </div>

      {/* Adsterra Native Container in Isolated Iframe */}
      <div className="w-full min-h-[140px] flex justify-center items-center py-1 overflow-hidden">
        <iframe
          key={`native-banner-${pathname}`}
          title="Adsterra Native Recommendation Banner"
          srcDoc={iframeContent}
          width="100%"
          height="160"
          style={{ border: "none", overflow: "hidden", display: "block", minHeight: "140px" }}
          scrolling="no"
        />
      </div>
    </div>
  );
}
