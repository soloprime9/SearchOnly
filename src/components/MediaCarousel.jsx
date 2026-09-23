"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from "lucide-react";
import { playTap, playPop } from "@/utils/soundEffects";

export default function MediaCarousel({
  mediaList = [],
  thumbnail = "",
  isGlobalMuted = true,
  onToggleMute,
  onImageClick,
  onVideoClick,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Normalize mediaList to array of { url, type }
  const items = React.useMemo(() => {
    if (Array.isArray(mediaList) && mediaList.length > 0) {
      return mediaList.map((m) => {
        if (typeof m === "string") {
          const isVid = m.endsWith(".mp4") || m.endsWith(".webm") || m.includes("/video/");
          return { url: m, type: isVid ? "video" : "image" };
        }
        return {
          url: m.url || m.media || "",
          type: m.type?.includes("video") ? "video" : "image",
        };
      });
    }
    return [];
  }, [mediaList]);

  if (items.length === 0) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    playTap();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    playTap();
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swiped Left -> Next
      handleNext({ stopPropagation: () => {} });
    }
    if (touchStartX.current - touchEndX.current < -50) {
      // Swiped Right -> Prev
      handlePrev({ stopPropagation: () => {} });
    }
  };

  const currentItem = items[currentIndex] || items[0];

  return (
    <div
      className="relative w-full aspect-[4/5] max-w-[540px] mx-auto bg-black overflow-hidden select-none group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Current Media Render */}
      {currentItem.type === "video" ? (
        <video
          src={currentItem.url}
          playsInline
          loop
          muted={isGlobalMuted}
          poster={thumbnail || undefined}
          className="w-full h-full object-contain"
          onClick={onVideoClick}
        />
      ) : (
        <img
          src={currentItem.url}
          alt="Post media"
          loading="lazy"
          className="w-full h-full object-contain cursor-zoom-in"
          onClick={() => onImageClick && onImageClick(currentItem.url)}
        />
      )}

      {/* Multi-item Slide Counter (e.g. 1/3) */}
      {items.length > 1 && (
        <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-black tracking-wider border border-white/10">
          {currentIndex + 1} / {items.length}
        </div>
      )}

      {/* Prev / Next Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
            title="Previous item"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
            title="Next item"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md">
            {items.map((_, idx) => (
              <span
                key={idx}
                className={`transition-all duration-200 rounded-full ${
                  idx === currentIndex
                    ? "w-4 h-1.5 bg-white shadow-sm"
                    : "w-1.5 h-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
