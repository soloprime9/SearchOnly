import React from "react";
import LegalPageLayout from "@/components/LegalPageLayout";

export const metadata = {
  title: "DMCA Policy",
  description:
    "Digital Millennium Copyright Act (DMCA) Policy for FondPeace. Learn how we handle copyright infringement notices and intellectual property protection.",
  alternates: {
    canonical: "https://www.fondpeace.com/DMCA",
  },
  openGraph: {
    title: "DMCA Policy | FondPeace",
    description:
      "Digital Millennium Copyright Act (DMCA) Policy for FondPeace.",
    url: "https://www.fondpeace.com/DMCA",
    siteName: "FondPeace",
    type: "website",
  },
};

export default function DMCA() {
  return (
    <LegalPageLayout
      title="DMCA Copyright Policy"
      subtitle="FondPeace respects the intellectual property of others and expects its users to do the same."
      lastUpdated="September 2026"
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Notice & Takedown Procedure</h2>
          <p>
            It is our policy to respond expeditiously to clear notices of alleged copyright infringement that comply with the United States Digital Millennium Copyright Act of 1998 ("DMCA").
          </p>
        </section>

        <section className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Filing a Copyright Notice</h2>
          <p className="text-sm mb-3">To submit a valid DMCA notification, please provide our designated copyright agent with:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Identification of the material on FondPeace that is claimed to be infringing (including direct URL).</li>
            <li>Your contact information (name, physical address, telephone number, and email address).</li>
            <li>A statement confirming good faith belief that the disputed use is not authorized by the copyright owner.</li>
            <li>A physical or electronic signature of the authorized copyright owner or agent.</li>
          </ul>
        </section>

        <section className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Designated Copyright Agent</h2>
          <p className="text-sm">
            Please direct all DMCA notices and counter-notifications to:
          </p>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
            📧 contact@fondpeace.com (or jotarikhan@gmail.com)
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}
