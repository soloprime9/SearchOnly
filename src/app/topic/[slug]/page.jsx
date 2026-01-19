import TopicPage from "@/components/TopicPage";

export async function generateMetadata({ params }) {
  const topicText = params.slug.replace(/-/g, " ");
  return {
    title: `${topicText} – Search Results | FondPeace`,
    description: `Browse latest posts, news and discussions related to ${topicText} on FondPeace.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function TopicPost({ params }) {
  const topic = params.slug.replace(/-/g, " ");

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold capitalize">{topic}</h1>
      <p className="text-gray-600 mt-2">Latest posts related to this topic:</p>

      {/* ✅ Reusable component */}
      <TopicPage topic={topic} />
    </main>
  );
}
