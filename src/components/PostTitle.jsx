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
    <div className="text-gray-800 mb-4 whitespace-pre-line break-words">

      <Linkify options={options}>
        {titleText}
      </Linkify>

      {title.length > 100 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 ml-1 font-medium hover:text-black"
        >
          {expanded ? " show less" : " ...more"}
        </button>
      )}

    </div>
  );
}
