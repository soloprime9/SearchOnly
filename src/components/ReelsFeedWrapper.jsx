"use client";

import dynamic from "next/dynamic";

const ReelsFeed = dynamic(() => import("./ReelsFeed"), { ssr: false });

export default function ReelsFeedWrapper(props) {
  return <ReelsFeed {...props} />;
}
