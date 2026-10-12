"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaVolumeMute, FaVolumeUp, FaArrowLeft, FaPlay, FaTimes, FaFire, FaClock, FaHeart } from "react-icons/fa";
import { ShieldCheck, Music, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import axios from "axios";
import ReelInteractions from "./ReelInteractions";
import { getApiBase } from "@/utils/apiConfig";
import { playPop, playTap, playChime } from "@/utils/soundEffects";
import { triggerHeartBurst } from "@/utils/confetti";

const API_BASE = getApiBase();

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

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

  const [feedSortMode, setFeedSortMode] = useState("trending");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fp_shorts_muted");
      if (saved !== null) return saved === "true";
    }
    return false;
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFastForward, setIsFastForward] = useState(false);
  const [showVolumeIcon, setShowVolumeIcon] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [activeSoundModal, setActiveSoundModal] = useState(null);
  const [hoverScrub, setHoverScrub] = useState(null);
  const [doubleTapHearts, setDoubleTapHearts] = useState([]);
  const [followedCreators, setFollowedCreators] = useState(new Set());

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
          source: `shorts_feed_${feedSortMode}`,
        },
        {
          headers: token ? { "x-auth-token": token } : {},
        }
      );
    } catch (_) {}
  }, [feedSortMode]);

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

            // Pause all other videos and conserve memory for distant items
            videoRefs.current.forEach((v, idx) => {
              if (v && idx !== index) {
                v.pause();
                v.playbackRate = 1.0;
                if (Math.abs(idx - index) > 3) {
                  v.currentTime = 0;
                }
              }
            });

            if (video) {
              video.muted = isMuted;
              video.playbackRate = 1.0;
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.catch(() => {
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
  const loadMorePosts = useCallback(async (customPage = null, resetFeed = false) => {
    if (loadingRef.current || (!hasMoreRef.current && !resetFeed)) return;
    loadingRef.current = true;

    try {
      const targetPage = customPage !== null ? customPage : pageRef.current + 1;
      pageRef.current = targetPage;

      const excludeIds = Array.from(seenPostsRef.current)
        .concat(resetFeed ? [] : posts.map((p) => String(p._id)))
        .slice(-150)
        .join(",");

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await axios.get(
        `${API_BASE}/post/shorts/feed?page=${targetPage}&limit=6&sort=${feedSortMode}&exclude=${excludeIds}`,
        {
          headers: token ? { "x-auth-token": token } : {},
        }
      );

      const incoming = res.data?.videos || [];
      if (!incoming.length) {
        hasMoreRef.current = false;
      } else {
        setPosts((prev) => {
          if (resetFeed) return incoming;
          const existingIds = new Set(prev.map((p) => String(p._id)));
          const fresh = incoming.filter((p) => !existingIds.has(String(p._id)));
          return [...prev, ...fresh];
        });
      }
    } catch (err) {
      console.error("Error loading shorts feed:", err);
    } finally {
      loadingRef.current = false;
    }
  }, [posts, feedSortMode]);

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
     SWITCH FEED MODE (TRENDING VS LATEST)
  ============================== */
  const handleSwitchFeedMode = (mode) => {
    if (mode === feedSortMode) return;
    playTap();
    setFeedSortMode(mode);
    hasMoreRef.current = true;
    pageRef.current = 1;
    loadMorePosts(1, true);
  };

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
     GLOBAL MUTE & AUDIO TOGGLE (PERSISTENT)
  ============================== */
  const toggleMute = () => {
    playTap();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    try {
      localStorage.setItem("fp_shorts_muted", String(nextMuted));
    } catch (_) {}

    videoRefs.current.forEach((v) => {
      if (v) v.muted = nextMuted;
    });

    setShowVolumeIcon(true);
    setTimeout(() => setShowVolumeIcon(false), 900);
  };

  /* ==============================
     INLINE FOLLOW CREATOR
  ============================== */
  const handleFollowInline = async (e, creatorId, username) => {
    e.stopPropagation();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please login to follow creators");
      return;
    }
    playPop();
    const nextFollowed = new Set(followedCreators);
    const isNowFollowing = !nextFollowed.has(String(creatorId));
    if (isNowFollowing) {
      nextFollowed.add(String(creatorId));
      toast.success(`Following @${username || "creator"}! ✨`);
    } else {
      nextFollowed.delete(String(creatorId));
      toast.success(`Unfollowed @${username || "creator"}`);
    }
    setFollowedCreators(nextFollowed);

    try {
      await axios.post(
        `${API_BASE}/user/follow/${creatorId}`,
        {},
        { headers: { "x-auth-token": token } }
      );
    } catch (_) {}
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
      const clientX = e.clientX || (typeof window !== "undefined" ? window.innerWidth / 2 : 200);
      const clientY = e.clientY || (typeof window !== "undefined" ? window.innerHeight / 2 : 300);
      triggerHeartBurst(clientX, clientY);
      playPop();

      const heartId = Date.now() + Math.random();
      setDoubleTapHearts((prev) => [...prev, { id: heartId, x: clientX, y: clientY }]);
      setTimeout(() => {
        setDoubleTapHearts((prev) => prev.filter((h) => h.id !== heartId));
      }, 900);

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
      togglePlayPause();
    }
  };

  /* ==============================
     PROGRESS TRACKING & SCRUBBING
  ============================== */
  const handleTimeUpdate = (e, post) => {
    const video = e.currentTarget;
    if (video.duration) {
      const progress = (video.currentTime / video.duration) * 100;
      setVideoProgress(progress);

      if (progress >= 80 && post?._id && !post._loggedCompleted) {
        post._loggedCompleted = true;
        logWatchTelemetry(post._id, video.currentTime, true);
      }
    }
  };

  const handleScrubberSeek = (e, index) => {
    e.stopPropagation();
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = clickX / rect.width;
    const video = videoRefs.current[index];
    if (video && video.duration) {
      video.currentTime = percentage * video.duration;
      setVideoProgress(percentage * 100);
    }
  };

  const handleScrubberMouseMove = (e, index) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (clickX / rect.width) * 100;
    const video = videoRefs.current[index];
    const dur = video?.duration || 0;
    const time = (percentage / 100) * dur;
    setHoverScrub({
      percent: percentage,
      timeStr: `${formatTime(time)} / ${formatTime(dur)}`,
      index,
    });
  };

  const handleScrubberMouseLeave = () => {
    setHoverScrub(null);
  };

  if (!posts.length) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white gap-3">
        <p className="text-base font-semibold text-zinc-400">No shorts available in this feed</p>
        <button
          onClick={() => handleSwitchFeedMode("trending")}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
        >
          Reload Trending Shorts
        </button>
      </div>
    );
  }

  const currentActivePost = posts[currentIndex];

  return (
    <div className="bg-black w-full h-[100dvh] flex items-center justify-center overflow-hidden select-none relative">
      {/* ── Desktop Ambient Theater Glow (Dynamic blur behind card) ── */}
      {currentActivePost?.thumbnail && (
        <div
          className="hidden md:block absolute inset-0 bg-cover bg-center blur-[120px] opacity-25 scale-125 pointer-events-none transition-all duration-700 ease-out"
          style={{ backgroundImage: `url(${currentActivePost.thumbnail})` }}
        />
      )}

      {/* ── Fixed Floating Top Bar with Mode Switcher ── */}
      <header className="fixed top-0 inset-x-0 z-40 max-w-[500px] mx-auto px-3.5 py-3 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          onClick={() => playTap()}
          className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white border border-white/10 text-xs font-bold shadow-lg transition active:scale-95 cursor-pointer"
        >
          <FaArrowLeft className="text-xs" />
          <span className="hidden sm:inline">Discovery</span>
        </Link>

        {/* Trending vs Latest Switcher Tabs */}
        <div className="pointer-events-auto flex items-center bg-black/60 backdrop-blur-md rounded-full p-0.5 border border-white/15 shadow-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSwitchFeedMode("trending")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all cursor-pointer ${
              feedSortMode === "trending"
                ? "bg-rose-600 text-white shadow-md font-extrabold"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            <FaFire className="text-[10px]" />
            <span>Trending</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchFeedMode("latest")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all cursor-pointer ${
              feedSortMode === "latest"
                ? "bg-rose-600 text-white shadow-md font-extrabold"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            <Sparkles size={11} />
            <span>Latest</span>
          </button>
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

            // Zero-second preloading: auto-preload active, previous, and next 2 upcoming reels
            const shouldPreloadAuto = index >= currentIndex - 1 && index <= currentIndex + 2;

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

                  {/* Vertical Video Element with Smart Preload */}
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
                    preload={shouldPreloadAuto ? "auto" : "metadata"}
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

                    {item.userId?._id && (
                      <button
                        type="button"
                        onClick={(e) =>
                          handleFollowInline(
                            e,
                            item.userId?._id,
                            item.userId?.username
                          )
                        }
                        className={`ml-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition active:scale-90 cursor-pointer ${
                          followedCreators.has(String(item.userId._id))
                            ? "bg-white/20 text-zinc-300 hover:bg-white/30"
                            : "bg-rose-600 hover:bg-rose-500 text-white shadow-md"
                        }`}
                      >
                        {followedCreators.has(String(item.userId._id)) ? "Following" : "+ Follow"}
                      </button>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm line-clamp-3 leading-snug drop-shadow-md text-zinc-100 whitespace-pre-wrap">
                    {item.title}
                  </p>

                  {/* Clickable Animated Audio Track Pill */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playTap();
                      setActiveSoundModal(item);
                    }}
                    className="flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md border border-white/10 text-[11px] text-gray-200 w-fit max-w-full transition active:scale-95 cursor-pointer"
                  >
                    <Music size={11} className="shrink-0 text-white animate-pulse" />
                    <span className="truncate">
                      {item.userId?.username || "Original Audio"} • FondPeace Sound
                    </span>
                  </button>
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

                {/* ── Interactive Bottom Progress Scrubber ── */}
                <div
                  className="absolute inset-x-0 bottom-0 h-5 flex items-end z-30 cursor-pointer group/scrub"
                  onClick={(e) => handleScrubberSeek(e, index)}
                  onMouseMove={(e) => handleScrubberMouseMove(e, index)}
                  onMouseLeave={handleScrubberMouseLeave}
                >
                  {/* Hover Timestamp Preview Tooltip */}
                  {hoverScrub && hoverScrub.index === index && (
                    <div
                      className="absolute bottom-4 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-md text-white text-[10px] font-mono border border-white/20 shadow-xl pointer-events-none transition-all"
                      style={{ left: `${hoverScrub.percent}%` }}
                    >
                      {hoverScrub.timeStr}
                    </div>
                  )}
                  <div className="w-full h-1 group-hover/scrub:h-2 bg-white/20 transition-all relative">
                    <div
                      className="h-full bg-rose-500 transition-all duration-100 ease-linear relative"
                      style={{ width: `${currentIndex === index ? videoProgress : 0}%` }}
                    >
                      {/* Glowing knob visible on hover */}
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover/scrub:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </main>
      </div>

      {/* ── Sound Details Bottom Sheet Modal ── */}
      {activeSoundModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200"
          onClick={() => setActiveSoundModal(null)}
        >
          <div
            className="bg-[#0f121d] text-white w-full max-w-[440px] rounded-t-3xl p-5 border-t border-x border-white/15 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Music size={15} className="text-rose-500" />
                <span>Audio Track Details</span>
              </h3>
              <button
                onClick={() => setActiveSoundModal(null)}
                className="p-1.5 rounded-full bg-white/10 text-gray-300 hover:text-white"
              >
                <FaTimes size={13} />
              </button>
            </div>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Music size={24} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate">{activeSoundModal.userId?.username || "Original Audio"}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Original Sound • FondPeace Creator Network</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/profile/${activeSoundModal.userId?.username}`}
                onClick={() => setActiveSoundModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-center text-xs font-bold transition"
              >
                View Creator Profile
              </Link>
              <Link
                href="/upload"
                onClick={() => setActiveSoundModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-center text-xs font-bold transition shadow-md"
              >
                Create Short
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* ── Double-Tap Floating Heart Burst Overlay ── */}
      {doubleTapHearts.map((h) => (
        <div
          key={h.id}
          style={{ left: `${h.x}px`, top: `${h.y}px` }}
          className="fixed z-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-in zoom-in-50 fade-out-0 duration-700 select-none"
        >
          <div className="relative flex items-center justify-center">
            <FaHeart className="text-rose-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.95)] text-8xl md:text-9xl -rotate-12 transform scale-110" />
            <FaHeart className="absolute text-white/50 text-7xl md:text-8xl -rotate-12 transform scale-90" />
          </div>
        </div>
      ))}
    </div>
  );
}
