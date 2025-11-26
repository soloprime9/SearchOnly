"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
  const API_BASE = "https://backend-k.vercel.app";
 
export default function SearchFull() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const search = async (text) => {
    setQuery(text);

    if (!text.trim()) return setResults([]);

    const { data } = await axios.get(`${API_BASE}/post/single/search?q=${text}`);
    setResults(data);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">

      {/* 🔍 Search Box */}
      <input
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="Search by title or hashtags..."
        className="w-full p-3 bg-gray-100 rounded-xl outline-none"
      />

      {/* 📌 Results */}
      <div className="mt-4 flex flex-col gap-3">
        {results.map((p) => (
          <Link key={p._id} href={`/short/${p._id}`}>
            <div className="flex gap-3 bg-white p-3 rounded-xl shadow cursor-pointer">

              <img
                src={p.thumbnail || p.media}
                className="w-20 h-20 object-cover rounded-lg"
              />

              <div className="flex flex-col justify-center">
                <p className="font-semibold text-sm line-clamp-2">{p.title}</p>
                <p className="text-xs text-gray-500">
                  {p.likes?.length} Likes · {p.comments?.length} Comments · {p.views} Views
                </p>
              </div>

            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
