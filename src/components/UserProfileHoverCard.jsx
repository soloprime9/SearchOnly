"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UserPlus, Check, Sparkles, ShieldCheck } from "lucide-react";
import { playTap, playPop } from "@/utils/soundEffects";

export default function UserProfileHoverCard({
  user,
  currentUserId,
  isFollowing = false,
  onToggleFollow,
  children,
}) {
  const [showCard, setShowCard] = useState(false);
  const timeoutRef = useRef(null);
  const cardRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowCard(true), 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowCard(false), 200);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  if (!user) return <>{children}</>;

  const username = user.username || "creator";
  const displayName = user.name || username;
  const avatar = user.profilePicture || user.profilePic || user.avatar || "/Fondpeace.jpg";
  const bio = user.bio || "Creator on FondPeace community";
  const followersCount = Array.isArray(user.Followers) ? user.Followers.length : (user.followersCount || 0);
  const isSelf = currentUserId && String(user._id || user.id) === String(currentUserId);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger element (e.g. username link or avatar) */}
      <div
        onClick={(e) => {
          // On mobile, tap can toggle card
          if (window.innerWidth < 768) {
            e.stopPropagation();
            setShowCard((prev) => !prev);
          }
        }}
      >
        {children}
      </div>

      {/* Floating Hover Card */}
      {showCard && (
        <div
          ref={cardRef}
          className="absolute left-0 top-full mt-2 z-50 w-64 bg-white dark:bg-zinc-950 rounded-2xl p-4 shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            {/* Avatar */}
            <Link href={`/profile/${username}`}>
              <img
                src={avatar}
                alt={username}
                className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-zinc-800"
                onError={(e) => { e.currentTarget.src = "/Fondpeace.jpg"; }}
              />
            </Link>

            {/* 1-Click Follow Button */}
            {!isSelf && onToggleFollow && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  playPop();
                  onToggleFollow(user._id, username);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-90 flex items-center gap-1 shrink-0 ${
                  isFollowing
                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-rose-50 hover:text-rose-600 border border-gray-200 dark:border-zinc-700"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/25"
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check size={11} className="text-emerald-500 stroke-[3]" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={11} className="stroke-[2.5]" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Name & Handle & Verification Badges */}
          <Link href={`/profile/${username}`} className="block">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-sm text-gray-900 dark:text-white truncate hover:underline">
                {displayName}
              </span>
              {user.isVerified && (
                <ShieldCheck size={14} className="text-blue-500 fill-blue-500/20" title="Official Verified Creator 💎" />
              )}
              {user.isEmailVerified && (
                <ShieldCheck size={14} className="text-emerald-500 fill-emerald-500/20" title="Email Verified Account 🛡️" />
              )}
              {user.category && user.category !== "General" && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/40">
                  {user.category}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">@{username}</p>
          </Link>

          {/* Tagline */}
          {user.tagline && (
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 italic">
              &ldquo;{user.tagline}&rdquo;
            </p>
          )}

          {/* Bio */}
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1.5 line-clamp-2 leading-relaxed">
            {bio}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-gray-100 dark:border-zinc-800/80 text-xs">
            <div className="flex items-center gap-1">
              <span className="font-black text-gray-900 dark:text-white">{followersCount}</span>
              <span className="text-gray-500 dark:text-gray-400 text-[11px]">Followers</span>
            </div>
            <Link
              href={`/profile/${username}`}
              className="ml-auto text-blue-600 dark:text-blue-400 font-bold text-[11px] hover:underline"
            >
              View Profile →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
