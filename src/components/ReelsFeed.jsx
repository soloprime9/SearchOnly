// components/ReelsPlayer.jsx
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function ReelsFeed({ initialPost, initialRelated = [] }) {
  const router = useRouter();
  const [posts, setPosts] = useState([initialPost, ...initialRelated]);
  const videoRefs = useRef([]);
  const ioRef = useRef(null);

  // prefetch function: optionally prefetch server page for SEO/meta (Next does partial)
  const prefetchPage = (id) => {
    // next/navigation router doesn't expose prefetch directly here; you can use <Link prefetch> in list
    // or let Next prefetch automatically. We'll rely on router.replace to fetch server page.
  };

  // IntersectionObserver to detect which video is active
  useEffect(() => {
    if (ioRef.current) ioRef.current.disconnect();

    ioRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio > 0.65) {
            // play this video, pause others
            const id = el.dataset.id;
            // pause others
            videoRefs.current.forEach((v) => {
              if (v && v !== el) {
                try { v.pause(); } catch {}
              }
            });
            try { el.play().catch(()=>{}); } catch {}

            // update URL to server watch page
            if (id) {
              // Use replace so back button is less noisy; use push if you want back history
              router.replace(`/short/${id}`);
              // prefetchPage(id); // if you add prefetch logic
            }
          } else {
            try { entry.target.pause(); } catch {}
          }
        });
      },
      { threshold: [0.65] }
    );

    videoRefs.current.forEach((v) => v && ioRef.current.observe(v));

    return () => {
      ioRef.current && ioRef.current.disconnect();
    };
  }, [posts, router]);

  // If you want infinite load, fetch more videos from /post/shorts endpoint
  const fetchMore = useCallback(async (page = 1) => {
    const res = await fetch(`/post/shorts?page=${page}&limit=6`);
    if (!res.ok) return;
    const data = await res.json();
    setPosts((p) => {
      const ids = new Set(p.map(x => x._id));
      const newOnes = data.videos.filter(v => !ids.has(v._id));
      return [...p, ...newOnes];
    });
  }, []);

  // optional: handle onEnded to scroll to next video
  const handleEnded = (idx) => {
    const next = videoRefs.current[idx + 1];
    if (next) next.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="w-full h-screen overflow-y-auto snap-y snap-mandatory">
      {posts.map((p, idx) => (
        <div key={p._id} className="snap-start w-full h-screen flex items-center justify-center">
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <video
              ref={(el) => (videoRefs.current[idx] = el)}
              src={p.media || p.mediaUrl}
              poster={p.thumbnail}
              data-id={p._id}
              playsInline
              loop
              controls={false}
              className="object-contain w-full h-full"
              onEnded={() => handleEnded(idx)}
            />
            {/* overlay info */}
            <div className="absolute left-4 bottom-24 text-white max-w-[70%]">
              <p className="font-semibold">@{p.userId?.username}</p>
              <p className="text-sm line-clamp-2 mt-1">{p.title}</p>
            </div>
          </div>
        </div>
      ))}
      {/* optionally a "load more" button */}
      <div className="p-6 text-center">
        <button onClick={() => fetchMore(2)} className="px-4 py-2 bg-gray-900 text-white rounded">Load more</button>
      </div>
    </div>
  );
}
