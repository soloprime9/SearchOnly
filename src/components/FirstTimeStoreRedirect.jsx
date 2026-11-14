"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FirstTimeStoreRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const urlParams = new URLSearchParams(window.location.search);
      // If user specifically requests home feed via parameter, don't redirect
      if (urlParams.get("feed") === "true" || urlParams.get("home") === "true") {
        return;
      }

      const hasVisited = localStorage.getItem("fondpeace_has_visited_store_v1");
      if (!hasVisited) {
        localStorage.setItem("fondpeace_has_visited_store_v1", "true");
        router.replace("/store");
      }
    } catch (_) {}
  }, [router]);

  return null;
}
