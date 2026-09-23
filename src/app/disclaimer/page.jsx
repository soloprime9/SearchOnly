import React from "react";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata = {
  title: "Disclaimer",
  description:
    "Read the FondPeace disclaimer regarding information accuracy, external links, and user-generated community content.",
  alternates: {
    canonical: "https://www.fondpeace.com/disclaimer",
  },
  openGraph: {
    title: "Disclaimer | FondPeace",
    description:
      "Read the FondPeace disclaimer regarding information accuracy and community content.",
    url: "https://www.fondpeace.com/disclaimer",
    siteName: "FondPeace",
    type: "website",
  },
};

export default function Disclaimer() {
  return (
    <LegalPageLayout
      title="Platform Disclaimer"
      subtitle="General information, community content, and external link disclosures for FondPeace."
      lastUpdated="September 2026"
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">General Information</h2>
          <p>
            All information on FondPeace (https://www.fondpeace.com) is published in good faith and for general community discussion purposes only. FondPeace does not make warranties regarding complete accuracy or timeliness of third-party user-submitted posts.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">External Links</h2>
          <p>
            FondPeace may contain links to external sites. While we strive to maintain safe and quality links, we have no control over content or updates on external websites. Following links to third-party services is at your own discretion.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Professional Advice Notice</h2>
          <p className="text-sm">
            Content posted on FondPeace — including technology discussions, health tips, and financial commentary — does not constitute professional advice. Always verify critical decisions with certified professionals.
          </p>
        </section>

        <section className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Questions & Contact</h2>
          <p className="text-sm">
            For questions regarding this disclaimer:
          </p>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
            📧 contact@fondpeace.com (or jotarikhan@gmail.com)
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}
