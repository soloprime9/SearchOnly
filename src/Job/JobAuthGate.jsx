"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import jwtDecode from "jwt-decode";

export default function JobAuthGate({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/JobTension/register");
      return;
    }

    try {
      jwtDecode(token); // basic validation
    } catch {
      localStorage.removeItem("token");
      router.replace("/JobTension/register");
    }
  }, [router]);

  return children;
}
