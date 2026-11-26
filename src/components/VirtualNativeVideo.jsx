"use client";

import React, { useState, useEffect, useRef } from "react";

/**
 * 🎬 VirtualNativeVideo
 * Virtualized video wrapper for feed streams.
 * Renders real <video> tags during SSR and initial hydration so Googlebot can index every
 * video on the homepage feed, then virtualizes off-screen decoders after mount for smooth mobile scrolling.
 */
export default function VirtualNativeVideo({
  src,
  thumbnail = null,
  isMuted = true,
  onRef,
  className = "w-full max-h-[520px] object-contain block mx-auto",
  alt = "video",
}) {
  const containerRef = useRef(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isNearViewport, setIsNearViewport] = useState(true);

  useEffect(() => {
    setHasMounted(true);
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearViewport(entry.isIntersecting);
      },
      { rootMargin: "700px 0px 700px 0px" } // 700px buffer above & below
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const shouldRenderVideo = !hasMounted || isNearViewport;

  return (
    <div ref={containerRef} className="relative w-full h-auto min-h-[220px] flex items-center justify-center bg-black">
      {shouldRenderVideo ? (
        <video
          ref={onRef}
          src={src}
          poster={thumbnail || undefined}
          autoPlay={hasMounted}
          loop
          playsInline
          muted={isMuted}
          preload={hasMounted ? "metadata" : "none"}
          className={className}
        />
      ) : (
        <div className="w-full aspect-video max-h-[520px] bg-black flex items-center justify-center overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={alt}
              className="w-full h-full object-contain opacity-80"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full min-h-[260px] bg-zinc-950 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xs">
                <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white/60 ml-0.5" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
