import JobDetailComponent from "@/Job/JobDetailComponent";

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
      <header className="bg-white shadow">
  <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
    
    {/* LEFT SIDE */}
    <h1 className="text-3xl font-bold text-blue-600">
      Job Tension
    </h1>

    {/* RIGHT SIDE */}
    <div className="text-right space-y-0 leading-tight hidden sm:block">
      <p className="text-xl font-bold text-blue-700">FondPeace</p>
      <p className="text-xl font-bold text-blue-700">Intro List</p>
    </div>

    {/* Mobile Layout */}
    <div className="sm:hidden text-right">
      <p className="text-lg font-bold text-blue-700">FondPeace</p>
      <p className="text-lg font-bold text-blue-700">Intro List</p>
    </div>

  </div>
</header>
    <div className="py-6">

      <JobDetailComponent job={job} />
    </div>
    </div>
  );
}
