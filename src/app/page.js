import HomeFeedShell from "@/components/HomeFeedShell";
import {
  PAGE_LIMIT,
  buildHomeMetadata,
  fetchHomeFeed,
  normalizeFeedType,
} from "@/lib/homeFeed";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const currentPage = Math.max(1, parseInt(resolved?.page, 10) || 1);
  const currentType = normalizeFeedType(resolved?.type);
  return buildHomeMetadata({ page: currentPage, type: currentType });
}

export default async function HomePage({ searchParams }) {
  const resolved = await searchParams;
  const currentPage = Math.max(1, parseInt(resolved?.page, 10) || 1);
  const currentType = normalizeFeedType(resolved?.type);

  const { posts, hasMore, totalPages } = await fetchHomeFeed({
    page: currentPage,
    limit: PAGE_LIMIT,
    type: currentType,
  });

  return (
    <HomeFeedShell
      posts={posts}
      currentPage={currentPage}
      hasMore={hasMore}
      totalPages={totalPages}
      currentType={currentType}
    />
  );
}
