"use client";

import { useEffect, useRef } from "react";
import { FaHeart, FaCommentDots, FaEye } from "react-icons/fa";

function AutoPlayVideo({ video, thumb }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const currentVideo = videoRef.current;

    if (!currentVideo) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentVideo.play().catch(() => {});
        } else {
          currentVideo.pause();
          currentVideo.currentTime = 0;
        }
      },
      {
        threshold: 0.7,
      }
    );

    observer.observe(currentVideo);

    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={video}
      poster={thumb}
      muted
      loop
      playsInline
      preload="metadata"
      className="w-full h-full object-cover object-center"
    />
  );
}

export default function RelatedPosts({
  related,
  toAbsolute,
  likesCount,
  commentsCount,
  viewsCount,
}) {
  return (
    <aside className="max-w-5xl mx-auto mt-10 px-4">
      <p className="text-xl font-semibold mb-4 text-gray-900">
        Related Posts
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {related.map((r) => {
          const thumb = toAbsolute(r.thumbnail || "");
          const video = toAbsolute(r.video || "");

          return (
            <a
              key={r._id}
              href={`/shorts/${r._id}`}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border"
            >
              <div className="w-full aspect-video bg-gray-200 overflow-hidden relative">

                {video ? (
                  <AutoPlayVideo
                    video={video}
                    thumb={thumb}
                  />
                ) : (
                  <img
                    src={thumb}
                    alt={r.title}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                )}
              </div>

              <div className="p-3">
                <p className="font-medium text-gray-900 line-clamp-2 text-sm">
                  {r.title}
                </p>

                <div className="flex items-center gap-3 text-gray-500 text-xs mt-2">
                  <FaHeart className="text-red-500" /> {likesCount(r)}
                  <span>•</span>
                  <FaCommentDots /> {commentsCount(r)}
                  <span>•</span>
                  <FaEye /> {viewsCount(r) || 0}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </aside>
  );
}
