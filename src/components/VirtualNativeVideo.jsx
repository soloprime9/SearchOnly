"use client";

import React, { useState, useEffect, useRef } from "react";

/**
 * 🎬 VirtualNativeVideo
 * Virtualized video wrapper for feed streams.
 * Only mounts heavy hardware-decoded <video> elements when within 700px of the viewport.
 * When scrolled far away, it safely unmounts the video element, releasing GPU decoders
 * and preventing mobile browser crashes while keeping memory usage ultra-low.
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
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
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

  return (
    <div ref={containerRef} className="relative w-full h-auto min-h-[220px] flex items-center justify-center bg-black">
      {isNearViewport ? (
        <video
          ref={onRef}
          src={src}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          preload="metadata"
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
