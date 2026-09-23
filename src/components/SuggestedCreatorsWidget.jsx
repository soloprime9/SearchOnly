"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Users, UserPlus, Check, Sparkles } from "lucide-react";
import { getApiBase } from "@/utils/apiConfig";
import { playTap, playPop } from "@/utils/soundEffects";

export default function SuggestedCreatorsWidget({
  currentUserId,
  followingMap = {},
  onToggleFollow,
  title = "Suggested Creators to Follow",
  subtitle = "Follow top creators to personalize your feed and discover inspiring content.",
  variant = "card", // "card" | "carousel"
}) {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = getApiBase();

  useEffect(() => {
    let isMounted = true;

    // Try dedicated suggested creators endpoint first, then fallback to users extracted from posts
    axios
      .get(`${API_BASE}/user/suggested-creators`)
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res.data?.creators) ? res.data.creators : [];
        if (list.length > 0) {
          const filtered = list.filter(
            (c) => !currentUserId || String(c._id) !== String(currentUserId)
          );
          setCreators(filtered);
          return;
        }
        throw new Error("No creators");
      })
      .catch(() => {
        if (!isMounted) return;
        return axios
          .get(`${API_BASE}/post/mango/getall?page=1&limit=25`)
          .then((res) => {
            if (!isMounted) return;
            const posts = Array.isArray(res.data) ? res.data : [];
            if (posts.length > 0) {
              const map = {};
              posts.forEach((p) => {
                const u = p.userId;
                if (u && u.username) {
                  const uName = u.username.trim();
                  if (uName && !map[uName]) {
                    map[uName] = {
                      _id: u._id || `user-${uName}`,
                      username: uName,
                      name: u.name || uName,
                      isVerified: true,
                      bio: u.bio || "Community Creator",
                      profilePic: u.profilePic || u.profilePicture || "/Fondpeace.jpg",
                    };
                  }
                }
              });
              const list = Object.values(map).filter(
                (c) => !currentUserId || String(c._id) !== String(currentUserId)
              );
              setCreators(list);
            }
          })
          .catch(() => {});
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUserId, API_BASE]);

  const displayCreators = creators;

  if (!loading && displayCreators.length === 0) return null;

  if (variant === "carousel") {
    return (
      <div className="my-4 p-4 rounded-2xl bg-zinc-950 border border-white/[0.1] select-none">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5 text-xs font-black text-white">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>{title}</span>
          </div>
          <Link
            href="/search"
            className="text-[11px] font-bold text-zinc-400 hover:text-white hover:underline"
          >
            Explore All →
          </Link>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {displayCreators.slice(0, 8).map((creator) => {
            const isFollowing = !!followingMap[creator._id];
            return (
              <div
                key={creator._id}
                className="w-36 shrink-0 p-3 rounded-xl bg-zinc-900 border border-white/10 flex flex-col items-center text-center shadow-sm hover:border-white/30 transition-all"
              >
                <Link href={`/profile/${creator.username}`} className="relative mb-2">
                  <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-blue-500 to-indigo-500">
                    <img
                      src={creator.profilePic || "/Fondpeace.jpg"}
                      alt={creator.username}
                      className="w-full h-full rounded-full object-cover bg-white"
                      onError={(e) => {
                        e.currentTarget.src = "/Fondpeace.jpg";
                      }}
                    />
                  </div>
                </Link>

                <Link
                  href={`/profile/${creator.username}`}
                  className="font-bold text-xs text-white truncate max-w-[120px] hover:underline"
                >
                  {creator.name || creator.username}
                </Link>
                <span className="text-[10px] text-zinc-400 truncate max-w-[120px] mb-2.5">
                  @{creator.username}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    if (onToggleFollow) onToggleFollow(creator._id, creator.username);
                  }}
                  className={`w-full py-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
                    isFollowing
                      ? "bg-zinc-800 text-zinc-300 border border-white/10"
                      : "bg-white text-black font-extrabold hover:bg-zinc-200"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Following</span>
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

  // Default Card variant
  return (
    <div className="bg-zinc-950 border border-white/[0.1] rounded-2xl p-4 sm:p-5 my-3 shadow-md select-none">
      <div className="text-left mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-0.5">
          <Users className="w-3.5 h-3.5 text-white" />
          <span>{title}</span>
        </div>
        <p className="text-zinc-400 text-[11px] leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="space-y-2.5">
        {displayCreators.slice(0, 6).map((creator) => {
          const isFollowing = !!followingMap[creator._id];
          return (
            <div
              key={creator._id}
              className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.08]"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Link href={`/profile/${creator.username}`} className="shrink-0">
                  <div className="w-9 h-9 rounded-full p-[1px] bg-white/[0.2]">
                    <img
                      src={creator.profilePic || "/Fondpeace.jpg"}
                      alt={creator.username}
                      className="w-full h-full rounded-full object-cover bg-black"
                      onError={(e) => {
                        e.currentTarget.src = "/Fondpeace.jpg";
                      }}
                    />
                  </div>
                </Link>

                <div className="truncate">
                  <Link
                    href={`/profile/${creator.username}`}
                    className="font-bold text-xs text-white hover:underline flex items-center gap-1"
                  >
                    <span>{creator.name || creator.username}</span>
                    {creator.isVerified && (
                      <span className="text-white text-[11px]" title="Verified">
                        ✓
                      </span>
                    )}
                  </Link>
                  <span className="text-[10.5px] text-zinc-400 block truncate">
                    @{creator.username}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playTap();
                  if (onToggleFollow) onToggleFollow(creator._id, creator.username);
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                  isFollowing
                    ? "bg-zinc-800 text-zinc-300 border border-white/10"
                    : "bg-white text-black font-extrabold hover:bg-zinc-200 shadow-sm"
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Following</span>
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
