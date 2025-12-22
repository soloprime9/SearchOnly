"use client";
import JobsFAQ from "./JobsFAQ";
import { useState } from "react";
import Link from "next/link";
import {
  FaBars,
  FaTimes,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaLaptop
} from "react-icons/fa";

export default function JobsPageView({ jobs }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ================= NAVBAR ================= */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600">
            FondPeace Jobs
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-6 font-medium text-gray-700">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <Link href="/JobTension/login" className="hover:text-blue-600">Login</Link>
            <Link href="/JobTension/register" className="hover:text-blue-600">Signup</Link>
            <Link
              href="/JobTension/post-job"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Post Job Free
            </Link>
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <FaBars />
          </button>
        </div>

        {/* MOBILE DRAWER */}
        {menuOpen && (
          <div className="fixed inset-0 bg-black/40 z-50">
            <div className="absolute right-0 top-0 h-full w-72 bg-white p-6 flex flex-col gap-5">
              <button
                className="self-end text-2xl"
                onClick={() => setMenuOpen(false)}
              >
                <FaTimes />
              </button>

              <Link onClick={() => setMenuOpen(false)} href="/">Home</Link>
              <Link onClick={() => setMenuOpen(false)} href="/JobTension/login">Login</Link>
              <Link onClick={() => setMenuOpen(false)} href="/JobTension/register">Signup</Link>

              <Link
                onClick={() => setMenuOpen(false)}
                href="/JobTension/post-job"
                className="mt-4 bg-blue-600 text-white text-center py-2 rounded-lg"
              >
                Post Job Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ================= CTA ================= */}
      <section className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Post Jobs Free on FondPeace
          </h1>
          <p className="mt-2 text-white/90 max-w-2xl mx-auto">
            Hire faster. Reach thousands of verified job seekers across India.
          </p>

          <Link
            href="/JobTension/upload"
            className="inline-block mt-5 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold"
          >
            Post Job Free
          </Link>
        </div>
      </section>

      {/* ================= JOB LIST ================= */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">Latest Jobs</h2>

        {!jobs || jobs.length === 0 ? (
          <p className="text-gray-500">No jobs available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Link
                key={job._id}
                href={`/JobTension/${job._id}`}
                className="bg-white rounded-xl p-5 border-4 shadow hover:shadow-lg transition"
              >
                <h3 className="text-lg text-blue-900 font-bold">
                  {job.jobTitle}
                </h3>

                <p className="text-gray-700 mt-1 font-medium">
                  {job.companyName}
                </p>

                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  {job.jobLocation && (
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt />
                      {job.jobLocation}
                    </div>
                  )}

                  {job.salaryRange && (
                    <div className="flex items-center gap-2 text-green-600">
                      <FaDollarSign />
                      {job.salaryRange}
                    </div>
                  )}

                  {job.experienceLevel && (
                    <div className="flex items-center gap-2">
                      <FaClock />
                      {job.experienceLevel}
                    </div>
                  )}
                </div>

                {job.aboutJob && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                    {job.aboutJob}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-4 text-xs">
                  {job.jobType && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {job.jobType}
                    </span>
                  )}
                  {job.isRemote && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                      Remote
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ================= INFO CARDS ================= */}
        <section className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            ["Verified Jobs", "Only genuine listings", FaLaptop],
            ["Free Posting", "No charges for employers", FaDollarSign],
            ["Daily Updates", "Fresh jobs every day", FaClock],
            ["Remote Friendly", "Work from anywhere", FaLaptop],
          ].map(([title, desc, Icon], i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow text-center"
            >
              <Icon className="text-3xl text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </section>

        {/* ================= FAQ ================= */}

        <JobsFAQ />
        
      </main>

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
              <li><Link href="/JobTension/post-job">Post Job Free</Link></li>
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

// import Link from "next/link";
// import { FaMapMarkerAlt, FaClock, FaDollarSign, FaLaptopCode } from "react-icons/fa";

// export default function JobsPageView({ jobs }) {
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">

//       {/* TOP NAVBAR */}
//       <header className="bg-white shadow sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//           <Link href="/" className="text-2xl font-bold text-blue-600">
//             FondPeace Jobs
//           </Link>
//           <nav className="flex items-center gap-6 text-gray-700 font-medium">
//             <Link href="/" className="hover:text-blue-600 transition">Home</Link>
//             <Link href="/JobTension/login" className="hover:text-blue-600 transition">Login</Link>
//             <Link href="/JobTension/register" className="hover:text-blue-600 transition">Signup</Link>
//           </nav>
//         </div>
//       </header>

//       {/* CTA BANNER */}
//       <section className="bg-blue-600 text-white py-6 relative overflow-hidden">
//         <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
//           <div>
//             <h2 className="text-3xl font-bold">Post Your Job Free</h2>
//             <p className="mt-2 text-white/90">
//               Reach thousands of job seekers across India. Easy, fast, and completely free.
//             </p>
//           </div>
//           <Link
//             href="/JobTension/post-job"
//             className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow hover:shadow-lg transition"
//           >
//             Post Job Free
//           </Link>
//         </div>
//       </section>

//       {/* JOB LIST */}
//       <main className="max-w-7xl mx-auto px-6 py-10 flex-1">
//         <h2 className="text-3xl font-bold mb-6 text-gray-800">🔥 Latest Jobs</h2>

//         {!jobs || jobs.length === 0 ? (
//           <p className="text-gray-500">No jobs available right now.</p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {jobs.map((job) => (
//               <Link
//                 key={job._id}
//                 href={`/JobTension/${job._id}`}
//                 className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 flex flex-col justify-between"
//               >
//                 <div>
//                   {/* TITLE */}
//                   <div className="flex justify-between items-center">
//                     <h3 className="text-xl font-bold text-gray-900">{job.jobTitle}</h3>
//                     {job.isRemote && (
//                       <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
//                         Remote
//                       </span>
//                     )}
//                   </div>

//                   {/* COMPANY */}
//                   <p className="text-gray-700 mt-1 font-medium">{job.companyName}</p>

//                   {/* LOCATION & EXPERIENCE */}
//                   <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
//                     {job.jobLocation && (
//                       <span className="flex items-center gap-1"><FaMapMarkerAlt /> {job.jobLocation}</span>
//                     )}
//                     {job.experienceLevel && (
//                       <span className="flex items-center gap-1"><FaClock /> {job.experienceLevel}</span>
//                     )}
//                   </div>

//                   {/* SALARY */}
//                   {job.salaryRange && (
//                     <p className="flex items-center gap-1 text-sm text-green-600 mt-2">
//                       <FaDollarSign /> {job.salaryRange}
//                     </p>
//                   )}

//                   {/* ABOUT JOB */}
//                   {job.aboutJob && (
//                     <p className="text-gray-600 mt-3 text-sm line-clamp-3">
//                       {job.aboutJob.length > 140
//                         ? job.aboutJob.slice(0, 140) + "..."
//                         : job.aboutJob}
//                     </p>
//                   )}
//                 </div>

//                 {/* TAGS */}
//                 <div className="flex flex-wrap items-center gap-2 mt-4">
//                   {job.jobType && (
//                     <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs">{job.jobType}</span>
//                   )}
//                   {job.salaryType && (
//                     <span className="px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-xs">{job.salaryType}</span>
//                   )}
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}

//         {/* FEATURE CARDS */}
//         <section className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div className="bg-white shadow-md p-6 rounded-xl flex flex-col items-center text-center">
//             <FaLaptopCode className="text-blue-600 text-4xl mb-3" />
//             <h3 className="font-bold text-lg">Verified Jobs</h3>
//             <p className="text-gray-500 mt-1 text-sm">All jobs are verified for authenticity.</p>
//           </div>
//           <div className="bg-white shadow-md p-6 rounded-xl flex flex-col items-center text-center">
//             <FaDollarSign className="text-green-600 text-4xl mb-3" />
//             <h3 className="font-bold text-lg">Free Posting</h3>
//             <p className="text-gray-500 mt-1 text-sm">Post jobs free of cost on FondPeace Jobs.</p>
//           </div>
//           <div className="bg-white shadow-md p-6 rounded-xl flex flex-col items-center text-center">
//             <FaClock className="text-red-600 text-4xl mb-3" />
//             <h3 className="font-bold text-lg">Updated Daily</h3>
//             <p className="text-gray-500 mt-1 text-sm">New jobs are added and updated daily.</p>
//           </div>
//           <div className="bg-white shadow-md p-6 rounded-xl flex flex-col items-center text-center">
//             <FaLaptopCode className="text-purple-600 text-4xl mb-3" />
//             <h3 className="font-bold text-lg">Remote Friendly</h3>
//             <p className="text-gray-500 mt-1 text-sm">Find remote-friendly jobs across India.</p>
//           </div>
//         </section>

//         {/* ABOUT & FAQ */}
//         <section className="mt-16 bg-white p-6 rounded-xl shadow-md">
//           <h2 className="text-2xl font-bold mb-4">About FondPeace Jobs</h2>
//           <p className="text-gray-700 mb-6">
//             FondPeace Jobs is a free platform for job seekers across India. You can find IT jobs, fresher jobs, remote opportunities, internships, and openings from top MNCs. All job postings are verified, updated daily, and completely free for employers.
//           </p>

//           <h2 className="text-xl font-bold mb-3">Frequently Asked Questions</h2>
//           <ul className="list-disc pl-5 space-y-2 text-gray-700">
//             <li>Is FondPeace Jobs free to use? <strong>Yes</strong>, completely free for job seekers.</li>
//             <li>What types of jobs are available? IT, fresher, internships, remote, MNC jobs.</li>
//             <li>How often are jobs updated? <strong>Daily</strong>, new openings are added every day.</li>
//             <li>Do I need an account to apply? <strong>Yes</strong>, login is required to apply for jobs.</li>
//           </ul>
//         </section>
//       </main>

//       {/* FOOTER */}
//       <footer className="bg-gray-800 text-gray-200 mt-16">
//         <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div>
//             <h3 className="font-bold text-lg mb-3">FondPeace Jobs</h3>
//             <p className="text-gray-400 text-sm">Connecting job seekers with verified opportunities across India.</p>
//           </div>
//           <div>
//             <h3 className="font-bold text-lg mb-3">Quick Links</h3>
//             <ul className="space-y-2">
//               <li><Link href="/" className="hover:text-white transition">Home</Link></li>
//               <li><Link href="/JobTension/login" className="hover:text-white transition">Login</Link></li>
//               <li><Link href="/JobTension/register" className="hover:text-white transition">Register</Link></li>
//               <li><Link href="/JobTension/post-job" className="hover:text-white transition">Post Job Free</Link></li>
//             </ul>
//           </div>
//           <div>
//             <h3 className="font-bold text-lg mb-3">Contact</h3>
//             <p className="text-gray-400 text-sm">support@fondpeace.com</p>
//             <p className="text-gray-400 text-sm mt-1">+91 98765 43210</p>
//             <p className="text-gray-400 text-sm mt-1">India</p>
//           </div>
//         </div>
//         <div className="text-center text-gray-500 text-sm py-4 border-t border-gray-700">
//           © 2025 FondPeace Jobs. All Rights Reserved.
//         </div>
//       </footer>
//     </div>
//   );
// }











// import Link from "next/link";
// import {
//   FaMapMarkerAlt,
//   FaBuilding,
//   FaMoneyBillWave,
//   FaBriefcase,
//   FaClock,
//   FaArrowRight,
//   FaLaptopHouse,
// } from "react-icons/fa";

// export default function JobsPageView({ jobs }) {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">

//       {/* ===== HEADER ===== */}
//       <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
//         <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
//           <Link href="/" className="text-xl font-bold text-blue-600">
//             FondPeace <span className="text-slate-800">Jobs</span>
//           </Link>

//           <Link
//             href="/"
//             className="text-sm font-medium text-slate-600 hover:text-blue-600 transition"
//           >
//             ← Back to Home
//           </Link>
//         </div>
//       </header>

//       {/* ===== MAIN ===== */}
//       <main className="max-w-7xl mx-auto px-6 py-10">

//         {/* TITLE */}
//         <div className="mb-10">
//           <h1 className="text-3xl font-bold text-slate-900">
//             Latest Job Openings
//           </h1>
//           <p className="mt-1 text-slate-600">
//             Hand-picked & verified opportunities across India
//           </p>
//         </div>

//         {/* EMPTY */}
//         {!jobs || jobs.length === 0 ? (
//           <div className="bg-white rounded-xl p-10 text-center shadow-sm">
//             <p className="text-slate-500 text-lg">
//               No jobs available right now.
//             </p>
//           </div>
//         ) : (

//           /* JOB GRID */
//           <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//             {jobs.map((job) => (
//               <Link
//                 key={job._id}
//                 href={`/JobTension/${job._id}`}
//                 className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
//               >

//                 {/* TOP ROW */}
//                 <div className="flex items-start justify-between gap-3">
//                   <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition">
//                     {job.jobTitle}
//                   </h2>

//                   {job.isRemote && (
//                     <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
//                       <FaLaptopHouse />
//                       Remote
//                     </span>
//                   )}
//                 </div>

//                 {/* COMPANY */}
//                 <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
//                   <FaBuilding className="text-slate-400" />
//                   <span className="font-medium">{job.companyName}</span>
//                 </div>

//                 {/* LOCATION */}
//                 <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
//                   <FaMapMarkerAlt />
//                   <span>{job.jobLocation || "Location not specified"}</span>
//                 </div>

//                 {/* ABOUT */}
//                 {job.aboutJob && (
//                   <p className="mt-4 text-sm text-slate-600 line-clamp-3">
//                     {job.aboutJob}
//                   </p>
//                 )}

//                 {/* META TAGS */}
//                 <div className="mt-5 flex flex-wrap gap-2 text-xs">

//                   {job.jobType && (
//                     <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700">
//                       <FaBriefcase />
//                       {job.jobType}
//                     </span>
//                   )}

//                   {job.experienceLevel && (
//                     <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700">
//                       <FaClock />
//                       {job.experienceLevel}
//                     </span>
//                   )}

//                   {job.salaryType && (
//                     <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700">
//                       <FaMoneyBillWave />
//                       {job.salaryType}
//                     </span>
//                   )}

//                   {job.salaryRange && (
//                     <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-medium">
//                       {job.salaryRange}
//                     </span>
//                   )}
//                 </div>

//                 {/* FOOTER */}
//                 <div className="mt-6 flex items-center justify-between">
//                   <span className="text-sm text-slate-500">
//                     View details
//                   </span>

//                   <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
//                     Apply
//                     <FaArrowRight />
//                   </span>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }










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
