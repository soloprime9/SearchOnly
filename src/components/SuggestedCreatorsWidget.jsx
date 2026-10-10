"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import jwt from "jsonwebtoken";
import { Users, UserPlus, Check, Sparkles, RefreshCw } from "lucide-react";
import { getApiBase } from "@/utils/apiConfig";
import { playTap, playPop } from "@/utils/soundEffects";
import { toast } from "@/utils/toast";

// Curated avatar gradient palette for creators without custom photo
const AVATAR_GRADIENTS = [
  "from-blue-600 to-indigo-600",
  "from-indigo-600 to-purple-600",
  "from-purple-600 to-pink-600",
  "from-emerald-600 to-teal-600",
  "from-rose-600 to-amber-600",
  "from-cyan-600 to-blue-600",
  "from-amber-600 to-orange-600",
];

const getGradientForName = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
};

export default function SuggestedCreatorsWidget({
  currentUserId,
  excludeUsername,
  followingMap = {},
  onToggleFollow,
  title = "Suggested Creators to Follow",
  subtitle = "Follow top creators to personalize your feed and discover inspiring content.",
  variant = "card", // "card" | "carousel"
}) {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingStates, setFollowingStates] = useState({}); // { [id]: 'idle' | 'loading' | 'done' }
  const [leavingIds, setLeavingIds] = useState(new Set());
  const [followedIds, setFollowedIds] = useState(new Set());
  const [loggedUserId, setLoggedUserId] = useState(null);
  const [loggedUsername, setLoggedUsername] = useState(null);
  const API_BASE = getApiBase();

  // Decode user from token
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded?.UserId) setLoggedUserId(decoded.UserId);
        if (decoded?.username) setLoggedUsername(decoded.username);
      } catch (_) {}
    }
  }, []);

  // Fetch pool of suggested creators
  useEffect(() => {
    let isMounted = true;

    const fetchPool = async () => {
      try {
        setLoading(true);

        // Fetch dedicated suggested creators and deep directory concurrently
        const [suggestedRes, allUsersRes] = await Promise.all([
          axios.get(`${API_BASE}/user/suggested-creators`).catch(() => ({ data: {} })),
          axios.get(`${API_BASE}/user/mango/getall`).catch(() => ({ data: [] })),
        ]);

        if (!isMounted) return;

        const listFromSuggested = Array.isArray(suggestedRes.data?.creators)
          ? suggestedRes.data.creators
          : [];
        const listFromAll = Array.isArray(allUsersRes.data) ? allUsersRes.data : [];

        // Merge without duplicates
        const map = new Map();
        listFromSuggested.forEach((c) => {
          if (c?._id && c?.username) map.set(String(c._id), c);
        });
        listFromAll.forEach((c) => {
          if (c?._id && c?.username && !map.has(String(c._id))) {
            map.set(String(c._id), c);
          }
        });

        const merged = Array.from(map.values());
        setCreators(merged);
      } catch (_) {
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPool();

    return () => {
      isMounted = false;
    };
  }, [API_BASE]);

  // Filter out: self (logged in), currently viewed profile (excludeUsername), and already followed
  const availableCreators = useMemo(() => {
    const exUser = (excludeUsername || "").trim().toLowerCase();
    const myName = (loggedUsername || "").trim().toLowerCase();
    const myId = String(loggedUserId || currentUserId || "");

    return creators.filter((c) => {
      const cId = String(c._id);
      const uName = (c.username || "").trim().toLowerCase();

      if (followedIds.has(cId)) return true; // keep briefly if in leaving transition
      if (myId && cId === myId) return false;
      if (myName && uName === myName) return false;
      if (exUser && uName === exUser) return false;

      return true;
    });
  }, [creators, excludeUsername, loggedUsername, loggedUserId, currentUserId, followedIds]);

  // Handle follow with smooth animation & replacement
  const handleFollow = async (creator) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.info("Please log in to follow creators! 🔑");
      return;
    }

    const creatorId = String(creator._id);
    if (followingStates[creatorId] === "loading" || followingStates[creatorId] === "done") {
      return;
    }

    playPop();
    setFollowingStates((prev) => ({ ...prev, [creatorId]: "loading" }));

    try {
      await axios.post(
        `${API_BASE}/user/follow/${creatorId}`,
        {},
        { headers: { "x-auth-token": token } }
      );

      setFollowingStates((prev) => ({ ...prev, [creatorId]: "done" }));
      toast.success(`Followed @${creator.username?.trim()}! 🎉`);

      if (onToggleFollow) {
        onToggleFollow(creatorId, creator.username);
      }

      // 1. Trigger slide-out animation
      setTimeout(() => {
        setLeavingIds((prev) => new Set([...prev, creatorId]));
      }, 350);

      // 2. Remove creator so next creator from pool pops in!
      setTimeout(() => {
        setCreators((prev) => prev.filter((c) => String(c._id) !== creatorId));
        setLeavingIds((prev) => {
          const next = new Set(prev);
          next.delete(creatorId);
          return next;
        });
        setFollowedIds((prev) => new Set([...prev, creatorId]));
        setFollowingStates((prev) => {
          const next = { ...prev };
          delete next[creatorId];
          return next;
        });
      }, 700);

    } catch (err) {
      setFollowingStates((prev) => ({ ...prev, [creatorId]: "idle" }));
      toast.error("Could not follow. Please try again.");
    }
  };

  // Up to 5 visible creators
  const visibleCreators = availableCreators.slice(0, 5);

  if (!loading && visibleCreators.length === 0) return null;

  // 1. Carousel Variant (e.g. In-feed rails)
  if (variant === "carousel") {
    return (
      <div className="my-4 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] select-none transition-colors duration-200">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5 text-xs font-black text-[var(--text-primary)]">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>{title}</span>
          </div>
          <Link
            href="/search"
            className="text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline"
          >
            Explore All →
          </Link>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {visibleCreators.map((creator) => {
            const creatorId = String(creator._id);
            const state = followingStates[creatorId] || "idle";
            const isLeaving = leavingIds.has(creatorId);
            const hasCustomPhoto = creator.profilePicture && creator.profilePicture !== "/Fondpeace.jpg";
            const initial = (creator.username?.[0] || "C").toUpperCase();

            return (
              <div
                key={creatorId}
                className={`w-36 shrink-0 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex flex-col items-center text-center shadow-xs transition-all duration-300 ${
                  isLeaving ? "opacity-0 scale-90 translate-y-2 pointer-events-none" : "opacity-100 scale-100"
                }`}
              >
                <Link href={`/profile/${creator.username?.trim()}`} className="relative mb-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden shadow-xs ring-2 ring-[var(--bg-surface)]">
                    {hasCustomPhoto ? (
                      <img
                        src={creator.profilePicture}
                        alt={creator.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-tr ${getGradientForName(creator.username)} text-white font-extrabold text-lg select-none`}>
                        {initial}
                      </div>
                    )}
                  </div>
                </Link>

                <Link
                  href={`/profile/${creator.username?.trim()}`}
                  className="font-bold text-xs text-[var(--text-primary)] truncate max-w-[120px] hover:underline"
                >
                  {creator.name || creator.username}
                </Link>
                <span className="text-[10px] text-[var(--text-secondary)] truncate max-w-[120px] mb-2.5">
                  @{creator.username?.trim()}
                </span>

                <button
                  type="button"
                  onClick={() => handleFollow(creator)}
                  disabled={state === "loading" || state === "done"}
                  className={`w-full py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                    state === "done"
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                  }`}
                >
                  {state === "loading" ? (
                    <span>...</span>
                  ) : state === "done" ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      <span>Followed</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Default Card Variant (Sidebar Widget)
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-5 shadow-xs select-none transition-colors duration-200">
      <div className="text-left mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)] mb-0.5">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>{title}</span>
          </div>
          <Link
            href="/search"
            className="text-[10px] font-bold text-[var(--text-secondary)] hover:text-blue-500 transition"
          >
            Explore →
          </Link>
        </div>
        <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="space-y-1.5">
        {visibleCreators.map((creator) => {
          const creatorId = String(creator._id);
          const state = followingStates[creatorId] || "idle";
          const isLeaving = leavingIds.has(creatorId);
          const hasCustomPhoto = creator.profilePicture && creator.profilePicture !== "/Fondpeace.jpg";
          const initial = (creator.username?.[0] || "C").toUpperCase();

          return (
            <div
              key={creatorId}
              className={`flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-subtle)] transition-all duration-300 ${
                isLeaving
                  ? "opacity-0 -translate-x-3 scale-95 pointer-events-none"
                  : "opacity-100 translate-x-0 scale-100"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <Link href={`/profile/${creator.username?.trim()}`} className="shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden shadow-xs ring-1 ring-[var(--border-subtle)]">
                    {hasCustomPhoto ? (
                      <img
                        src={creator.profilePicture}
                        alt={creator.username}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-tr ${getGradientForName(creator.username)} text-white font-black text-sm select-none`}>
                        {initial}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="truncate min-w-0">
                  <Link
                    href={`/profile/${creator.username?.trim()}`}
                    className="font-bold text-xs text-[var(--text-primary)] hover:underline flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{creator.name || creator.username}</span>
                    {creator.isVerified && (
                      <span className="text-blue-500 text-[10px] shrink-0" title="Verified">
                        ✓
                      </span>
                    )}
                  </Link>
                  <span className="text-[10.5px] text-[var(--text-secondary)] block truncate">
                    @{creator.username?.trim()}
                  </span>
                </div>
              </div>

              {/* Follow Button */}
              <button
                type="button"
                onClick={() => handleFollow(creator)}
                disabled={state === "loading" || state === "done"}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs ${
                  state === "done"
                    ? "bg-emerald-600 text-white"
                    : state === "loading"
                    ? "bg-blue-600/70 text-white cursor-wait"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                }`}
              >
                {state === "loading" ? (
                  <span>...</span>
                ) : state === "done" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Followed</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
