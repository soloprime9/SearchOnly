"use client";

import { usePathname } from "next/navigation";
import { ADS_CONFIG, isAdsBlockedPath } from "@/data/adsConfig";
import { Sparkles } from "lucide-react";

export default function AdsterraBanner320({ className = "" }) {
  const pathname = usePathname();
  const blocked = isAdsBlockedPath(pathname);

  if (!ADS_CONFIG.enabled || !ADS_CONFIG.banner320?.enabled || blocked) return null;

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
    <div className={`w-full max-w-[600px] mx-auto my-3 p-3 sm:p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-md flex flex-col items-center justify-center transition-all ${className}`}>
      {/* Sponsored Header Bar */}
      <div className="w-full flex items-center justify-between px-2 mb-2 pb-1.5 border-b border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-secondary)]">
        <span className="flex items-center gap-1.5 text-amber-500 font-extrabold uppercase tracking-wider text-[10px]">
          <Sparkles className="w-3.5 h-3.5" />
          Sponsored Partner
        </span>
        <span className="text-[10px] text-zinc-400 font-medium">Ad</span>
      </div>

      {/* Centered Adsterra Unit */}
      <div className="w-full flex justify-center items-center py-1 overflow-x-auto">
        <iframe
          key={`banner320-${pathname}`}
          title="Adsterra 320x50 Banner"
          srcDoc={iframeContent}
          width="320"
          height="50"
          style={{ border: "none", overflow: "hidden", display: "block" }}
          scrolling="no"
        />
      </div>
    </div>
  );
}
