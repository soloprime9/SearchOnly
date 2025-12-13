// app/JobTension/page.js
import JobsPageView from "@/Job/JobsPageView";

/* ============================
   SEO METADATA (SAFE & CLEAN)
============================ */
export async function generateMetadata() {
  const title = "Latest Jobs in India | IT, Fresher, Remote & MNC Jobs – Job Tension";
  const description =
    "Browse latest job openings across India including IT jobs, fresher jobs, remote jobs, internships and MNC hiring. Updated daily on Job Tension by FondPeace.";

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
      siteName: "Job Tension",
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
   PAGE
============================ */
export default async function JobsPage() {
  const res = await fetch("https://list-back-nine.vercel.app/job/all", {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Job Tension</h1>
        <p className="text-red-600">
          Failed to load jobs. Please try again later.
        </p>
      </div>
    );
  }

  const { jobs } = await res.json();

  /* ============================
     JOB LIST STRUCTURED DATA
     (Google Safe – NOT spam)
  ============================ */
  const jobListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Latest Job Openings in India",
    itemListElement: jobs.slice(0, 20).map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://www.fondpeace.com/JobTension/${job._id}`,
      name: `${job.jobTitle} at ${job.companyName}`,
    })),
  };

  return (
    <>
      {/* STRUCTURED DATA FOR GOOGLE */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jobListSchema),
        }}
      />

      <JobsPageView jobs={jobs} />
    </>
  );
}











// // app/jobs/page.js
// import JobsPageView from "@/Job/JobsPageView";

// export default async function JobsPage() {
//   const res = await fetch("https://list-back-nine.vercel.app/job/all", {
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <h1 className="text-3xl font-bold mb-6">Job Tension</h1>
//         <p className="text-red-600">Failed to load jobs. Please try again later.</p>
//       </div>
//     );
//   }

//   const { jobs } = await res.json();

//   return <JobsPageView jobs={jobs} />;
// }
