"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ADS_CONFIG, isAdsBlockedPath } from "@/data/adsConfig";

export default function AdsterraSocialBar() {
  const pathname = usePathname();

  useEffect(() => {
    const scriptId = "adsterra-social-bar-script";
    if (!ADS_CONFIG.enabled || !ADS_CONFIG.socialBar.enabled || isAdsBlockedPath(pathname)) {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
      return;
    }

    if (document.getElementById(scriptId)) return;

    try {
      const script = document.createElement("script");
      script.id = scriptId;
      script.setAttribute("data-cfasync", "false");
      script.src = ADS_CONFIG.socialBar.scriptSrc;
      script.async = true;
      document.body.appendChild(script);
    } catch (err) {
      console.warn("Adsterra Social Bar notice:", err);
    }
  }, [pathname]);

  return null;
}
