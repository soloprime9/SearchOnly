import React from "react";
import Link from "next/link";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata = {
  title: "Terms & Conditions — Community Rules & Usage",
  description:
    "Review the FondPeace Terms and Conditions governing account responsibilities, content guidelines, copyright ownership, moderation, and platform usage.",
  alternates: {
    canonical: "https://www.fondpeace.com/termcondition",
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
    title: "Terms & Conditions | FondPeace",
    description:
      "Community standards, intellectual property rights, and terms governing the use of FondPeace.",
    url: "https://www.fondpeace.com/termcondition",
    siteName: "FondPeace",
    type: "website",
    images: [
      {
        url: "https://www.fondpeace.com/FondPeace-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace Terms and Conditions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | FondPeace",
    description:
      "Rules, content guidelines, and user responsibilities for using FondPeace.",
    images: ["https://www.fondpeace.com/FondPeace-1200x630.jpg"],
  },
};

export default function TermsAndConditions() {
  const termsSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.fondpeace.com/termcondition#webpage",
        url: "https://www.fondpeace.com/termcondition",
        name: "Terms & Conditions | FondPeace",
        description:
          "Terms and Conditions governing account usage, content moderation, and intellectual property on FondPeace.",
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
            name: "Terms & Conditions",
            item: "https://www.fondpeace.com/termcondition",
          },
        ],
      },
    ],
  };

  return (
    <LegalPageLayout
      title="Terms & Conditions"
      subtitle="These Terms & Conditions govern your access to and participation on FondPeace (https://www.fondpeace.com)."
      lastUpdated="November 2026"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsSchema) }}
      />

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or creating an account on FondPeace, you agree to comply with these Terms &amp; Conditions and our{" "}
            <Link href="/privacypolicy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Privacy Policy
            </Link>
            . If you do not agree with any provision below, please discontinue using the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            2. User Content &amp; Community Standards
          </h2>
          <p>
            FondPeace enables users to publish discussions, images, short videos, polls, and link commentary. To keep the platform safe and lawful, all contributors agree to the following standards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm mt-2">
            <li>You confirm that you own or hold proper rights to every text, photo, or video you upload.</li>
            <li>Content must not violate copyright, trademark, privacy, or third-party intellectual property rights.</li>
            <li>Sexually explicit, non-consensual, abusive, harassing, defamatory, or illegal content is strictly prohibited.</li>
            <li>Automated spam, duplicate flooding, deceptive links, and artificial traffic manipulation are not allowed.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            3. Intellectual Property &amp; Creator License
          </h2>
          <p>
            Creators retain ownership of their original content posted on FondPeace. By publishing content on the platform, you grant FondPeace a non-exclusive, worldwide, royalty-free license solely to host, format, display, and distribute that content within the service. You may delete your own posts at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            4. Moderation &amp; Enforcement
          </h2>
          <p>
            FondPeace reserves the right to remove spam, policy-violating posts, or infringing uploads and to suspend accounts engaged in repeated violations, without prior notice. Copyright claims are processed under our{" "}
            <Link href="/DMCA" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              DMCA Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            5. Disclaimer of Warranties &amp; Liability
          </h2>
          <p>
            To the fullest extent permitted by applicable law, FondPeace is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without express or implied warranties. FondPeace is not responsible for indirect, incidental, or consequential damages arising from third-party content or temporary service interruptions.
          </p>
        </section>

        <section className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            6. Inquiries &amp; Legal Contact
          </h2>
          <p className="text-sm">
            Questions regarding these Terms can be submitted via our{" "}
            <Link href="/contactus" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              Contact page
            </Link>{" "}
            or emailed directly to:
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
