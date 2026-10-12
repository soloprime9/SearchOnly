"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaVolumeMute, FaVolumeUp, FaArrowLeft, FaPlay } from "react-icons/fa";
import { ShieldCheck, Music, ChevronUp, ChevronDown } from "lucide-react";
import axios from "axios";
import ReelInteractions from "./ReelInteractions";
import { getApiBase } from "@/utils/apiConfig";
import { playPop, playTap } from "@/utils/soundEffects";
import { triggerHeartBurst } from "@/utils/confetti";

const API_BASE = getApiBase();

export default function ReelsFeed({ initialPost, initialRelated = [] }) {
  const router = useRouter();

  const [posts, setPosts] = useState(() => {
    if (initialPost) {
      const relatedFiltered = initialRelated.filter(
        (p) => String(p._id) !== String(initialPost._id)
      );
      return [initialPost, ...relatedFiltered];
    }
    return initialRelated;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFastForward, setIsFastForward] = useState(false);
  const [showVolumeIcon, setShowVolumeIcon] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const itemRefs = useRef([]);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const lastTapRef = useRef({ time: 0, x: 0, y: 0 });
  const holdTimerRef = useRef(null);

  // Session-persistent seen set to guarantee 0% repeats during user browsing
  const seenPostsRef = useRef(new Set());

  // Initialize seen IDs from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("fp_seen_shorts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((id) => seenPostsRef.current.add(id));
        }
      }
    } catch (_) {}

    if (initialPost?._id) {
      seenPostsRef.current.add(String(initialPost._id));
    }
  }, [initialPost?._id]);

  const saveSeenToSession = useCallback(() => {
    try {
      const arr = Array.from(seenPostsRef.current).slice(-200);
      sessionStorage.setItem("fp_seen_shorts", JSON.stringify(arr));
    } catch (_) {}
  }, []);

  /* ==============================
     PASSIVE WATCH TELEMETRY LOGGER
     Automatically tracks watch duration & completion
     without requesting user inputs.
  ============================== */
  const logWatchTelemetry = useCallback(async (postId, duration, completed) => {
    if (!postId) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await axios.post(
        `${API_BASE}/analytics/shorts/watch`,
        {
          postId,
          duration: Math.round(duration || 0),
          completed: Boolean(completed),
          screen: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "",
          source: "shorts_feed",
        },
        {
          headers: token ? { "x-auth-token": token } : {},
        }
      );
    } catch (_) {
      // Passive background telemetry; fail silently without disrupting user
    }
  }, []);

  /* ==============================
     AUTOPLAY & VIEW INTERSECTION OBSERVER
  ============================== */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.index);
          const video = videoRefs.current[index];

          if (entry.isIntersecting && entry.intersectionRatio > 0.65) {
            setCurrentIndex(index);
            setIsPlaying(true);

            // Pause all other videos
            videoRefs.current.forEach((v, idx) => {
              if (v && idx !== index) {
                v.pause();
                v.playbackRate = 1.0;
              }
            });

            if (video) {
              video.muted = isMuted;
              video.playbackRate = 1.0;
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.catch(() => {
                  // Autoplay policy fallback: mute and retry
                  video.muted = true;
                  setIsMuted(true);
                  video.play().catch(() => {});
                });
              }
            }

            const activePost = posts[index];
            if (activePost?._id) {
              const id = String(activePost._id);
              window.history.replaceState(null, "", `/short/${id}`);

              if (!seenPostsRef.current.has(id)) {
                seenPostsRef.current.add(id);
                saveSeenToSession();
                // Send initial watch telemetry ping
                logWatchTelemetry(id, 2, false);
              }
            }
          }
        });
      },
      { threshold: 0.65 }
    );

    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [posts, isMuted, logWatchTelemetry, saveSeenToSession]);

  /* ==============================
     LOAD MORE SHORTS (DEDUPLICATED FEED)
  ============================== */
  const loadMorePosts = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;

    try {
      pageRef.current += 1;
      const excludeIds = Array.from(seenPostsRef.current)
        .concat(posts.map((p) => String(p._id)))
        .slice(-150)
        .join(",");

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await axios.get(
        `${API_BASE}/post/shorts/feed?page=${pageRef.current}&limit=6&exclude=${excludeIds}`,
        {
          headers: token ? { "x-auth-token": token } : {},
        }
      );

      const incoming = res.data?.videos || [];
      if (!incoming.length) {
        hasMoreRef.current = false;
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => String(p._id)));
          const fresh = incoming.filter((p) => !existingIds.has(String(p._id)));
          return [...prev, ...fresh];
        });
      }
    } catch (err) {
      console.error("Error loading more shorts:", err);
    } finally {
      loadingRef.current = false;
    }
  }, [posts]);

  // Observer on last item to trigger infinite scroll
  useEffect(() => {
    if (!posts.length) return;
    const lastElement = itemRefs.current[posts.length - 1];
    if (!lastElement) return;

    const endObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { rootMargin: "300px" }
    );

    endObserver.observe(lastElement);
    return () => endObserver.disconnect();
  }, [posts.length, loadMorePosts]);

  /* ==============================
     NAVIGATION HELPERS (DESKTOP ARROWS & KEYBOARD)
  ============================== */
  const scrollToNext = useCallback(() => {
    playTap();
    const nextIdx = Math.min(currentIndex + 1, posts.length - 1);
    itemRefs.current[nextIdx]?.scrollIntoView({ behavior: "smooth" });
  }, [currentIndex, posts.length]);

  const scrollToPrev = useCallback(() => {
    playTap();
    const prevIdx = Math.max(currentIndex - 1, 0);
    itemRefs.current[prevIdx]?.scrollIntoView({ behavior: "smooth" });
  }, [currentIndex]);

  /* ==============================
     GLOBAL MUTE & AUDIO TOGGLE
  ============================== */
  const toggleMute = () => {
    playTap();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    videoRefs.current.forEach((v) => {
      if (v) v.muted = nextMuted;
    });

    setShowVolumeIcon(true);
    setTimeout(() => setShowVolumeIcon(false), 900);
  };

  /* ==============================
     PAUSE / PLAY TOGGLE
  ============================== */
  const togglePlayPause = () => {
    const video = videoRefs.current[currentIndex];
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  /* ==============================
     KEYBOARD SHORTCUTS
  ============================== */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToNext();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToPrev();
      } else if (e.key === " " || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, posts.length, scrollToNext, scrollToPrev]);

  /* ==============================
     TAP & LONG PRESS HANDLERS
  ============================== */
  const handlePointerDown = () => {
    holdTimerRef.current = setTimeout(() => {
      const activeVideo = videoRefs.current[currentIndex];
      if (activeVideo && !activeVideo.paused) {
        activeVideo.playbackRate = 2.0;
        setIsFastForward(true);
      }
    }, 450);
  };

  const handlePointerUp = (e, post) => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

    if (isFastForward) {
      const activeVideo = videoRefs.current[currentIndex];
      if (activeVideo) activeVideo.playbackRate = 1.0;
      setIsFastForward(false);
      return;
    }

    const now = Date.now();
    const timeDiff = now - lastTapRef.current.time;

    if (timeDiff < 320) {
      // Double tap detected -> Heart burst like
      const clientX = e.clientX || window.innerWidth / 2;
      const clientY = e.clientY || window.innerHeight / 2;
      triggerHeartBurst(clientX, clientY);
      playPop();

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token && post?._id) {
        axios
          .post(`${API_BASE}/post/like/${post._id}`, {}, { headers: { "x-auth-token": token } })
          .then((res) => {
            setPosts((prev) =>
              prev.map((p) => (p._id === post._id ? { ...p, likes: res.data.likes } : p))
            );
          })
          .catch(() => {});
      }
      lastTapRef.current = { time: 0, x: 0, y: 0 };
    } else {
      lastTapRef.current = { time: now, x: e.clientX, y: e.clientY };
      // Single tap toggles play/pause
      togglePlayPause();
    }
  };

  /* ==============================
     PROGRESS TRACKING
  ============================== */
  const handleTimeUpdate = (e, post) => {
    const video = e.currentTarget;
    if (video.duration) {
      const progress = (video.currentTime / video.duration) * 100;
      setVideoProgress(progress);

      // Log completion telemetry if watched >= 80%
      if (progress >= 80 && post?._id && !post._loggedCompleted) {
        post._loggedCompleted = true;
        logWatchTelemetry(post._id, video.currentTime, true);
      }
    }
  };

  if (!posts.length) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white gap-3">
        <p className="text-base font-semibold text-zinc-400">No shorts available right now</p>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
        >
          Back to Discovery
        </Link>
      </div>
    );
  }

  const currentActivePost = posts[currentIndex];

  return (
    <div className="bg-black w-full h-[100dvh] flex items-center justify-center overflow-hidden select-none relative">
      {/* ── Desktop Ambient Theater Glow (Sampling current video) ── */}
      {currentActivePost?.thumbnail && (
        <div
          className="hidden md:block absolute inset-0 bg-cover bg-center blur-[120px] opacity-25 scale-125 pointer-events-none transition-all duration-700 ease-out"
          style={{ backgroundImage: `url(${currentActivePost.thumbnail})` }}
        />
      )}

      {/* ── Fixed Floating Top Bar ── */}
      <header className="fixed top-0 inset-x-0 z-40 max-w-[500px] mx-auto px-4 py-3 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          onClick={() => playTap()}
          className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white border border-white/10 text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer"
        >
          <FaArrowLeft className="text-xs" />
          <span className="hidden sm:inline">Discovery</span>
        </Link>

        <div className="pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-white text-xs font-black tracking-wide">
          <span>FondPeace</span>
          <span className="text-rose-500 font-extrabold uppercase text-[10px]">Shorts</span>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="pointer-events-auto p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white border border-white/10 shadow-lg transition active:scale-90 cursor-pointer"
          title={isMuted ? "Unmute Sound (M)" : "Mute Sound (M)"}
        >
          {isMuted ? <FaVolumeMute className="text-sm text-rose-400" /> : <FaVolumeUp className="text-sm" />}
        </button>
      </header>

      {/* ── Fast Forward Indicator Pill ── */}
      {isFastForward && (
        <div className="fixed top-14 inset-x-0 z-50 flex justify-center pointer-events-none animate-pulse">
          <div className="px-3.5 py-1 rounded-full bg-black/85 backdrop-blur-md text-amber-400 border border-amber-400/40 text-xs font-extrabold tracking-wide shadow-2xl">
            ⚡ 2x Speed
          </div>
        </div>
      )}

      {/* ── Main Vertical Video Theater Frame ── */}
      <div className="w-full md:max-w-[440px] h-[100dvh] md:h-[calc(100dvh-20px)] md:my-auto md:rounded-3xl overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)] md:border md:border-white/10 flex items-center justify-center">
        {/* Desktop Previous / Next Floating Arrows */}
        <aside className="hidden lg:flex flex-col items-center gap-3 absolute -right-16 top-1/2 -translate-y-1/2 z-40 pointer-events-auto">
          <button
            type="button"
            onClick={scrollToPrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed border border-white/15 shadow-xl cursor-pointer active:scale-90"
            title="Previous Short (Up Arrow)"
          >
            <ChevronUp size={24} />
          </button>
          <button
            type="button"
            onClick={scrollToNext}
            disabled={currentIndex >= posts.length - 1}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed border border-white/15 shadow-xl cursor-pointer active:scale-90"
            title="Next Short (Down Arrow)"
          >
            <ChevronDown size={24} />
          </button>
        </aside>

        {/* Snap-Mandatory Vertical Scroll Viewport */}
        <main
          ref={containerRef}
          className="w-full h-full overflow-y-auto snap-y snap-mandatory scroll-smooth relative no-scrollbar"
          style={{ scrollbarWidth: "none" }}
        >
          {posts.map((item, index) => {
            const rawAuthorPic =
              item.userId?.profilePicture || item.userId?.profilePic || item.userId?.avatar;
            const authorInitial = (
              item.userId?.username?.[0] ||
              item.userId?.name?.[0] ||
              "U"
            ).toUpperCase();

            return (
              <section
                key={item._id || index}
                data-index={index}
                ref={(el) => (itemRefs.current[index] = el)}
                className="snap-start snap-always w-full h-[100dvh] md:h-full relative flex items-center justify-center bg-black overflow-hidden"
              >
                {/* ── Video Player & Click Handler ── */}
                <div
                  className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer"
                  onPointerDown={handlePointerDown}
                  onPointerUp={(e) => handlePointerUp(e, item)}
                  onPointerLeave={() => {
                    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
                    if (isFastForward) {
                      const activeVideo = videoRefs.current[currentIndex];
                      if (activeVideo) activeVideo.playbackRate = 1.0;
                      setIsFastForward(false);
                    }
                  }}
                >
                  {/* Subtle Ambient Background */}
                  {(item.thumbnail || item.media) && (
                    <img
                      src={item.thumbnail || item.media}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-25 scale-125 pointer-events-none select-none"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  {/* Vertical Video Element */}
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={item.media || item.mediaUrl}
                    poster={
                      item.thumbnail &&
                      !item.thumbnail.includes("Fondpeace.jpg") &&
                      !item.thumbnail.includes("default.jpg")
                        ? item.thumbnail
                        : undefined
                    }
                    data-index={index}
                    data-id={item._id}
                    loop
                    playsInline
                    muted={isMuted}
                    preload="metadata"
                    onTimeUpdate={(e) => handleTimeUpdate(e, item)}
                    className="relative z-10 w-full h-full object-cover mx-auto bg-black"
                  />

                  {/* Central Play/Pause Animation Overlay */}
                  {!isPlaying && currentIndex === index && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-2xl animate-in zoom-in-75 duration-150">
                        <FaPlay className="text-xl ml-1 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Volume Icon Animation Overlay */}
                  {showVolumeIcon && currentIndex === index && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-ping">
                      <div className="p-4 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20 shadow-2xl">
                        {isMuted ? <FaVolumeMute size={32} /> : <FaVolumeUp size={32} />}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Bottom Legibility Vignette ── */}
                <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-10" />

                {/* ── Bottom Overlay Info (Creator, Verified Badge, Caption, Sound Wave) ── */}
                <div className="absolute left-4 bottom-7 text-white max-w-[74%] z-20 pointer-events-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      href={`/profile/${item.userId?.username}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 group"
                    >
                      <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600">
                        <div className="bg-black p-[1px] rounded-full w-full h-full overflow-hidden flex items-center justify-center">
                          {rawAuthorPic && rawAuthorPic !== "/Fondpeace.jpg" ? (
                            <img
                              src={rawAuthorPic}
                              alt={item.userId?.username || "creator"}
                              className="w-full h-full rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/Fondpeace.jpg";
                              }}
                            />
                          ) : (
                            <span className="text-white font-black text-[11px]">{authorInitial}</span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-sm hover:underline drop-shadow-md">
                        @{item.userId?.username || "Creator"}
                      </span>
                    </Link>

                    {item.userId?.isVerified && (
                      <ShieldCheck size={15} className="text-blue-400 fill-blue-400/25 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs sm:text-sm line-clamp-3 leading-snug drop-shadow-md text-zinc-100 whitespace-pre-wrap">
                    {item.title}
                  </p>

                  {/* Animated Audio Waveform Pill */}
                  <div className="flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-[11px] text-gray-200 w-fit max-w-full">
                    <Music size={11} className="shrink-0 text-white animate-pulse" />
                    <span className="truncate">
                      {item.userId?.username || "Original Audio"} • FondPeace Sound
                    </span>
                  </div>
                </div>

                {/* ── Right-Side Vertical Floating Interactions ── */}
                <ReelInteractions
                  post={item}
                  updatePost={(updatedPost) => {
                    setPosts((prev) =>
                      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
                    );
                  }}
                />

                {/* ── Bottom Slim Video Progress Scrubber ── */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 z-30 pointer-events-none">
                  <div
                    className="h-full bg-rose-500 transition-all duration-100 ease-linear"
                    style={{ width: `${currentIndex === index ? videoProgress : 0}%` }}
                  />
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
