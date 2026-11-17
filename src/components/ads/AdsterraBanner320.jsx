"use client";

import { useEffect, useRef } from "react";
import { ADS_CONFIG } from "@/data/adsConfig";

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
    <div className={`w-full flex justify-center items-center my-3 overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        style={{ minHeight: "50px", minWidth: "320px", maxWidth: "100%" }}
        className="flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-lg border border-[var(--border-subtle)]"
      />
    </div>
  );
}
