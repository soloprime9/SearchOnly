"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

const API_BASE = "https://backend-k.vercel.app";

export default function TopicPage({ topic }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topic) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE}/post/single/search?q=${encodeURIComponent(topic)}`
        );

        // Backend already returns array
        setPosts(Array.isArray(res.data) ? res.data : []);
        console.log("Topic posts:", res.data);
      } catch (err) {
        console.error("Topic fetch error:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [topic]);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] bg-gray-200 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  /* ---------------- EMPTY ---------------- */
  if (!posts.length) {
    return (
      <p className="text-gray-500 mt-4">
        No posts found for <strong>{topic}</strong>.
      </p>
    );
  }

  /* ---------------- CONTENT ---------------- */
  return (
    <section className="mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {posts.map((p) => (
          <Link
            key={p._id}
            href={`/short/${p._id}`}
            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
          >
            {/* MEDIA */}
            <div className="relative aspect-[4/5] bg-gray-100">

              {/* IMAGE */}
              {p.mediaType?.startsWith("image") && (
                <img
                  src={p.thumbnail || p.media}
                  alt={p.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = "/Fondpeace.jpg")}
                />
              )}

              {/* VIDEO */}
              {p.mediaType?.startsWith("video") && (
                <>
                  <video
                    src={p.media}
                    poster={p.thumbnail}
                    muted
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    ▶ Video
                  </span>
                </>
              )}

              {/* VIEWS */}
              <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                👁 {p.views || 0}
              </span>
            </div>

            {/* TITLE */}
            <div className="p-2">
              <h2 className="text-sm font-semibold leading-snug line-clamp-2">
                {p.title}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
