import { redirect } from "next/navigation";
import HomeFeedShell from "@/components/HomeFeedShell";
import {
  PAGE_LIMIT,
  buildFeedHref,
  buildHomeMetadata,
  fetchHomeFeed,
  normalizeFeedType,
} from "@/lib/homeFeed";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const currentPage = Math.max(1, parseInt(resolved?.page, 10) || 1);
  const currentType = normalizeFeedType(resolved?.type);
  return buildHomeMetadata({ page: currentPage, type: currentType, pathname: "/" });
}

export default async function HomePage({ searchParams }) {
  const resolved = await searchParams;
  const currentPage = Math.max(1, parseInt(resolved?.page, 10) || 1);
  const currentType = normalizeFeedType(resolved?.type);

  if (currentPage > 1) {
    redirect(buildFeedHref(currentPage, currentType));
  }

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
