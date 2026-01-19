"use client"; // Client component for dynamic fetching if needed
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
        const res = await axios.get(`${API_BASE}/post/single/search?q=${encodeURIComponent(topic)}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setPosts(res.data || []);
      } catch (err) {
        console.error("Error fetching topic posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [topic]);

  if (loading) {
    return <p className="text-gray-500 mt-2">Loading posts...</p>;
  }

  if (!posts || posts.length === 0) {
    return (
      <p className="text-gray-500 mt-2">
        No posts found yet for <strong>{topic}</strong>. This topic will update automatically.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {posts.map((p) => (
        <Link key={p._id} href={`/short/${p._id}`} className="block border-b pb-3">
          <h2 className="font-semibold">{p.title}</h2>
        </Link>
      ))}
    </div>
  );
}
