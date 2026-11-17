"use client";

import { useEffect, useRef } from "react";
import { ADS_CONFIG } from "@/data/adsConfig";
import { Sparkles } from "lucide-react";

export default function AdsterraBanner320({ className = "" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!ADS_CONFIG.enabled || !ADS_CONFIG.banner320.enabled) return;

    const node = containerRef.current;
    if (!node || node.firstChild) return;

    try {
      // Configuration script
      const confScript = document.createElement("script");
      confScript.type = "text/javascript";
      confScript.innerHTML = `
        atOptions = {
          'key' : '${ADS_CONFIG.banner320.key}',
          'format' : 'iframe',
          'height' : ${ADS_CONFIG.banner320.height},
          'width' : ${ADS_CONFIG.banner320.width},
          'params' : {}
        };
      `;

      // Invocation script
      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src = ADS_CONFIG.banner320.scriptSrc;
      invokeScript.async = true;

      node.appendChild(confScript);
      node.appendChild(invokeScript);
    } catch (err) {
      console.warn("Adsterra 320x50 Banner load notice:", err);
    }
  }, []);

  if (!ADS_CONFIG.enabled || !ADS_CONFIG.banner320.enabled) return null;

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
        <div
          ref={containerRef}
          style={{ minHeight: "50px", minWidth: "320px", display: "flex", justifyContent: "center", alignItems: "center" }}
          className="rounded-xl overflow-hidden"
        />
      </div>
    </div>
  );
}
