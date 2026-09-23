import React from "react";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata = {
  title: "About Us",
  description:
    "Learn about FondPeace - an independent, community-driven social and discussion platform built for authentic conversations, trending topics, and transparent engagement.",
  alternates: {
    canonical: "https://www.fondpeace.com/aboutus",
  },
  openGraph: {
    title: "About Us | FondPeace",
    description:
      "Learn about FondPeace - an independent, community-driven social and discussion platform built for authentic conversations.",
    url: "https://www.fondpeace.com/aboutus",
    siteName: "FondPeace",
    type: "website",
  },
};

export default function AboutUs() {
  return (
    <LegalPageLayout
      title="About FondPeace"
      subtitle="An independent, community-driven social and discussion platform built for authentic conversations, original creation, and transparent engagement."
      lastUpdated="September 2026"
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Our Mission & Vision
          </h2>
          <p>
            In an internet environment increasingly shaped by noise, misinformation, and artificial engagement, FondPeace exists to offer a calmer, more responsible alternative. The platform focuses on real people, real voices, and real discussions — without manipulation, hidden agendas, or forced algorithmic bias.
          </p>
          <p className="mt-2">
            FondPeace is not designed to chase attention at any cost. Instead, it is built with long-term trust, community safety, and creator freedom at its core.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            What Users Can Do on FondPeace
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>Share original posts, thoughts, and community discussions</li>
            <li>Upload high-definition short videos and creative photos</li>
            <li>Engage with posts through real-time comments, reposts, and reactions</li>
            <li>Explore trending and community-driven topics (#hashtags)</li>
            <li>Follow favorite creators with verified shields and custom profiles</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Support for Creators & Originality
          </h2>
          <p>
            FondPeace respects creators and original authorship. Content ownership remains with the creator, and proper attribution is always visible. Unlike platforms that rely on artificial engagement or paid visibility, FondPeace encourages organic growth based on clarity, originality, and consistency.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Founder & Editorial Independence
          </h2>
          <p>
            FondPeace was founded by <strong>Aman Kumar</strong>, who serves as the Founder & Platform Editor. The platform is independently operated without undisclosed influence boosts or hidden algorithmic distortion.
          </p>
        </section>

        <section className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Official Channels & Contact
          </h2>
          <p className="text-sm">
            For feedback, platform inquiries, or creator support:
          </p>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
            📧 Email: contact@fondpeace.com (or jotarikhan@gmail.com)
          </p>
          <div className="flex flex-wrap gap-3 mt-4 text-xs font-semibold">
            <a href="https://x.com/FondPeaceTech" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              X (Twitter) ↗
            </a>
            <a href="https://www.instagram.com/fondpeacetecho/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              Instagram ↗
            </a>
            <a href="https://www.threads.com/@fondpeacetecho" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              Threads ↗
            </a>
            <a href="https://www.youtube.com/@FondPeaceUpdate" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              YouTube ↗
            </a>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
}
