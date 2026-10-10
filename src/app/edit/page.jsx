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
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200 flex justify-center gap-6 px-2 sm:px-6 py-4 sm:py-8">
      <aside className="hidden lg:block w-[72px] shrink-0">
        <LeftSidebar />
      </aside>
      <main className="w-full max-w-2xl shrink-0">
        <EditProfile initialUsername="" />
      </main>
    </div>
  );
}
