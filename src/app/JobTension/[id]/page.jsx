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
    <div className="py-10">
      <JobDetailComponent job={job} />
    </div>
  );
}
