import React from 'react';
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Read the FondPeace Privacy Policy to understand how we collect, protect, and handle your data and personal information.",
  alternates: {
    canonical: "https://www.fondpeace.com/privacypolicy",
  },
  openGraph: {
    title: "Privacy Policy | FondPeace",
    description:
      "Understand how FondPeace collects, protects, and handles your data and privacy.",
    url: "https://www.fondpeace.com/privacypolicy",
    siteName: "FondPeace",
    type: "website",
  },
};

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="At FondPeace, accessible from https://www.fondpeace.com, one of our main priorities is the privacy of our visitors."
      lastUpdated="September 2026"
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Consent</h2>
          <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Information We Collect</h2>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we request it.
          </p>
          <p className="mt-2">
            When you register for an account or participate in community discussions, we may collect your username, email address, and profile details to authenticate and protect your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>Provide, operate, and maintain our social community platform</li>
            <li>Improve, personalize, and expand platform responsiveness</li>
            <li>Understand and analyze how visitors interact with public feeds</li>
            <li>Prevent spam, unauthorized bot access, and fraudulent activities</li>
            <li>Send email notifications and OTP verifications regarding your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Log Files & Cookies</h2>
          <p>
            FondPeace follows standard hosting practices using log files. Information collected includes IP addresses, browser type, timestamp, and referral pages. These are not linked to personally identifiable information and are used solely to monitor service reliability and site analytics.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">CCPA Rights</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              California residents can request disclosures of personal data collected, deletion of records, and opt-outs regarding data usage.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">GDPR Protection</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Users in the European Economic Area possess the right to access, rectify, erase, or restrict processing of their personal data.
            </p>
          </div>
        </section>

        <section className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Contacting Us</h2>
          <p className="text-sm">
            If you have questions regarding this Privacy Policy or wish to exercise your privacy rights:
          </p>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
            📧 contact@fondpeace.com (or jotarikhan@gmail.com)
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}
