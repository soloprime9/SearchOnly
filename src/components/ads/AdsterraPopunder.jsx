"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ADS_CONFIG, isAdsBlockedPath } from "@/data/adsConfig";

export default function AdsterraPopunder() {
  const pathname = usePathname();

  useEffect(() => {
    const scriptId = "adsterra-popunder-script";
    if (!ADS_CONFIG.enabled || !ADS_CONFIG.popunder?.enabled || isAdsBlockedPath(pathname)) {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
      return;
    }

    if (document.getElementById(scriptId)) return;

    try {
      const script = document.createElement("script");
      script.id = scriptId;
      script.setAttribute("data-cfasync", "false");
      script.src = ADS_CONFIG.popunder.scriptSrc;
      script.async = true;
      document.body.appendChild(script);
    } catch (err) {
      console.warn("Adsterra Popunder notice:", err);
    }
  }, [pathname]);

  return null;
}
