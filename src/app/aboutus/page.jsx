import React from "react";
import Link from "next/link";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata = {
  title: "About Us — FondPeace Community & Creator Platform",
  description:
    "Learn about FondPeace, founded by Aman Kumar — an independent social discussion, short video reels, and creator monetization platform built for authentic conversations and transparent growth.",
  alternates: {
    canonical: "https://www.fondpeace.com/aboutus",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "About Us — FondPeace Community & Creator Platform",
    description:
      "Learn about FondPeace — an independent community platform for thoughtful discussions, trending short reels, and fair creator growth.",
    url: "https://www.fondpeace.com/aboutus",
    siteName: "FondPeace",
    type: "website",
    images: [
      {
        url: "https://www.fondpeace.com/FondPeace-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "About FondPeace Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | FondPeace",
    description:
      "Independent community platform for authentic discussions, short video reels, and fair creator monetization.",
    images: ["https://www.fondpeace.com/FondPeace-1200x630.jpg"],
  },
};

export default function AboutUs() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": "https://www.fondpeace.com/aboutus#webpage",
        url: "https://www.fondpeace.com/aboutus",
        name: "About FondPeace",
        description:
          "Independent community-driven social discussion, short-form video, and creator platform founded by Aman Kumar.",
        isPartOf: { "@id": "https://www.fondpeace.com/#website" },
        mainEntity: { "@id": "https://www.fondpeace.com/#organization" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.fondpeace.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "About Us",
            item: "https://www.fondpeace.com/aboutus",
          },
        ],
      },
    ],
  };

  return (
    <LegalPageLayout
      title="About FondPeace"
      subtitle="An independent, community-driven social discussion and short-form video platform built for authentic voices, creator ownership, and transparent discovery."
      lastUpdated="November 2026"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      <div className="space-y-7">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Our Mission &amp; Vision
          </h2>
          <p>
            In an internet ecosystem crowded with clickbait, opaque shadowbans, and recycled noise,{" "}
            <strong>FondPeace</strong> (accessible at{" "}
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              fondpeace.com
            </Link>
            ) exists to give independent creators and everyday thinkers a cleaner, faster, and more transparent home.
          </p>
          <p className="mt-2.5">
            Rather than burying real voices behind pay-to-play boosts, FondPeace prioritizes clear attribution, direct audience relationships, fast mobile-first media playback, and open public discussions across technology, culture, cinema, and daily trends.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
              Creator Videos &amp; Watch Pages
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Stream vertical videos and creator clips seamlessly on{" "}
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                FondPeace Watch &amp; Feed
              </Link>
              , with dedicated shareable watch pages, smooth adaptive streaming, and crisp captions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
              Community Discussions &amp; Topics
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Publish original thoughts, rich link previews, photo essays, and community polls in the{" "}
              <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                main community feed
              </Link>{" "}
              with nested replies and hashtag topic threads.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
              Creator Tools &amp; Partnerships
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Creators retain ownership of their work and can explore the{" "}
              <Link href="/monetization" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                FondPeace Creator Program
              </Link>{" "}
              for audience analytics, organic discovery, and transparent brand collaborations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
              Trust, Moderation &amp; Copyright
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              We enforce active anti-spam safeguards, transparent{" "}
              <Link href="/termcondition" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                community standards
              </Link>
              , user privacy controls, and rapid{" "}
              <Link href="/DMCA" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                DMCA compliance
              </Link>
              .
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Founder &amp; Editorial Independence
          </h2>
          <p>
            FondPeace was founded by <strong>Aman Kumar</strong>, who leads product engineering and editorial oversight. The platform operates independently without undisclosed corporate interference or artificial engagement inflation, keeping creator attribution and community trust front and center.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            What You Can Do on FondPeace
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>Share original discussions, news commentary, polls, and photo stories</li>
            <li>Watch and upload fast-loading short videos and reels</li>
            <li>Engage through real-time replies, bookmarks, reposts, and creator profiles</li>
            <li>Discover curated community hashtags without clutter or intrusive spam</li>
            <li>Grow and monetize your audience with transparent revenue terms</li>
          </ul>
        </section>

        <section className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Official Channels &amp; Contact
          </h2>
          <p className="text-sm">
            For creator support, press inquiries, partnership requests, or legal notices, reach us through our{" "}
            <Link href="/contactus" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Contact page
            </Link>{" "}
            or official email:
          </p>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1.5">
            <a href="mailto:contact@fondpeace.com" className="hover:underline">
              contact@fondpeace.com
            </a>
          </p>
          <div className="flex flex-wrap gap-4 mt-4 text-xs font-semibold">
            <a
              href="https://x.com/FondPeaceTech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              X (Twitter) ↗
            </a>
            <a
              href="https://www.instagram.com/fondpeacetecho/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Instagram ↗
            </a>
            <a
              href="https://www.threads.com/@fondpeacetecho"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Threads ↗
            </a>
            <a
              href="https://www.youtube.com/@FondPeaceUpdate"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              YouTube ↗
            </a>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
}
