import Link from "next/link";
import VillageClient from "@/components/VillageClient";
import LeftSidebar from "@/components/LeftSidebar";
import SuggestedCreatorsWidget from "@/components/SuggestedCreatorsWidget";
import { Coins, ArrowRight } from "lucide-react";
import { buildFeedHref } from "@/lib/homeFeed";

export default function HomeFeedShell({
  posts = [],
  currentPage = 1,
  hasMore = false,
  totalPages = 1,
  currentType = "all",
}) {
  const pageNumbers = [];
  if (totalPages > 1) {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    if (start > 1) pageNumbers.push(1);
    for (let p = start; p <= end; p++) pageNumbers.push(p);
    if (end < totalPages) pageNumbers.push(totalPages);
  }

  return (
    <main className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-blue-600 selection:text-white overflow-x-hidden transition-colors duration-200">
      <div
        className="
          grid 
          grid-cols-1 
          lg:grid-cols-[76px_minmax(0,1fr)_340px] 
          xl:grid-cols-[220px_minmax(0,1fr)_360px] 
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

        {/* Center Main Discovery Feed */}
        <section className="w-full min-w-0 space-y-4">
          {/* SEO Primary Heading for Google Entity Recognition & Accessibility */}
          <h1 className="sr-only">
            FondPeace - Trending Short Video Reels, Discussions & Social Creator Platform
          </h1>

          {/* Community Feed Stream */}
          <div id="community-feed-stream" className="w-full">
            <VillageClient
              initialPosts={posts}
              initialPage={currentPage}
              initialHasMore={hasMore}
              initialType={currentType}
            />
          </div>

          {/* Server-rendered crawlable pagination links for Googlebot & full archive discovery */}
          {(totalPages > 1 || hasMore || currentPage > 1) && (
            <nav
              aria-label="Feed pages"
              className="flex flex-wrap items-center justify-center gap-2 py-4 px-2 border-t border-[var(--border-subtle)] text-xs font-semibold"
            >
              {currentPage > 1 && (
                <Link
                  href={buildFeedHref(currentPage - 1, currentType)}
                  rel="prev"
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-blue-500/40 transition"
                >
                  ← Previous
                </Link>
              )}

              {pageNumbers.map((p, idx) => {
                const prevNum = pageNumbers[idx - 1];
                const showGap = prevNum && p - prevNum > 1;
                return (
                  <span key={p} className="inline-flex items-center gap-2">
                    {showGap && <span className="text-[var(--text-secondary)] px-1">…</span>}
                    <Link
                      href={buildFeedHref(p, currentType)}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={`px-3 py-1.5 rounded-lg border transition ${
                        p === currentPage
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-blue-500/40"
                      }`}
                    >
                      {p}
                    </Link>
                  </span>
                );
              })}

              {hasMore && (
                <Link
                  href={buildFeedHref(currentPage + 1, currentType)}
                  rel="next"
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-blue-500/40 transition"
                >
                  Older Posts →
                </Link>
              )}
            </nav>
          )}
        </section>

        {/* Right Sidebar */}
        <aside className="hidden lg:block shrink-0">
          <div className="sticky top-4 space-y-4">
            <SuggestedCreatorsWidget variant="card" />

            <div className="rounded-2xl p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg text-[var(--text-primary)]">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <Coins className="w-3 h-3 text-blue-500" />
                  Creator Program
                </span>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">
                  Open Access
                </span>
              </div>
              <h3 className="text-sm font-black text-[var(--text-primary)] tracking-tight mb-1">
                Grow as a Creator
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                Publish original posts and short videos, track audience insights, and explore transparent creator partnerships on FondPeace.
              </p>
              <Link
                href="/monetization"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition active:scale-95 shadow-md shadow-blue-500/20"
              >
                <span>Explore Creator Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 text-[var(--text-primary)] shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs text-white">
                    F
                  </div>
                  <span className="font-black text-sm tracking-tight text-[var(--text-primary)]">FondPeace</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-full">
                  Community
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                FondPeace is an independent, community-driven social and video platform built to support authentic discussions, original content creation, and creator monetization.
              </p>
            </div>

            <div className="p-3 text-[11px] text-zinc-500">
              <div className="flex flex-wrap gap-y-2 gap-x-3 leading-relaxed">
                <Link href="/aboutus" className="hover:text-white transition">About Us</Link>
                <Link href="/contactus" className="hover:text-white transition">Contact Us</Link>
                <Link href="/search" className="hover:text-white transition">Explore</Link>
                <Link href="/privacypolicy" className="hover:text-white transition">Privacy Policy</Link>
                <Link href="/termcondition" className="hover:text-white transition">Terms</Link>
                <Link href="/disclaimer" className="hover:text-white transition">Disclaimer</Link>
                <Link href="/DMCA" className="hover:text-white transition">DMCA</Link>
                <Link href="/signup" className="hover:text-white transition">Signup</Link>
                <Link href="/login" className="hover:text-white transition">Login</Link>
                <Link href="https://x.com/FondPeaceTech" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Twitter</Link>
                <Link href="https://www.instagram.com/fondpeacetecho/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Instagram</Link>
                <Link href="https://www.youtube.com/@FondPeaceUpdate/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Youtube</Link>
                <Link href="/upload" className="hover:text-white transition">Upload</Link>
                <Link href="/search" className="hover:text-white transition">Explore</Link>
                <Link href="/monetization" className="hover:text-white transition">Monetize</Link>
              </div>
              <div className="mt-3 text-zinc-600 text-[10.5px] font-medium">
                © {new Date().getFullYear()} FondPeace Inc. All rights reserved.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
