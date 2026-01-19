
const API_BASE = "https://backend-k.vercel.app";
export async function generateMetadata({ params }) {
  const text = params.slug.replace(/-/g, " ");
  
  return {
    title: `${text} – Search Results | FondPeace`,
    description: `Browse latest posts, news and discussions related to ${text} on FondPeace.`
  };
}

export default async function TopicPage({ params }) {
  const slug = params.slug;
  console.log(slug);

  const res = await fetch(
    `${API_BASE}/post/single/search?q=${slug}`,
    { cache: "no-store" }
  );

  const posts = await res.json();
  console.log(posts);
  if (!posts || posts.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-xl font-bold capitalize">
          {slug.replace(/-/g, " ")}
        </h1>
        <p className="text-gray-500 mt-2">
          No posts found yet. This topic will update automatically.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold capitalize">
        {slug.replace(/-/g, " ")}
      </h1>

      <p className="text-gray-600 mt-2">
        Latest posts related to this topic.
      </p>

      <div className="mt-6 space-y-4">
        {posts.map(p => (
          <a key={p._id} href={`/short/${p._id}`} className="block border-b pb-3">
            <h2 className="font-semibold">{p.title}</h2>
          </a>
        ))}
      </div>
    </main>
  );
}
