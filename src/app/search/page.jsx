// app/search/page.jsx
import React from "react";
import SearchGo from "@/components/SearchGo";
import LeftSidebar from "@/components/LeftSidebar";
import Link from "next/link";

export const metadata = {
  title: "Search Discussions, Creators & Videos | FondPeace",
  description:
    "Search trending social discussions, creators, and short videos on FondPeace — the open social community.",
  alternates: {
    canonical: "https://www.fondpeace.com/search",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "FondPeace Search — Find Creators, Discussions & Shorts",
    description:
      "Explore trending community discussions, creators, and short reels instantly.",
    url: "https://www.fondpeace.com/search",
    siteName: "FondPeace",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://www.fondpeace.com/Fondpeace.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace Search",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FondPeace Search",
    description: "Search creators, discussions, and short reels on FondPeace.",
    images: ["https://www.fondpeace.com/Fondpeace.jpg"],
  },
};

export default function SearchPage() {
  const currentYear = new Date().getFullYear();

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
        {/* Left Sidebar (Sticky on Desktop, Bottom bar on Mobile) */}
        <aside className="shrink-0">
          <LeftSidebar sticky={true} />
        </aside>

        {/* Center Search Area */}
        <main className="w-full min-w-0 pb-20 lg:pb-8">
          {/* Interactive Unified Search & Discovery Engine */}
          <section aria-label="FondPeace Search">
            <SearchGo />
          </section>

          {/* Minimal Brand Footer */}
          <footer className="max-w-4xl mx-auto px-4 mt-12 pt-6 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>© {currentYear} FondPeace. Built for authentic community.</div>
            <div className="flex gap-4">
              <Link href="/aboutus" className="hover:text-blue-500 transition-colors">About</Link>
              <Link href="/contactus" className="hover:text-blue-500 transition-colors">Contact</Link>
              <Link href="/privacypolicy" className="hover:text-blue-500 transition-colors">Privacy</Link>
              <Link href="/termcondition" className="hover:text-blue-500 transition-colors">Terms</Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
