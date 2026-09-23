import React from 'react';
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata = {
  title: "Terms and Conditions",
  description:
    "Review the terms and conditions governing the use of the FondPeace website, community features, and discussion services.",
  alternates: {
    canonical: "https://www.fondpeace.com/termcondition",
  },
  openGraph: {
    title: "Terms and Conditions | FondPeace",
    description:
      "Review the terms and conditions for using the FondPeace platform and services.",
    url: "https://www.fondpeace.com/termcondition",
    siteName: "FondPeace",
    type: "website",
  },
};

export default function TermsAndConditions() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      subtitle="These terms and conditions outline the rules and guidelines governing the use of FondPeace (https://www.fondpeace.com)."
      lastUpdated="September 2026"
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Acceptance of Terms</h2>
          <p>
            By accessing or using FondPeace, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, please do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">User Content & Community Standards</h2>
          <p>
            Parts of this website allow users to post thoughts, upload media, and participate in discussions. FondPeace values open expression, but requires all participants to respect community guidelines:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm mt-2">
            <li>You warrant that you own or have permission to post any media or text submitted.</li>
            <li>Content must not infringe copyright, trademark, privacy, or proprietary rights.</li>
            <li>Defamatory, abusive, unlawful, or sexually exploitative material is strictly prohibited.</li>
            <li>Automated spamming, bot manipulations, and deceptive marketing are not permitted.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Intellectual Property & Creator Ownership</h2>
          <p>
            Creators retain full ownership of their original content. By posting on FondPeace, you grant us a non-exclusive license to host, display, and distribute your content across the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Disclaimer of Warranties & Liability</h2>
          <p>
            To the maximum extent permitted by law, FondPeace provides its services on an "as is" and "as available" basis without warranties of any kind. FondPeace shall not be liable for any indirect or consequential damages arising from site use.
          </p>
        </section>

        <section className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Inquiries & Contact</h2>
          <p className="text-sm">
            For questions or legal notifications regarding these Terms:
          </p>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
            📧 contact@fondpeace.com (or jotarikhan@gmail.com)
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}
