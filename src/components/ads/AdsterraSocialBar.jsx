"use client";

import { useEffect } from "react";
import { ADS_CONFIG } from "@/data/adsConfig";

export default function AdsterraSocialBar() {
  useEffect(() => {
    if (!ADS_CONFIG.enabled || !ADS_CONFIG.socialBar.enabled) return;

    const scriptId = "adsterra-social-bar-script";
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
  }, []);

  return null;
}
