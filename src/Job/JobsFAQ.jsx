"use client";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function JobsFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "What is FondPeace Jobs?",
      a: "FondPeace Jobs is a free job discovery platform by FondPeace.com where users can explore verified job opportunities across India including IT, fresher, remote, and MNC jobs."
    },
    {
      q: "Is FondPeace Jobs completely free?",
      a: "Yes. FondPeace Jobs is 100% free for job seekers and employers. No subscriptions, no commissions, and no hidden charges."
    },
    {
      q: "Who can post jobs on FondPeace?",
      a: "Startups, companies, recruiters, HR professionals, and founders can post jobs for free to reach genuine candidates."
    },
    {
      q: "Are job listings verified?",
      a: "Yes. All job postings go through moderation checks to reduce spam, fake jobs, and misleading information."
    },
    {
      q: "Do I need to create an account to apply?",
      a: "Yes. Login is required to apply so employers can receive authentic applications and communicate securely."
    },
    {
      q: "What type of jobs are available?",
      a: "You’ll find IT jobs, fresher jobs, internships, remote roles, part-time jobs, and MNC hiring opportunities."
    },
    {
      q: "How often are new jobs added?",
      a: "New job opportunities are added regularly as companies and recruiters publish openings."
    },
    {
      q: "Is FondPeace Jobs suitable for freshers?",
      a: "Absolutely. FondPeace focuses strongly on fresher-friendly and early-career job opportunities."
    },
    {
      q: "Is FondPeace a trusted platform?",
      a: "FondPeace is a community-first platform focused on transparency, trust, and long-term value for users."
    }
  ];

  return (
    <section className="mt-20 max-w-4xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
        FondPeace Jobs – FAQs
      </h2>

      <div className="space-y-4">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {item.q}
                </span>

                <FaChevronDown
                  className={`text-blue-600 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-40 pb-4" : "max-h-0"
                }`}
              >
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
