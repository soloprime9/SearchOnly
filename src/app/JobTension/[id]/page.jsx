import JobDetailComponent from "@/Job/JobDetailComponent";
import Link from "next/link";

/* =========================
   SEO METADATA (GOOGLE)
========================= */
export async function generateMetadata({ params }) {
  const { id } = params;

  const res = await fetch(
    `https://list-back-nine.vercel.app/job/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
  return {
    title: "Job not found – Job Tension",
    description: "The job you are looking for does not exist.",
  };
}



  const { job } = await res.json();

  const title = `${job.jobTitle} at ${job.companyName} | ${job.jobLocation}`;
  const description = job.aboutJob.slice(0, 160);

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.fondpeace.com/JobTension/${job._id}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://www.fondpeace.com/JobTension/${job._id}`,
      siteName: "Job Tension",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* =========================
   JOB SCHEMA (GOOGLE JOBS)
========================= */
async function getJobSchema(id) {
  const res = await fetch(
    `https://list-back-nine.vercel.app/job/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  const { job } = await res.json();

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.jobTitle,
    description: job.aboutJob,
    datePosted: job.postedDate,
    employmentType: job.jobType,
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.jobLocation,
        addressCountry: "IN",
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "INR",
      value: {
        "@type": "QuantitativeValue",
        value: job.salaryRange,
        unitText: job.salaryType,
      },
    },
    applicantLocationRequirements: job.isRemote
      ? { "@type": "Country", name: "India" }
      : undefined,
    directApply: true,
    identifier: {
      "@type": "PropertyValue",
      name: job.companyName,
      value: job._id,
    },
  };
}

/* =========================
   PAGE COMPONENT
========================= */
export default async function JobDetailPage({ params }) {
  const { id } = params;

  const res = await fetch(
    `https://list-back-nine.vercel.app/job/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return (
      <>
        {/* HEADER */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              FondPeace.com
            </Link>
            {/* <nav className="flex items-center gap-6 text-blue-700 font-semibold text-lg">
              <Link href="/" className="hover:underline">FondPeace</Link>
            </nav> */}
          </div>
        </header>

        {/* JOB NOT FOUND MESSAGE */}
        <div className="max-w-4xl mx-auto mt-20 p-6 text-center border rounded-lg bg-red-50 border-red-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Job Not Found</h2>
          <p className="text-red-600 mb-4">
            The job you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/JobTension"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Browse Other Jobs
          </Link>
        </div>
      </>
    );
  }


  const { job } = await res.json();
  const schema = await getJobSchema(id);

  return (
    <div>
      {/* GOOGLE JOB STRUCTURED DATA */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      )}

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            FondPeace.com
          </Link>

          {/* <nav className="flex items-center gap-6 text-blue-700 font-semibold text-lg">
            <Link href="/" className="hover:underline">
              FondPeace
            </Link>
          </nav> */}
        </div>
      </header>

      <div className="py-6">
        <JobDetailComponent job={job} />
      </div>
    </div>
  );
}










// import JobDetailComponent from "@/Job/JobDetailComponent";
// import Link from "next/link";

// export default async function JobDetailPage({ params }) {
//   const { id } = params;

//   // Call your backend API
//   const res = await fetch(`https://list-back-nine.vercel.app/job/${id}`, { 
//     cache: "no-store" 
//   });

//   if (!res.ok) {
//     return <div className="p-6 text-red-600">Job not found.</div>;
//   }

//   const { job } = await res.json();

//   return (
//     <div>
//       {/* HEADER */}
//       <header className="bg-white shadow-sm sticky top-0 z-50">
//         <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between">

//           <Link href="/JobTension" className="text-2xl font-bold text-blue-600">
//             Job Tension
//           </Link>

//           <nav className="flex items-center gap-6 text-blue-700 font-semibold text-lg">
//             <Link href="/" className="hover:underline">FondPeace</Link>
            
            
//           </nav>

//         </div>
//       </header>
//     <div className="py-6">

//       <JobDetailComponent job={job} />
//     </div>
//     </div>
//   );
// }
