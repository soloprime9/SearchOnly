import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaBriefcase,
  FaClock,
  FaArrowRight,
  FaLaptopHouse,
} from "react-icons/fa";

export default function JobsPageView({ jobs }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            FondPeace <span className="text-slate-800">Jobs</span>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* TITLE */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">
            Latest Job Openings
          </h1>
          <p className="mt-1 text-slate-600">
            Hand-picked & verified opportunities across India
          </p>
        </div>

        {/* EMPTY */}
        {!jobs || jobs.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <p className="text-slate-500 text-lg">
              No jobs available right now.
            </p>
          </div>
        ) : (

          /* JOB GRID */
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Link
                key={job._id}
                href={`/JobTension/${job._id}`}
                className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >

                {/* TOP ROW */}
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition">
                    {job.jobTitle}
                  </h2>

                  {job.isRemote && (
                    <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                      <FaLaptopHouse />
                      Remote
                    </span>
                  )}
                </div>

                {/* COMPANY */}
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                  <FaBuilding className="text-slate-400" />
                  <span className="font-medium">{job.companyName}</span>
                </div>

                {/* LOCATION */}
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <FaMapMarkerAlt />
                  <span>{job.jobLocation || "Location not specified"}</span>
                </div>

                {/* ABOUT */}
                {job.aboutJob && (
                  <p className="mt-4 text-sm text-slate-600 line-clamp-3">
                    {job.aboutJob}
                  </p>
                )}

                {/* META TAGS */}
                <div className="mt-5 flex flex-wrap gap-2 text-xs">

                  {job.jobType && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                      <FaBriefcase />
                      {job.jobType}
                    </span>
                  )}

                  {job.experienceLevel && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700">
                      <FaClock />
                      {job.experienceLevel}
                    </span>
                  )}

                  {job.salaryType && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700">
                      <FaMoneyBillWave />
                      {job.salaryType}
                    </span>
                  )}

                  {job.salaryRange && (
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-medium">
                      {job.salaryRange}
                    </span>
                  )}
                </div>

                {/* FOOTER */}
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    View details
                  </span>

                  <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
                    Apply
                    <FaArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}










// import Link from "next/link";

// export default function JobsPageView({ jobs }) {
//   return (
//     <div className="min-h-screen bg-gray-100">

//       {/* HEADER */}
//       <header className="bg-white shadow-sm sticky top-0 z-50">
//         <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between">

//           <Link href="/" className="text-2xl font-bold text-blue-600">
//             FondPeace.com
//           </Link>

//           {/* <nav className="flex items-center gap-6 text-blue-700 font-semibold text-lg">
//             <Link href="/" className="hover:underline">FondPeace</Link>
            
            
//           </nav> */}

//         </div>
//       </header>

//       {/* PAGE CONTENT */}
//       <main className="max-w-5xl mx-auto px-6 py-10">
//         <h2 className="text-3xl font-bold mb-6 text-gray-800">🔥 Latest Jobs</h2>

//         {!jobs || jobs.length === 0 ? (
//           <p className="text-gray-500">No jobs available right now.</p>
//         ) : (
//           <div className="space-y-6">
//             {jobs.map((job) => (
//               <Link
//                 key={job._id}
//                 href={`/JobTension/${job._id}`}
//                 className="block border bg-white p-6 rounded-xl shadow hover:shadow-md hover:-translate-y-1 transition-all duration-200"
//               >
//                 {/* TITLE */}
//                 <div className="flex justify-between">
//                   <h3 className="text-xl font-bold text-gray-900">
//                     {job.jobTitle}
//                   </h3>

//                   {job.isRemote && (
//                     <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs h-max">
//                       Remote
//                     </span>
//                   )}
//                 </div>

//                 {/* COMPANY */}
//                 <p className="text-gray-700 mt-1 font-medium">
//                   {job.companyName}
//                 </p>

//                 {/* LOCATION */}
//                 <p className="text-sm text-gray-500 mt-1">
//                   📍 {job.jobLocation || "Location not specified"}
//                 </p>

//                 {/* SHORT ABOUT JOB */}
//                 {job.aboutJob && (
//                   <p className="text-gray-600 mt-3 text-sm line-clamp-2">
//                     {job.aboutJob.length > 140
//                       ? job.aboutJob.slice(0, 140) + "..."
//                       : job.aboutJob}
//                   </p>
//                 )}

//                 {/* TAGS */}
//                 <div className="flex flex-wrap items-center gap-2 mt-4 text-sm">

//                   {/* Job Type */}
//                   {job.jobType && (
//                     <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full">
//                       {job.jobType}
//                     </span>
//                   )}

//                   {/* Experience */}
//                   {job.experienceLevel && (
//                     <span className="px-3 py-1 bg-green-50 text-red-800 rounded-full">
//                       {job.experienceLevel}
//                     </span>
//                   )}

//                   {/* Salary Type */}
//                   {job.salaryType && (
//                     <span className="px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full">
//                       {job.salaryType}
//                     </span>
//                   )}

//                   {/* Salary Range */}
//                   {job.salaryRange && (
//                     <span className="px-3 py-1 bg-blue-800 text-white rounded-full">
//                       {job.salaryRange}
//                     </span>
//                   )}

//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
