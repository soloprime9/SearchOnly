import React from "react";
import Link from "next/link";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata = {
  title: "Privacy Policy — Data Protection & Cookies",
  description:
    "Read the FondPeace Privacy Policy to understand what account, media, cookie, and analytics data we collect, how it is protected, and how to request data deletion.",
  alternates: {
    canonical: "https://www.fondpeace.com/privacypolicy",
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
    title: "Privacy Policy | FondPeace",
    description:
      "How FondPeace handles account details, uploaded media, cookies, analytics, and user privacy rights.",
    url: "https://www.fondpeace.com/privacypolicy",
    siteName: "FondPeace",
    type: "website",
    images: [
      {
        url: "https://www.fondpeace.com/FondPeace-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | FondPeace",
    description:
      "Learn how FondPeace collects, protects, and manages user data and privacy preferences.",
    images: ["https://www.fondpeace.com/FondPeace-1200x630.jpg"],
  },
};

export default function PrivacyPolicy() {
  const privacySchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.fondpeace.com/privacypolicy#webpage",
        url: "https://www.fondpeace.com/privacypolicy",
        name: "Privacy Policy | FondPeace",
        description:
          "Privacy Policy explaining account data, media storage, cookies, third-party embeds, and data deletion rights on FondPeace.",
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
            name: "Privacy Policy",
            item: "https://www.fondpeace.com/privacypolicy",
          },
        ],
      },
    ],
  };

  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="How FondPeace (https://www.fondpeace.com) collects, uses, secures, and respects your personal data and privacy preferences."
      lastUpdated="November 2026"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacySchema) }}
      />

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            1. Overview &amp; Consent
          </h2>
          <p>
            By accessing or using FondPeace (<strong>https://www.fondpeace.com</strong>), you consent to the data practices described in this Privacy Policy. We collect only the information needed to operate our community discussions, short-video hosting, and account security features.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            2. Information We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>
              <strong>Account &amp; Authentication Data:</strong> Username, email address, profile photo, and bio provided during sign-up or via Google Sign-In.
            </li>
            <li>
              <strong>User-Generated Content:</strong> Posts, comments, replies, poll votes, and images or videos you choose to upload (stored via encrypted cloud media storage).
            </li>
            <li>
              <strong>Technical &amp; Log Data:</strong> Browser user-agent, device viewport, IP-derived country/region diagnostics, and aggregate page view telemetry used to keep feeds fast and prevent abuse.
            </li>
            <li>
              <strong>Preferences &amp; Storage:</strong> Local browser storage (e.g., light/dark theme settings, login session tokens, and optional push notification permissions).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            3. How We Use Information
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>Operate, personalize, and secure user accounts and public feeds</li>
            <li>Deliver real-time notifications, replies, and search results</li>
            <li>Detect and block automated spam, malicious bots, and policy violations</li>
            <li>Measure aggregate site reliability, page load speed, and content engagement</li>
            <li>Respond to legal notices, DMCA requests, and user support inquiries</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            4. Cookies, Analytics &amp; Third-Party Services
          </h2>
          <p>
            FondPeace uses first-party session storage alongside trusted infrastructure providers such as Google Analytics, Vercel Analytics, Cloudflare R2 media delivery, and optional embedded media players (such as YouTube). When you interact with an embedded third-party video or external link, that third party may apply its own cookie and privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            5. Children&apos;s Privacy
          </h2>
          <p>
            FondPeace is not directed at children under the age of 13 (or the applicable digital age of consent in your jurisdiction). If you believe a minor has submitted personal information without parental consent, contact us immediately so we can remove those records.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
              GDPR &amp; DPDP Rights
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Eligible users may request access, correction, export, or permanent deletion of their account and personal data at any time.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
              CCPA Notice
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              FondPeace does not sell personal user data. California residents may request disclosure or deletion of stored account information.
            </p>
          </div>
        </section>

        <section className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            6. Contacting Us for Privacy Requests
          </h2>
          <p className="text-sm">
            To request account deletion or ask privacy questions, visit our{" "}
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
