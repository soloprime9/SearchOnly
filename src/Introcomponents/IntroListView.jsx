"use client";
 
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaRegUser } from "react-icons/fa";

export default function IntroListView({ list = [] }) {

  const [data, setData] = useState(list);
  const [page, setPage] = useState(2); 
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    const res = await fetch(`https://list-back-nine.vercel.app/get/mango?page=${page}`);

    const json = await res.json();

    // API must return {products:[], hasMore:true}
    setData(prev => [...prev, ...json.products]);
    setHasMore(json.hasMore);
  };

  return (
    <section className="container mx-auto px-4 py-16">

      <h1 className="text-center text-3xl font-bold mb-10">
        Trending Products
      </h1>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

        {data.map((p) => (
          <Link key={p._id} href={`/IntroList/${p.slug}`}
            className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition overflow-hidden">

            <div className="h-52 w-full overflow-hidden">
              <img
                src={p.thumbnail}
                alt={p.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5">
              <h3 className="font-semibold text-lg">{p.title}</h3>
              <p className="text-sm text-gray-700 line-clamp-2">
                {p.description}
              </p>

              {p.createdBy && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <FaRegUser /> {p.createdBy.username}
                </div>
              )}
            </div>
          </Link>
        ))}

      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-10">
          <button
            className="px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800"
            onClick={() => {
              setPage(prev => prev + 1);
              loadMore();
            }}
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
