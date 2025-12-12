"use client";

export default function JobPreview({ job }) {
  if (!job) return null;

  return (
    <div className="mt-6 p-6 bg-white rounded-xl shadow space-y-4 max-w-3xl mx-auto">
      {/* Title & Company */}
      <div>
        <h2 className="text-3xl font-bold">{job.jobTitle || "Job Title"}</h2>
        <p className="text-gray-600 text-lg">{job.companyName || "Company Name"}</p>
      </div>

      {/* About Job */}
      <section>
        <h3 className="font-semibold text-lg">About the Job</h3>
        <p className="text-gray-800">{job.aboutJob || "About Job"}</p>
      </section>

      {/* Requirements */}
      <section>
        <h3 className="font-semibold text-lg">Requirements</h3>
        <ul className="list-disc ml-6 text-gray-800">
          {job.requirements?.length > 0 
            ? job.requirements.map((req, i) => <li key={i}>{req}</li>)
            : <li>No requirements listed</li>
          }
        </ul>
      </section>

      {/* Salary */}
      <section>
        <h3 className="font-semibold text-lg">Salary</h3>
        <p className="text-gray-800">
          <strong>{job.salaryType || "Type"}</strong> — {job.salaryRange || "Range"}
        </p>
      </section>

      {/* Job Type & Experience */}
      <section>
        <h3 className="font-semibold text-lg">Job Details</h3>
        <p><strong>Job Type:</strong> {job.jobType || "Type"}</p>
        <p><strong>Experience Level:</strong> {job.experienceLevel || "Level"}</p>
      </section>

      {/* Category */}
      <section>
        <h3 className="font-semibold text-lg">Category</h3>
        <p>{job.category || "Category"}</p>
      </section>

      {/* Skills */}
      <section>
        <h3 className="font-semibold text-lg">Skills Required</h3>
        <p>
          {job.skillsKeywords?.length ? job.skillsKeywords.join(", ") : "No skills listed"}
        </p>
      </section>

      {/* Location */}
      <section>
        <h3 className="font-semibold text-lg">Location</h3>
        <p>{job.jobLocation || "Location not specified"}</p>
      </section>

      {/* Remote */}
      {job.isRemote && (
        <p className="bg-green-100 text-green-700 inline-block px-3 py-1 rounded-lg">
          Remote Job Available
        </p>
      )}

      {/* Apply Link */}
      <div className="mt-4">
        <a
          href={job.applyLink || "#"}
          target="_blank"
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
}
