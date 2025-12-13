import JobDetailComponent from "@/Job/JobDetailComponent";
import Link from "next/link";

export default async function JobDetailPage({ params }) {
  const { id } = params;

  // Call your backend API
  const res = await fetch(`https://list-back-nine.vercel.app/job/${id}`, { 
    cache: "no-store" 
  });

  if (!res.ok) {
    return <div className="p-6 text-red-600">Job not found.</div>;
  }

  const { job } = await res.json();

  return (
    <div>
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between">

          <Link href="/JobTension" className="text-2xl font-bold text-blue-600">
            Job Tension
          </Link>

          <nav className="flex items-center gap-6 text-blue-700 font-semibold text-lg">
            <Link href="/" className="hover:underline">FondPeace</Link>
            
            
          </nav>

        </div>
      </header>
    <div className="py-6">

      <JobDetailComponent job={job} />
    </div>
    </div>
  );
}
