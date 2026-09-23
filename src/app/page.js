import Link from "next/link";
import VillageClient from "@/components/VillageClient";
import LeftSidebar from "@/components/LeftSidebar";
import TrendingShortsRail from "@/components/TrendingShortsRail";
import SuggestedCreatorsWidget from "@/components/SuggestedCreatorsWidget";
import { Coins, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { getApiBase } from "@/utils/apiConfig";

const API_BASE = getApiBase();


/* =========================
   METADATA (GOOGLE SAFE)
========================= */
export const metadata = {
  title: "FondPeace - Modern Community & Creator Platform",
  description:
    "FondPeace is an upgraded independent platform for thoughtful discussions, trending short video reels, creator monetization, and meaningful community conversations.",

  keywords: [
    "Trending",
    "Viral Videos",
    "Shorts",
    "Fondpeace",
    "Videos",
    "Viral Posts",
    "Creator Monetization",
    "Discussions",
  ],

  authors: [{ name: "Aman Kumar" }],

  robots: "index, follow",
  alternates: {
    canonical: "https://www.fondpeace.com",
  },

  openGraph: {
    type: "website",
    siteName: "FondPeace",
    title: "FondPeace - Community & Creators",
    description:
      "Join FondPeace to discover meaningful discussions, trending short reels, and participate in respectful community conversations.",
    url: "https://www.fondpeace.com",
    images: [
      {
        url: "https://www.fondpeace.com/FondPeace-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace community platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "FondPeace",
    description:
      "FondPeace is a modern platform for discussions, ideas, trending video shorts, and creator growth.",
    images: ["https://www.fondpeace.com/FondPeace-1200x630.jpg"],
  },
};

/* =========================
   HOMEPAGE COMPONENT
========================= */
export default async function HomePage() {
  let posts = [];

  try {
    const res = await fetch(`${API_BASE}/post/mango/getall?page=1&limit=20`, {
      next: { revalidate: 30 },
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      // Check if data already contains diverse post types
      const hasNonVideo = data.some(
        (p) =>
          p.mediaType === "image" ||
          p.mediaType === "text" ||
          p.mediaType === "discussion" ||
          (p.media && !p.media.endsWith(".mp4")) ||
          !p.media
      );

      if (hasNonVideo) {
        posts = data;
      } else {
        // Concurrently query image and discussion posts to weave them into the feed
        const [imagesRes, textRes] = await Promise.all([
          fetch(`${API_BASE}/post/mango/getall?page=1&limit=10&type=image`, { next: { revalidate: 30 } })
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
          fetch(`${API_BASE}/post/mango/getall?page=1&limit=10&type=discussion`, { next: { revalidate: 30 } })
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
        ]);

        const nonVideos = [
          ...(Array.isArray(imagesRes) ? imagesRes : []),
          ...(Array.isArray(textRes) ? textRes : []),
        ];

        if (nonVideos.length > 0) {
          const interleaved = [];
          const maxLen = Math.max(data.length, nonVideos.length);
          const seen = new Set();
          for (let i = 0; i < maxLen; i++) {
            if (i < nonVideos.length && !seen.has(nonVideos[i]._id)) {
              seen.add(nonVideos[i]._id);
              interleaved.push(nonVideos[i]);
            }
            if (i < data.length && !seen.has(data[i]._id)) {
              seen.add(data[i]._id);
              interleaved.push(data[i]);
            }
          }
          posts = interleaved;
        } else {
          posts = data;
        }
      }
    }
  } catch (err) {
    posts = [];
  }

  return (
    <main className="min-h-screen w-full bg-zinc-950 text-white selection:bg-white selection:text-black overflow-x-hidden">
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

          {/* Trending Shorts Horizontal Rail (Live from Database) */}
          <TrendingShortsRail />

          {/* Community Feed Stream with Clean Video Display */}
          <div id="community-feed-stream" className="w-full">
            <VillageClient initialPosts={posts} />
          </div>
        </section>

        {/* Right Sidebar (Modern Upgraded Aesthetic) */}
        <aside className="hidden lg:block shrink-0">
          <div className="sticky top-4 space-y-4">

            {/* Suggested Creators Widget (Live from Database) */}
            <SuggestedCreatorsWidget variant="card" />

            {/* Creator Monetization Spotlight Card */}
            <div className="rounded-2xl p-5 bg-black border border-white/10 shadow-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/10 text-white border border-white/20">
                  <Coins className="w-3 h-3 text-amber-400" />
                  Creator Program
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  95% Payout
                </span>
              </div>
              <h3 className="text-sm font-black text-white tracking-tight mb-1">
                Monetize Your Content
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Keep 95% of direct community tips and earn 60% ad revenue from viral posts and short video reels.
              </p>
              <Link
                href="/monetization"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-zinc-200 transition active:scale-95 shadow-md shadow-white/10"
              >
                <span>Join Monetization</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* FondPeace Platform Mission Card */}
            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-5 text-white shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs text-white">
                    F
                  </div>
                  <span className="font-black text-sm tracking-tight">FondPeace</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 border border-white/10 px-2 py-0.5 rounded-full">
                  Community
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                FondPeace is an independent, community-driven social and video platform built to support authentic discussions, original content creation, and creator monetization.
              </p>
            </div>

            {/* Official Footer Navigation Links */}
            <div className="p-3 text-[11px] text-zinc-500">
              <div className="flex flex-wrap gap-y-2 gap-x-3 leading-relaxed">
                <Link href="/aboutus" className="hover:text-white transition">About Us</Link>
                <Link href="/contactus" className="hover:text-white transition">Contact Us</Link>
                <Link href="/blog" className="hover:text-white transition">Blog</Link>
                <Link href="/privacypolicy" className="hover:text-white transition">Privacy Policy</Link>
                <Link href="/termcondition" className="hover:text-white transition">Terms</Link>
                <Link href="/disclaimer" className="hover:text-white transition">Disclaimer</Link>
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
