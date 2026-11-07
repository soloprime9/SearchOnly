'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";
import EditProfile from "@/components/EditProfile";
import LeftSidebar from "@/components/LeftSidebar";

export default function EditRootPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login?redirect=/edit");
      return;
    }
    try {
      const decoded = jwt.decode(token);
      if (decoded?.username) {
        router.replace(`/edit/${decoded.username}`);
      }
    } catch (_) {}
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
      <div
        className="
          grid 
          grid-cols-1 
          lg:grid-cols-[76px_minmax(0,1fr)] 
          xl:grid-cols-[220px_minmax(0,1fr)] 
          max-w-[1440px] 
          mx-auto
          gap-4 lg:gap-6
          px-2 sm:px-4
          py-3
        "
      >
        <aside className="shrink-0">
          <LeftSidebar sticky={true} />
        </aside>
        <main className="w-full min-w-0 max-w-2xl mx-auto py-4 sm:py-6 pb-20 lg:pb-8">
          <EditProfile initialUsername="" />
        </main>
      </div>
    </div>
  );
}
