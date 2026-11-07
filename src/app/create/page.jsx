"use client";

import React from 'react';
import CreatePage from "@/components/CreatePage";
import LeftSidebar from "@/components/LeftSidebar";

export default function Create() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
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
        {/* Left Sidebar */}
        <aside className="shrink-0">
          <LeftSidebar sticky={true} />
        </aside>

        {/* Center Creator Studio */}
        <main className="w-full min-w-0 max-w-4xl mx-auto py-4 sm:py-8 pb-20 lg:pb-8">
          <CreatePage />
        </main>
      </div>
    </div>
  );
}
