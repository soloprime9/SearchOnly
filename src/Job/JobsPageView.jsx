// components/JobsPageView.jsx 
export default function JobsPageView({ jobs }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Website Header */}
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-blue-600">Job Tension</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Latest Jobs</h2>

        {/* Empty State */}
        {(!jobs || jobs.length === 0) && (
          <p className="text-gray-600">No jobs available right now.</p>
        )}

        {/* Job List */}
        <div className="space-y-6">
          {jobs?.map((job) => (
            <a
              key={job._id}
              href={`/jobs/${job._id}`}
              className="block border bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                {job.jobTitle}
              </h3>

              <p className="text-gray-700 mt-1 font-medium">
                {job.companyName}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                📍 {job.jobLocation || "Location not specified"}
              </p>

              {/* Tags / Additional Info */}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                {job.salaryType && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                    {job.salaryType}
                  </span>
                )}

                {job.experience && (
                  <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs">
                    {job.experience} Exp
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
