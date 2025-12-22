"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JobAuthGate({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ❌ No token
    if (!token || token === "undefined" || token === "null") {
      router.replace("/JobTension/register");
      return;
    }

    // ❌ Not a JWT (basic structure check)
    const parts = token.split(".");
    if (parts.length !== 3) {
      localStorage.removeItem("token");
      router.replace("/JobTension/register");
      return;
    }

    // ✅ Token exists & looks valid → allow
  }, [router]);

  return children;
}
