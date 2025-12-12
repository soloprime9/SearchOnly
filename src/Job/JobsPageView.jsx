import Link from "next/link";

export default function JobsPageView({ jobs }) {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between">

          <Link href="/JobTension" className="text-2xl font-bold text-blue-600">
            Job Tension
          </Link>

          <nav className="flex items-center gap-6 text-blue-700 font-semibold text-lg">
            <Link href="/" className="hover:underline">FondPeace</Link>
            
            <Link href="/IntroList" className="hover:underline">IntroList</Link>
          </nav>

        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">🔥 Latest Jobs</h2>

        {!jobs || jobs.length === 0 ? (
          <p className="text-gray-500">No jobs available right now.</p>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <Link
                key={job._id}
                href={`/JobTension/${job._id}`}
                className="block border bg-white p-6 rounded-xl shadow hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                {/* TITLE */}
                <div className="flex justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    {job.jobTitle}
                  </h3>

                  {job.isRemote && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs h-max">
                      Remote
                    </span>
                  )}
                </div>

                {/* COMPANY */}
                <p className="text-gray-700 mt-1 font-medium">
                  {job.companyName}
                </p>

                {/* LOCATION */}
                <p className="text-sm text-gray-500 mt-1">
                  📍 {job.jobLocation || "Location not specified"}
                </p>

                {/* SHORT ABOUT JOB */}
                {job.aboutJob && (
                  <p className="text-gray-600 mt-3 text-sm line-clamp-2">
                    {job.aboutJob.length > 140
                      ? job.aboutJob.slice(0, 140) + "..."
                      : job.aboutJob}
                  </p>
                )}

                {/* TAGS */}
                <div className="flex flex-wrap items-center gap-2 mt-4 text-sm">

                  {/* Job Type */}
                  {job.jobType && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full">
                      {job.jobType}
                    </span>
                  )}

                  {/* Experience */}
                  {job.experienceLevel && (
                    <span className="px-3 py-1 bg-green-50 text-red-800 rounded-full">
                      {job.experienceLevel}
                    </span>
                  )}

                  {/* Salary Type */}
                  {job.salaryType && (
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full">
                      {job.salaryType}
                    </span>
                  )}

                  {/* Salary Range */}
                  {job.salaryRange && (
                    <span className="px-3 py-1 bg-blue-800 text-white rounded-full">
                      {job.salaryRange}
                    </span>
                  )}

                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
