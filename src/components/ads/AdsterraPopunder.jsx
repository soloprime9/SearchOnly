"use client";

import { useEffect } from "react";
import { ADS_CONFIG } from "@/data/adsConfig";

export default function AdsterraPopunder() {
  useEffect(() => {
    if (!ADS_CONFIG.enabled || !ADS_CONFIG.popunder?.enabled) return;

    const scriptId = "adsterra-popunder-script";
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
  }, []);

  return null;
}
