// app/search/page.jsx
// Production SEO optimized search page with modern Gen-Z 2026 aesthetics
import React from "react";
import SearchGo from "@/components/SearchGo";
import Link from "next/link";
import { Sparkles, Compass, ShieldCheck, HelpCircle, Layers, ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Search Discussions, Creators & Videos | FondPeace",
  description:
    "Search trending social discussions, creator posts, and short videos on FondPeace — the open social community.",
  alternates: {
    canonical: "https://www.fondpeace.com/search",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "FondPeace Search — Find Trending News & Viral Videos",
    description:
      "Explore trending news, viral videos, AI updates, tech, entertainment & more — instantly.",
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
    title: "FondPeace Search — Fast Trending News & Viral Videos",
    description:
      "Search global news, viral videos, AI tools & entertainment instantly.",
    images: ["https://www.fondpeace.com/logo.jpg"],
  },
};

const GLOBAL_CATEGORIES = [
  "India News", "World News", "USA News", "UK News", "Europe", "Middle East", "Asia", "Africa",
  "Politics", "Elections", "Crime", "Weather", "Technology", "Artificial Intelligence",
  "Machine Learning", "Startups", "Business", "Finance", "Stock Market", "Crypto", "Economy",
  "Science", "Space", "Sports", "Cricket", "Football", "NBA", "Gaming", "Movies", "Bollywood",
  "Hollywood", "K-Dramas", "Anime", "Serial Updates", "Lifestyle", "Health", "Food",
  "Travel", "Education", "Jobs", "Automobile", "Viral Videos", "Shorts", "Reels", "Influencers"
];

const TRENDING_TOPICS = [
  "OpenAI updates",
  "World Cup Highlights",
  "India Breaking News",
  "Top Viral Video Today",
  "Best AI Tools 2026",
  "Latest Movie Trailers",
  "Serial Written Update Today"
];

const FAQS = [
  {
    q: "What is FondPeace Search?",
    a: "FondPeace Search helps users discover trending news, viral videos, AI updates, entertainment, sports and global stories — fast, transparent, and community-driven.",
  },
  {
    q: "Is FondPeace free to use?",
    a: "Yes. FondPeace Search and community discussions are completely free for all users.",
  },
  {
    q: "How does FondPeace find trending topics?",
    a: "We analyze realtime community activity, verified engagement, trust scores, and content freshness to curate trending topics without algorithmic distortion.",
  },
];

function JsonLD() {
  const now = new Date().toISOString();

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FondPeace",
    url: "https://www.fondpeace.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.fondpeace.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FondPeace",
    url: "https://www.fondpeace.com",
    logo: "https://www.fondpeace.com/logo.jpg",
    sameAs: [
      "https://twitter.com/fondpeace",
      "https://www.youtube.com/@FondPeace",
    ],
  };

  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "FondPeace Search",
    url: "https://www.fondpeace.com/search",
    description: metadata.description,
    inLanguage: "en",
    datePublished: "2024-01-01T00:00:00+00:00",
    dateModified: now,
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(page) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}

export default function SearchPage() {
  const today = new Date().toISOString().split("T")[0];
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen text-gray-900 dark:text-gray-100 pb-16">
      <JsonLD />

      {/* 1. INTERACTIVE CLIENT SEARCH HUB */}
      <section aria-label="FondPeace Search Bar">
        <SearchGo />
      </section>

      {/* 2. POPULAR CATEGORIES GRID */}
      <section className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-950 dark:text-white tracking-tight">
            Explore by Category
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {GLOBAL_CATEGORIES.map((cat, index) => (
            <Link
              key={index}
              href={`/search?q=${encodeURIComponent(cat)}`}
              prefetch={false}
              className="group p-3 rounded-2xl bg-white/70 dark:bg-zinc-950/50 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.08] hover:border-blue-500/40 hover:-translate-y-0.5 transition-all shadow-sm flex flex-col justify-between"
            >
              <span className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {cat}
              </span>
              <span className="text-[10px] text-gray-400 mt-1 flex items-center justify-between">
                <span>Trending stories</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. ABOUT FONDPEACE SEARCH - Trust & E-A-T Building */}
      <article className="max-w-4xl mx-auto px-4 mt-12">
        <div className="p-6 sm:p-8 rounded-3xl bg-white/60 dark:bg-zinc-950/40 backdrop-blur-2xl border border-black/[0.05] dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Trust & Open Community</span>
          </div>
          <h2 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight mb-4">
            About FondPeace Discovery
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            FondPeace Search is built to help people discover information faster — whether it’s **breaking news**, **viral shorts**, entertainment updates, **AI tools**, sports highlights, or community conversations. Our focus is on delivering a clean, modern, and reliable discovery experience across all devices.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-black/[0.06] dark:border-white/[0.06]">
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Why FondPeace?</h4>
              <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-1.5 list-disc pl-4">
                <li>Zero sensational manipulation or forced engagement traps.</li>
                <li>Instant direct access to verified creators and videos.</li>
                <li>Respectful discussion community with transparent metrics.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Privacy Guarantee</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Your search queries are private and never sold to third-party ad brokers. For assistance, reach our support team at{" "}
                <a href="mailto:contact@fondpeace.com" className="text-blue-500 hover:underline font-semibold">
                  contact@fondpeace.com
                </a>.
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* 4. FAQ ACCORDIONS */}
      <section className="max-w-4xl mx-auto px-4 mt-10">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-indigo-500" />
          <h3 className="text-xl font-bold text-gray-950 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h3>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <details
              key={i}
              className="group p-4 rounded-2xl bg-white/70 dark:bg-zinc-950/50 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.08] transition-all"
            >
              <summary className="font-bold text-sm sm:text-base text-gray-900 dark:text-white cursor-pointer select-none list-none flex items-center justify-between">
                <span>{f.q}</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-black/[0.04] dark:border-white/[0.06] pt-3">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 5. MINIMAL BRAND FOOTER */}
      <footer className="max-w-4xl mx-auto px-4 mt-12 pt-6 border-t border-black/[0.06] dark:border-white/[0.08] text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>© {currentYear} FondPeace. Built for authentic community.</div>
        <div className="flex gap-4">
          <Link href="/aboutus" className="hover:text-blue-500 transition-colors">About</Link>
          <Link href="/contactus" className="hover:text-blue-500 transition-colors">Contact</Link>
          <Link href="/privacypolicy" className="hover:text-blue-500 transition-colors">Privacy</Link>
          <Link href="/termcondition" className="hover:text-blue-500 transition-colors">Terms</Link>
        </div>
      </footer>
    </main>
  );
}
