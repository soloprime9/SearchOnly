"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaLaptop,
  FaCheckCircle,
  FaChevronDown,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function JobDetailComponent({ job }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  if (!job) return <p className="text-center mt-10">No job found.</p>;

  const faqs = [
    {
      q: "Is FondPeace Jobs free?",
      a: "Yes, FondPeace Jobs is completely free for job seekers and employers.",
    },
    {
      q: "Do I need to login to apply?",
      a: "Yes. Login is required to keep applications genuine and secure.",
    },
    {
      q: "Are these jobs verified?",
      a: "All job posts go through moderation before being published.",
    },
    {
      q: "Can companies post jobs for free?",
      a: "Yes. Any company or recruiter can post jobs for free on FondPeace.",
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* ================= NAVBAR ================= */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            FondPeace
          </Link>

          <nav className="hidden md:flex gap-6 font-medium text-gray-700">
            <Link href="/">Home</Link>
            <Link href="/JobTension">Jobs</Link>
            <Link href="/JobTension/login">Login</Link>
            <Link href="/JobTension/register">Signup</Link>
          </nav>

          {/* Mobile Menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-xl"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-3 space-y-2">
            <Link href="/" className="block">Home</Link>
            <Link href="/JobTension" className="block">Jobs</Link>
            <Link href="/JobTension/login" className="block">Login</Link>
            <Link href="/JobTension/register" className="block">Signup</Link>
          </div>
        )}
      </header>

      {/* ================= CTA BANNER ================= */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">
            Hiring? Post Your Job Free on FondPeace
          </h2>
          <p className="text-white/90 mb-4">
            Reach real candidates • Zero cost • Fast approval
          </p>
          <Link
            href="/JobTension/upload"
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold shadow hover:scale-105 transition"
          >
            Post Job Free
          </Link>
        </div>
      </section>

      {/* ================= JOB DETAIL ================= */}
      <main className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">

        {/* LEFT CONTENT */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow space-y-6">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {job.jobTitle}
            </h1>
            <p className="text-lg text-gray-600">{job.companyName}</p>
          </div>

          {/* INFO GRID */}
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <p className="flex items-center gap-2">
              <FaMapMarkerAlt /> {job.jobLocation}
            </p>
            <p className="flex items-center gap-2">
              <FaBriefcase /> {job.jobType}
            </p>
            <p className="flex items-center gap-2">
              <FaMoneyBillWave /> {job.salaryRange}
            </p>
            <p className="flex items-center gap-2">
              <FaClock /> {job.experienceLevel}
            </p>
            {job.isRemote && (
              <p className="flex items-center gap-2 text-green-600">
                <FaLaptop /> Remote Available
              </p>
            )}
          </div>

          {/* ABOUT */}
          <section>
            <h3 className="font-semibold text-lg mb-1">About the Job</h3>
            <p className="text-gray-700 leading-relaxed">
              {job.aboutJob}
            </p>
          </section>

          {/* REQUIREMENTS */}
          {job.requirements?.length > 0 && (
            <section>
              <h3 className="font-semibold text-lg mb-2">Requirements</h3>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex gap-2">
                    <FaCheckCircle className="text-green-600 mt-1" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* SKILLS */}
          <section>
            <h3 className="font-semibold text-lg mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skillsKeywords?.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT APPLY CARD */}
        <aside className="bg-white p-6 rounded-xl shadow h-fit sticky top-24">
          <h3 className="font-semibold text-lg mb-4">Apply for this job</h3>

          <a
            href={job.applyLink}
            target="_blank"
            className="block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Apply Now
          </a>

          <p className="text-xs text-gray-500 mt-3 text-center">
            Application opens in new tab
          </p>
        </aside>
      </main>

      {/* ================= FAQ ================= */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">
          FondPeace Jobs – FAQ
        </h2>

        <div className="space-y-4">
          {faqs.map((f, i) => {
            const open = openFaq === i;
            return (
              <div
                key={i}
                className="bg-white rounded-xl shadow overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex justify-between items-center px-6 py-4 font-semibold"
                >
                  {f.q}
                  <FaChevronDown
                    className={`transition ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <p className="px-6 pb-4 text-gray-600 text-sm">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="font-bold text-white">FondPeace Jobs</h3>
            <p className="text-sm mt-2">
              Free job portal for India. Trusted & transparent.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white">Links</h4>
            <ul className="mt-2 space-y-1 text-sm">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/JobTension/login">Login</Link></li>
              <li><Link href="/JobTension/register">Signup</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">For Employers</h4>
            <ul className="mt-2 space-y-1 text-sm">
              <li><Link href="/JobTension/upload">Post Job Free</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white">Contact</h4>
            <p className="text-sm mt-2">support@fondpeace.com</p>
            <p className="text-sm">India</p>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 border-t border-gray-700 py-4">
          © {new Date().getFullYear()} FondPeace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}











// "use client";

// export default function JobDetailComponent({ job }) {
//   if (!job) return <p>No job found.</p>;

//   return (
//     <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl space-y-6">

//       {/* Title & Company */}
//       <div>
//         <h1 className="text-3xl font-bold">{job.jobTitle}</h1>
//         <p className="text-gray-600 text-lg">{job.companyName}</p>
//       </div>

//       {/* About Job */}
//       <section>
//         <h3 className="font-semibold text-lg">About the Job</h3>
//         <p className="text-gray-800">{job.aboutJob}</p>
//       </section>

//       {/* Requirements */}
//       <section>
//         <h3 className="font-semibold text-lg">Requirements</h3>
//         <ul className="list-disc ml-6 text-gray-800">
//           {job.requirements?.map((req, i) => (
//             <li key={i}>{req}</li>
//           ))}
//         </ul>
//       </section>

//       {/* Salary Info */}
//       <section>
//         <h3 className="font-semibold text-lg">Salary</h3>
//         <p className="text-gray-800">
//           <strong>{job.salaryType}</strong> — {job.salaryRange}
//         </p>
//       </section>

//       {/* Job Type, Experience */}
//       <section>
//         <h3 className="font-semibold text-lg">Job Details</h3>
//         <p><strong>Job Type:</strong> {job.jobType}</p>
//         <p><strong>Experience Level:</strong> {job.experienceLevel}</p>
//       </section>

//       {/* Category */}
//       <section>
//         <h3 className="font-semibold text-lg">Category</h3>
//         <p>{job.category}</p>
//       </section>

//       {/* Skills */}
//       <section>
//         <h3 className="font-semibold text-lg">Skills Required</h3>
//         <p>{job.skillsKeywords?.length ? job.skillsKeywords.join(", ") : "No skills listed"}</p>
//       </section>

//       {/* Location */}
//       <section>
//         <h3 className="font-semibold text-lg">Location</h3>
//         <p>{job.jobLocation}</p>
//       </section>

//       {/* Remote */}
//       {job.isRemote && (
//         <p className="bg-green-100 text-green-700 inline-block px-3 py-1 rounded-lg">
//           Remote Job Available
//         </p>
//       )}

//       {/* Dates */}
//       <section>
//         <h3 className="font-semibold text-lg">Posted Information</h3>
//         <p><strong>Posted on:</strong> {new Date(job.postedDate).toDateString()}</p>
//         <p><strong>Created At:</strong> {new Date(job.createdAt).toLocaleString()}</p>
//         <p><strong>Updated At:</strong> {new Date(job.updatedAt).toLocaleString()}</p>
//       </section>

//       {/* Apply */}
//       <div className="mt-6">
//         <a
//           href={job.applyLink}
//           target="_blank"
//           className="px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
//         >
//           Apply Now
//         </a>
//       </div>
//     </div>
//   );
// }
