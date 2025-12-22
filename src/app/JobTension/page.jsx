import JobsPageView from "@/Job/JobsPageView";
import JobAuthGate from "@/Job/JobAuthGate";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

 
/* ============================
   SEO METADATA (ENHANCED)
============================ */
export async function generateMetadata() {
  const title =
    "Latest Jobs in India | IT, Fresher, Remote & MNC Jobs – FondPeace.com";
  const description =
    "Find verified latest jobs in India including IT jobs, fresher hiring, remote jobs, internships, and MNC openings. Updated daily on FondPeace.com by FondPeace.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://www.fondpeace.com/JobTension",
    },
    openGraph: {
      title,
      description,
      url: "https://www.fondpeace.com/JobTension",
      siteName: "FondPeace.com",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ============================
   PAGE (SERVER AUTH PROTECTED)
============================ */
export default async function JobsPage() {
 

  /* ---------- FETCH JOBS ---------- */
  const res = await fetch("https://list-back-nine.vercel.app/job/all", {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">FondPeace.com</h1>
        <p className="text-red-600">
          Failed to load jobs. Please try again later.
        </p>
      </div>
    );
  }

  const { jobs } = await res.json();

  /* ============================
     STRUCTURED DATA (GOOGLE SAFE)
  ============================ */

  // 1️⃣ WebPage + SearchAction
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Latest Jobs in India – FondPeace.com",
    description:
      "Browse verified job openings including IT, fresher, remote, internship and MNC jobs in India.",
    url: "https://www.fondpeace.com/JobTension",
    isPartOf: {
      "@type": "WebSite",
      name: "FondPeace",
      url: "https://www.fondpeace.com",
      potentialAction: {
        "@type": "SearchAction",
        target:
          "https://www.fondpeace.com/JobTension?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  };

  // 2️⃣ FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is FondPeace.com free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, FondPeace.com is completely free for job seekers.",
        },
      },
      {
        "@type": "Question",
        name: "What type of jobs are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "You can find IT jobs, fresher jobs, internships, remote jobs, and MNC openings across India.",
        },
      },
      {
        "@type": "Question",
        name: "How often are jobs updated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "New job listings are added and updated daily.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need an account to apply?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes, you must be logged in to view and apply for jobs on FondPeace.com.",
        },
      },
    ],
  };

  // 3️⃣ Job List (Lightweight – NOT spam)
  const jobListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest Job Openings in India",
    itemListElement: jobs.slice(0, 10).map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://www.fondpeace.com/JobTension/${job._id}`,
      name: `${job.jobTitle} at ${job.companyName}`,
    })),
  };

  return (
    <>
      {/* ===== STRUCTURED DATA ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jobListSchema),
        }}
      />
      <JobAuthGate>
      <JobsPageView jobs={jobs} />
      </JobAuthGate>
    </>
  );
}











// // app/JobTension/page.js
// import JobsPageView from "@/Job/JobsPageView";

// /* ============================
//    SEO METADATA (SAFE & CLEAN)
// ============================ */
// export async function generateMetadata() {
//   const title = "Latest Jobs in India | IT, Fresher, Remote & MNC Jobs – FondPeace.com";
//   const description =
//     "Browse latest job openings across India including IT jobs, fresher jobs, remote jobs, internships and MNC hiring. Updated daily on FondPeace.com by FondPeace.";

//   return {
//     title,
//     description,
//     alternates: {
//       canonical: "https://www.fondpeace.com/JobTension",
//     },
//     openGraph: {
//       title,
//       description,
//       url: "https://www.fondpeace.com/JobTension",
//       siteName: "FondPeace.com",
//       type: "website",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title,
//       description,
//     },
//   };
// }

// /* ============================
//    PAGE
// ============================ */
// export default async function JobsPage() {
//   const res = await fetch("https://list-back-nine.vercel.app/job/all", {
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <h1 className="text-3xl font-bold mb-6">FondPeace.com</h1>
//         <p className="text-red-600">
//           Failed to load jobs. Please try again later.
//         </p>
//       </div>
//     );
//   }

//   const { jobs } = await res.json();

//   /* ============================
//      JOB LIST STRUCTURED DATA
//      (Google Safe – NOT spam)
//   ============================ */
//   const jobListSchema = {
//     "@context": "https://schema.org",
//     "@type": "ItemList",
//     name: "Latest Job Openings in India",
//     itemListElement: jobs.slice(0, 20).map((job, index) => ({
//       "@type": "ListItem",
//       position: index + 1,
//       url: `https://www.fondpeace.com/JobTension/${job._id}`,
//       name: `${job.jobTitle} at ${job.companyName}`,
//     })),
//   };

//   return (
//     <>
//       {/* STRUCTURED DATA FOR GOOGLE */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{
//           __html: JSON.stringify(jobListSchema),
//         }}
//       />

//       <JobsPageView jobs={jobs} />
//     </>
//   );
// }











// // app/jobs/page.js
// import JobsPageView from "@/Job/JobsPageView";

// export default async function JobsPage() {
//   const res = await fetch("https://list-back-nine.vercel.app/job/all", {
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <h1 className="text-3xl font-bold mb-6">FondPeace.com</h1>
//         <p className="text-red-600">Failed to load jobs. Please try again later.</p>
//       </div>
//     );
//   }

//   const { jobs } = await res.json();

//   return <JobsPageView jobs={jobs} />;
// }
