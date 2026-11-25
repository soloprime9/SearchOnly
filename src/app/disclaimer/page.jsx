import React from "react";
import Link from "next/link";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata = {
  title: "Platform Disclaimer — Content & External Links",
  description:
    "Read the FondPeace Disclaimer covering user-generated posts, third-party embeds, external websites, professional advice notices, and creator partnerships.",
  alternates: {
    canonical: "https://www.fondpeace.com/disclaimer",
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
    title: "Platform Disclaimer | FondPeace",
    description:
      "Information accuracy, user-generated community posts, external link previews, and non-advisory disclosures for FondPeace.",
    url: "https://www.fondpeace.com/disclaimer",
    siteName: "FondPeace",
    type: "website",
    images: [
      {
        url: "https://www.fondpeace.com/FondPeace-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace Platform Disclaimer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platform Disclaimer | FondPeace",
    description:
      "Disclosures covering user-submitted content, third-party links, and general information on FondPeace.",
    images: ["https://www.fondpeace.com/FondPeace-1200x630.jpg"],
  },
};

export default function Disclaimer() {
  const disclaimerSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.fondpeace.com/disclaimer#webpage",
        url: "https://www.fondpeace.com/disclaimer",
        name: "Platform Disclaimer | FondPeace",
        description:
          "Disclosures on user-generated content, external websites, and non-advisory commentary on FondPeace.",
        isPartOf: { "@id": "https://www.fondpeace.com/#website" },
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
            name: "Disclaimer",
            item: "https://www.fondpeace.com/disclaimer",
          },
        ],
      },
    ],
  };

  return (
    <LegalPageLayout
      title="Platform Disclaimer"
      subtitle="Disclosures covering community-submitted posts, third-party embeds, external links, and non-advisory information on FondPeace."
      lastUpdated="November 2026"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(disclaimerSchema) }}
      />

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            1. User-Generated Community Content
          </h2>
          <p>
            FondPeace (<strong>https://www.fondpeace.com</strong>) hosts public discussions, commentary, photos, and short videos submitted by independent creators and community members. Views and opinions expressed in individual posts belong solely to their respective authors and do not represent official endorsements by FondPeace.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            2. External Links &amp; Third-Party Embeds
          </h2>
          <p>
            Posts on FondPeace may include link previews or embedded media from external websites and video platforms. While we apply automated safety checks to block malicious or spam links, FondPeace has no control over the content, availability, or privacy policies of external third-party domains.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            3. No Professional, Financial, or Medical Advice
          </h2>
          <p className="text-sm leading-relaxed">
            Discussions on technology, business, entertainment, health, or finance shared on FondPeace are strictly for informational and community conversation purposes. They do not constitute legal, medical, investment, or professional advice. Always consult qualified professionals before making major decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            4. Creator Program &amp; Earnings Disclosure
          </h2>
          <p>
            Participation in the{" "}
            <Link href="/monetization" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              FondPeace Creator Program
            </Link>{" "}
            does not guarantee specific reach, views, brand sponsorships, or financial returns.
          </p>
        </section>

        <section className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            5. Report Issues &amp; Contact
          </h2>
          <p className="text-sm">
            To report inaccurate material, copyright issues (see our{" "}
            <Link href="/DMCA" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              DMCA Policy
            </Link>
            ), or questions about this disclaimer, visit our{" "}
            <Link href="/contactus" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Contact page
            </Link>{" "}
            or email:
          </p>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1.5">
            <a href="mailto:contact@fondpeace.com" className="hover:underline">
              contact@fondpeace.com
            </a>
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}
