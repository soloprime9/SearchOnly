"use client";

import { useEffect } from "react";
import { ADS_CONFIG } from "@/data/adsConfig";
import { Sparkles } from "lucide-react";

export default function AdsterraNativeBanner({ className = "" }) {
  useEffect(() => {
    if (!ADS_CONFIG.enabled || !ADS_CONFIG.nativeBanner?.enabled) return;

    const scriptId = "adsterra-native-banner-script";
    if (!document.getElementById(scriptId)) {
      try {
        const script = document.createElement("script");
        script.id = scriptId;
        script.setAttribute("data-cfasync", "false");
        script.async = true;
        script.src = ADS_CONFIG.nativeBanner.scriptSrc;
        document.body.appendChild(script);
      } catch (err) {
        console.warn("Adsterra Native Banner notice:", err);
      }
    }
  }, []);

  if (!ADS_CONFIG.enabled || !ADS_CONFIG.nativeBanner?.enabled) return null;

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

      {/* Adsterra Native Container */}
      <div className="w-full min-h-[140px] flex justify-center items-center py-1">
        <div id={ADS_CONFIG.nativeBanner.containerId} className="w-full" />
      </div>
    </div>
  );
}
