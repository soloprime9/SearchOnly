import React from "react";
import Link from "next/link";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata = {
  title: "DMCA Copyright Policy — Takedown & Counter-Notices",
  description:
    "FondPeace Digital Millennium Copyright Act (DMCA) Policy. Learn how copyright owners can submit infringement takedown requests and how creators can file counter-notifications.",
  alternates: {
    canonical: "https://www.fondpeace.com/DMCA",
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
    title: "DMCA Copyright Policy | FondPeace",
    description:
      "Procedures for filing copyright infringement takedown notices and counter-notifications on FondPeace.",
    url: "https://www.fondpeace.com/DMCA",
    siteName: "FondPeace",
    type: "website",
    images: [
      {
        url: "https://www.fondpeace.com/FondPeace-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace DMCA Copyright Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DMCA Copyright Policy | FondPeace",
    description:
      "Submit copyright takedown notices or counter-notifications under the DMCA on FondPeace.",
    images: ["https://www.fondpeace.com/FondPeace-1200x630.jpg"],
  },
};

export default function DMCA() {
  const dmcaSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.fondpeace.com/DMCA#webpage",
        url: "https://www.fondpeace.com/DMCA",
        name: "DMCA Copyright Policy | FondPeace",
        description:
          "Official DMCA copyright takedown and counter-notification procedures for FondPeace.",
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
            name: "DMCA Policy",
            item: "https://www.fondpeace.com/DMCA",
          },
        ],
      },
    ],
  };

  return (
    <LegalPageLayout
      title="DMCA Copyright Policy"
      subtitle="FondPeace respects the intellectual property rights of original creators and responds promptly to valid copyright notices."
      lastUpdated="November 2026"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dmcaSchema) }}
      />

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            1. Notice &amp; Takedown Procedure
          </h2>
          <p>
            FondPeace responds expeditiously to complete notices of alleged copyright infringement submitted in accordance with the United States Digital Millennium Copyright Act of 1998 (&ldquo;DMCA&rdquo;) and applicable copyright laws. Upon receiving a valid notice, we remove or disable access to the identified material and notify the uploader.
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            2. Requirements for a Valid Copyright Notice
          </h2>
          <p className="text-sm mb-3">
            To submit a takedown request, please send a written notice containing all of the following details:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Description of the copyrighted work claimed to have been infringed.</li>
            <li>Exact FondPeace URL(s) where the allegedly infringing material is located so we can locate and review it quickly.</li>
            <li>Your full contact details (legal name, mailing address, phone number, and email address).</li>
            <li>A statement of good-faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement under penalty of perjury that the notice is accurate and that you are the owner or authorized to act on the owner&apos;s behalf, along with your physical or electronic signature.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            3. Counter-Notification &amp; Repeat Infringer Policy
          </h2>
          <p>
            If your post or video was removed due to mistake or misidentification, you may submit a written counter-notification with your contact details, the removed URL, and a good-faith statement consenting to jurisdiction. Under our{" "}
            <Link href="/termcondition" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Terms &amp; Conditions
            </Link>
            , accounts that repeatedly violate copyright rules are subject to permanent suspension.
          </p>
        </section>

        <section className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            4. Designated Copyright Agent
          </h2>
          <p className="text-sm">
            Please direct all DMCA notices and counter-notifications via our{" "}
            <Link href="/contactus" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Contact page
            </Link>{" "}
            or send directly by email to:
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
