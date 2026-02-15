"use client";
import { useState } from "react";

export default function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 flex justify-between items-center font-medium"
        aria-expanded={open}
      >
        <span>{q}</span>
        <span className="ml-3 text-xl">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-4 py-3 text-gray-700 border-t">{a}</div>}
    </div>
  );
}
