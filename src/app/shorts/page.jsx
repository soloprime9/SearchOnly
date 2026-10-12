// src/app/shorts/page.jsx
import ReelsFeedWrapper from "@/components/ReelsFeedWrapper";
import { getApiBase } from "@/utils/apiConfig";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shorts & Reels | FondPeace - Trending Vertical Videos",
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
  const API_BASE = getApiBase();
  let initialPost = null;
  let initialRelated = [];

  try {
    const res = await fetch(`${API_BASE}/post/shorts/feed?page=1&limit=6&sort=trending`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.videos) && data.videos.length > 0) {
        initialPost = data.videos[0];
        initialRelated = data.videos.slice(1);
      }
    }
  } catch (err) {
    console.error("Error fetching initial shorts feed:", err);
  }

  return (
    <main className="w-full h-[100dvh] bg-black text-white overflow-hidden select-none">
      <ReelsFeedWrapper initialPost={initialPost} initialRelated={initialRelated} />
    </main>
  );
}
