"use client";

import Village from "./Village";

export default function VillageClient({
  initialPosts = [],
  initialPage = 1,
  initialHasMore = true,
  initialType = "all",
}) {
  return (
    <Village
      initialPosts={initialPosts}
      initialPage={initialPage}
      initialHasMore={initialHasMore}
      initialType={initialType}
    />
  );
}
