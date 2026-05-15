// components/PostTitle.jsx

'use client';

import { useState } from "react";
import Linkify from "linkify-react";

export default function PostTitle({ title, options }) {

  const [expanded, setExpanded] = useState(false);

  const text =
    expanded
      ? title
      : title.slice(0, 100) + (title.length > 100 ? "..." : "");

  return (
    <div className="text-gray-800 mb-4 whitespace-pre-line break-words">

      <Linkify options={options}>
        {text}
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
