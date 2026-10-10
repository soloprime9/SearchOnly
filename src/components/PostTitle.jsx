"use client";

import Linkify from "linkify-react";
import { useState } from "react";

export default function PostTitle({ title }) {

  const [expanded, setExpanded] = useState(false);

  const titleText = expanded
    ? title
    : title.slice(0, 100) + (title.length > 100 ? "..." : "");

  const options = {
    target: "_blank",
    rel: "noopener noreferrer",
    className: "text-blue-500 hover:underline",
  };

  return (
    <div className="text-[var(--text-primary)] mb-3 whitespace-pre-line break-words text-sm sm:text-base font-medium">

      <Linkify options={options}>
        {titleText}
      </Linkify>

      {title.length > 100 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-500 hover:text-blue-600 ml-1.5 font-semibold text-xs sm:text-sm cursor-pointer"
        >
          {expanded ? " show less" : " ...more"}
        </button>
      )}

    </div>
  );
}
