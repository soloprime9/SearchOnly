"use client";

import React, { useState, useEffect, useRef } from "react";
import { Star, ShieldCheck, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { STORE_TESTIMONIALS } from "@/data/storeProducts";

export default function StoreReviewsCarousel({ reviews = STORE_TESTIMONIALS, title = "Verified Buyer Reviews" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-advance carousel every 3.5 seconds when not paused
  useEffect(() => {
    if (isPaused || !reviews || reviews.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 3800);

    return () => clearInterval(timer);
  }, [isPaused, reviews]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swiped left -> next
      handleNext();
    } else if (touchEndX.current - touchStartX.current > 50) {
      // Swiped right -> prev
      handlePrev();
    }
  };

  if (!reviews || reviews.length === 0) return null;

  // We display 3 cards on desktop, 2 on tablet, 1 on mobile
  // Calculate the 3 consecutive visible items
  const visibleReviews = [
    reviews[currentIndex % reviews.length],
    reviews[(currentIndex + 1) % reviews.length],
    reviews[(currentIndex + 2) % reviews.length],
  ];

  return (
    <div
      className="rounded-3xl p-5 sm:p-7 bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-subtle)]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-current" />
              <span>{title}</span>
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Purchases</span>
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            Real feedback from developers, founders & creators using FondPeace digital tools.
          </p>
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="p-2 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition text-xs flex items-center gap-1 cursor-pointer"
            title={isPaused ? "Resume Auto-Play" : "Pause Auto-Play"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-mono hidden md:inline">{isPaused ? "Paused" : "Auto-playing"}</span>
          </button>

          {/* Prev Button */}
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            aria-label="Previous Review"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            aria-label="Next Review"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards View: 1 card on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
        {visibleReviews.map((rev, idx) => {
          // Hide 2nd & 3rd cards appropriately on smaller viewports
          const hideClass = idx === 2 ? "hidden lg:flex" : idx === 1 ? "hidden md:flex" : "flex";

          return (
            <div
              key={`${rev.id}-${idx}`}
              className={`${hideClass} flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-amber-400/40 transition-all duration-300 space-y-3 shadow-sm`}
            >
              {/* Card Header: Avatar + User Info + Rating */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-tr ${rev.avatarBg || "from-amber-500 to-orange-600"} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    {rev.initials || rev.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-[var(--text-primary)] truncate">
                        {rev.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {rev.handle}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--text-secondary)] font-medium block truncate">
                      {rev.role}
                    </span>
                  </div>
                </div>

                <div className="text-amber-400 text-xs shrink-0 tracking-wider">
                  {"★".repeat(rev.rating || 5)}
                </div>
              </div>

              {/* Written Review Quote */}
              <p className="text-xs sm:text-[12.5px] text-[var(--text-secondary)] leading-relaxed italic">
                &ldquo;{rev.text}&rdquo;
              </p>

              {/* Card Footer: Product Tag & Verification Date */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 text-[10.5px]">
                <span className="font-semibold text-amber-400 truncate max-w-[200px]">
                  {rev.productName}
                </span>
                <span className="text-[var(--text-muted)] shrink-0 font-medium">
                  {rev.date || "Verified Buyer"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Dots Indicator */}
      <div className="flex items-center justify-center gap-1.5 pt-2">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              i === currentIndex % reviews.length
                ? "w-6 bg-amber-400"
                : "w-1.5 bg-[var(--border-subtle)] hover:bg-[var(--text-muted)]"
            }`}
            aria-label={`Jump to review ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
