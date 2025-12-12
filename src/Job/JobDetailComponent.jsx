"use client";

export default function JobDetailComponent({ job }) {
  if (!job) return <p>No job found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl space-y-6">

      {/* Title & Company */}
      <div>
        <h1 className="text-3xl font-bold">{job.jobTitle}</h1>
        <p className="text-gray-600 text-lg">{job.companyName}</p>
      </div>

      {/* About Job */}
      <section>
        <h3 className="font-semibold text-lg">About the Job</h3>
        <p className="text-gray-800">{job.aboutJob}</p>
      </section>

      {/* Requirements */}
      <section>
        <h3 className="font-semibold text-lg">Requirements</h3>
        <ul className="list-disc ml-6 text-gray-800">
          {job.requirements?.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </section>

      {/* Salary Info */}
      <section>
        <h3 className="font-semibold text-lg">Salary</h3>
        <p className="text-gray-800">
          <strong>{job.salaryType}</strong> — {job.salaryRange}
        </p>
      </section>

      {/* Job Type, Experience */}
      <section>
        <h3 className="font-semibold text-lg">Job Details</h3>
        <p><strong>Job Type:</strong> {job.jobType}</p>
        <p><strong>Experience Level:</strong> {job.experienceLevel}</p>
      </section>

      {/* Category */}
      <section>
        <h3 className="font-semibold text-lg">Category</h3>
        <p>{job.category}</p>
      </section>

      {/* Skills */}
      <section>
        <h3 className="font-semibold text-lg">Skills Required</h3>
        <p>{job.skillsKeywords?.length ? job.skillsKeywords.join(", ") : "No skills listed"}</p>
      </section>

      {/* Location */}
      <section>
        <h3 className="font-semibold text-lg">Location</h3>
        <p>{job.jobLocation}</p>
      </section>

      {/* Remote */}
      {job.isRemote && (
        <p className="bg-green-100 text-green-700 inline-block px-3 py-1 rounded-lg">
          Remote Job Available
        </p>
      )}

      {/* Dates */}
      <section>
        <h3 className="font-semibold text-lg">Posted Information</h3>
        <p><strong>Posted on:</strong> {new Date(job.postedDate).toDateString()}</p>
        <p><strong>Created At:</strong> {new Date(job.createdAt).toLocaleString()}</p>
        <p><strong>Updated At:</strong> {new Date(job.updatedAt).toLocaleString()}</p>
      </section>

      {/* Apply */}
      <div className="mt-6">
        <a
          href={job.applyLink}
          target="_blank"
          className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
}
