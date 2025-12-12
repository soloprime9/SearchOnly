// app/jobs/page.js
import JobsPageView from "@/components/JobsPageView";

export default async function JobsPage() {
  const res = await fetch("https://your-backend.com/job/all", {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Job Tension</h1>
        <p className="text-red-600">Failed to load jobs. Please try again later.</p>
      </div>
    );
  }

  const { jobs } = await res.json();

  return <JobsPageView jobs={jobs} />;
}
