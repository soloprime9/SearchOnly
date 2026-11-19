"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ADS_CONFIG, isAdsBlockedPath } from "@/data/adsConfig";
import { X, Sparkles } from "lucide-react";

export default function StickyBottomBanner() {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  const blocked = isAdsBlockedPath(pathname);
  if (!ADS_CONFIG.enabled || !ADS_CONFIG.banner320?.enabled || ADS_CONFIG.stickyBottom?.enabled === false || blocked || dismissed) {
    return null;
  }

  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: transparent; display: flex; justify-content: center; align-items: center; overflow: hidden; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '${ADS_CONFIG.banner320.key}',
            'format' : 'iframe',
            'height' : ${ADS_CONFIG.banner320.height},
            'width' : ${ADS_CONFIG.banner320.width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="${ADS_CONFIG.banner320.scriptSrc}"></script>
      </body>
    </html>
  `;

  return (
    <aside
      aria-label="Sponsored Floating Partner"
      className="fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-canvas)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] py-1 px-2 flex flex-col items-center justify-center shadow-[0_-4px_20px_rgba(0,0,0,0.35)] transition-all animate-in fade-in slide-in-from-bottom duration-300"
    >
      <div className="w-full max-w-[360px] flex items-center justify-between px-1 mb-0.5 text-[9px] text-[var(--text-secondary)] font-semibold">
        <span className="flex items-center gap-1 text-amber-500 font-extrabold uppercase tracking-wider">
          <Sparkles className="w-2.5 h-2.5" />
          Sponsored
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition cursor-pointer"
          title="Dismiss ad"
          aria-label="Dismiss ad"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="w-full flex justify-center items-center overflow-hidden">
        <iframe
          key={`sticky-banner-${pathname}`}
          title="Adsterra Sticky Floating Banner"
          srcDoc={iframeContent}
          width="320"
          height="50"
          style={{ border: "none", overflow: "hidden", display: "block" }}
          scrolling="no"
        />
      </div>
    </aside>
  );
}
