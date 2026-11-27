import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import HomeFeedShell from "@/components/HomeFeedShell";
import {
  PAGE_LIMIT,
  buildHomeMetadata,
  fetchHomeFeed,
  normalizeFeedType,
} from "@/lib/homeFeed";

export const dynamic = "force-dynamic";

const getFeedPageData = cache(async (pageNum, currentType) => {
  return fetchHomeFeed({
    page: pageNum,
    limit: PAGE_LIMIT,
    type: currentType,
  });
});

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const pageNum = parseInt(resolvedParams?.page, 10);
  if (!Number.isFinite(pageNum) || pageNum < 1) {
    return { title: "Page Not Found", robots: { index: false, follow: true } };
  }
  const currentType = normalizeFeedType(resolvedSearch?.type);
  const { posts, totalPages, fetchOk } = await getFeedPageData(pageNum, currentType);
  if (fetchOk && (posts.length === 0 || pageNum > totalPages)) {
    return { title: "Page Not Found", robots: { index: false, follow: true } };
  }
  return buildHomeMetadata({
    page: pageNum,
    type: currentType,
    pathname: `/feed/${pageNum}`,
  });
}

export default async function PaginatedFeedPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const pageNum = parseInt(resolvedParams?.page, 10);

  if (!Number.isFinite(pageNum) || pageNum < 1) {
    notFound();
  }

  const currentType = normalizeFeedType(resolvedSearch?.type);
  if (pageNum === 1) {
    redirect(currentType !== "all" ? `/?type=${encodeURIComponent(currentType)}` : "/");
  }

  const { posts, hasMore, totalPages, fetchOk } = await getFeedPageData(pageNum, currentType);

  if (fetchOk && (posts.length === 0 || pageNum > totalPages)) {
    notFound();
  }

  return (
    <HomeFeedShell
      posts={posts}
      currentPage={pageNum}
      hasMore={hasMore}
      totalPages={totalPages}
      currentType={currentType}
    />
  );
}
