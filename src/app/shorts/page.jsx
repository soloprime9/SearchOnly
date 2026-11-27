// src/app/shorts/page.jsx
import Link from "next/link";
import ReelsFeedWrapper from "@/components/ReelsFeedWrapper";
import { fetchApiRead } from "@/utils/apiConfig";
import { resolvePostThumbnail } from "@/utils/resolvePostThumbnail";
import { truncateWords } from "@/utils/captionUtils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shorts & Reels — Trending Vertical Videos",
  description:
    "Watch trending shorts and reels on FondPeace. High-octane vertical videos, fresh creators, and viral moments.",
  alternates: {
    canonical: "https://www.fondpeace.com/shorts",
  },
  openGraph: {
    title: "Shorts & Reels | FondPeace",
    description: "Watch trending shorts and viral vertical videos on FondPeace.",
    url: "https://www.fondpeace.com/shorts",
    siteName: "FondPeace",
    images: [{ url: "https://www.fondpeace.com/Fondpeace.jpg" }],
    type: "website",
  },
};

export default async function ShortsPage() {
  let initialPost = null;
  let initialRelated = [];

  try {
    const res = await fetchApiRead(`/post/shorts/feed?page=1&limit=10&sort=trending`, {
      fetchOptions: { cache: "no-store" },
      timeoutMs: 10000,
    });
    if (res?.ok) {
      const data = await res.json();
      if (Array.isArray(data?.videos) && data.videos.length > 0) {
        initialPost = data.videos[0];
        initialRelated = data.videos.slice(1);
      }
    }
  } catch (err) {
    console.error("Error fetching initial shorts feed:", err);
  }

  const allVideos = [initialPost, ...initialRelated].filter((v) => v?._id);
  const featuredTitle = truncateWords(initialPost?.title || "Trending Short Videos on FondPeace", 100);
  const featuredAuthor = initialPost?.userId?.username || "FondPeace";
  const featuredThumb = initialPost ? resolvePostThumbnail(initialPost) : "/Fondpeace.jpg";

  const ssrFallback = (
    <section className="w-full min-h-[100dvh] bg-black text-white flex flex-col lg:flex-row items-center justify-center gap-6 px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-[420px] rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 p-4 space-y-3">
        <img
          src={featuredThumb}
          alt={featuredTitle}
          className="w-full aspect-[9/16] object-contain rounded-2xl bg-black"
        />
        <Link
          href={`/profile/${encodeURIComponent(featuredAuthor)}`}
          className="text-sm font-bold text-blue-400 hover:underline inline-block"
        >
          @{featuredAuthor}
        </Link>
        <h1 className="text-base font-bold leading-snug text-white">
          {featuredTitle}
        </h1>
        {initialPost?._id && (
          <Link
            href={`/short/${initialPost._id}`}
            className="inline-block text-xs font-semibold text-zinc-300 underline"
          >
            Watch Full Video Page
          </Link>
        )}
      </div>

      <aside className="max-w-md w-full rounded-2xl bg-zinc-950 border border-white/10 p-5 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
          Trending FondPeace Shorts &amp; Reels
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Explore trending vertical short videos, community clips, and creator reels on FondPeace.
        </p>
        {allVideos.length > 0 && (
          <nav aria-label="Trending Shorts">
            <ul className="space-y-2">
              {allVideos.map((v) => (
                <li key={v._id}>
                  <Link
                    href={`/short/${v._id}`}
                    className="text-xs text-blue-400 hover:underline block line-clamp-2"
                  >
                    {truncateWords(v.title || "Watch Short Video", 95)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </aside>
    </section>
  );

  return (
    <main className="w-full h-[100dvh] bg-black text-white overflow-hidden select-none">
      <ReelsFeedWrapper
        initialPost={initialPost}
        initialRelated={initialRelated}
        ssrFallback={ssrFallback}
      />
    </main>
  );
}
