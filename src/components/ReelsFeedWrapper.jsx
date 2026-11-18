// src/components/ReelsFeedWrapper.jsx
"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

// Load interactive ReelsFeed on client without hydration mismatches,
// while rendering a visible, prominent SSR watch player shell for crawlers & instant paint
const ReelsFeed = dynamic(() => import("./ReelsFeed"), {
  ssr: false,
});

export default function ReelsFeedWrapper({ ssrFallback = null, ...props }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return ssrFallback;
  }

  return <ReelsFeed {...props} />;
}
