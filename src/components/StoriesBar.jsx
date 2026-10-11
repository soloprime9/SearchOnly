"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Plus } from "lucide-react";
import jwt from "jsonwebtoken";
import { getApiBase } from "@/utils/apiConfig";
import { playTap, playPop } from "@/utils/soundEffects";

export default function StoriesBar() {
  const [creators, setCreators] = useState([]);
  const [currentUserAvatar, setCurrentUserAvatar] = useState("");
  const [currentInitial, setCurrentInitial] = useState("U");
  const API_BASE = getApiBase();

  const loadUserAvatar = () => {
    if (typeof window === "undefined") return;
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwt.decode(token);
        const username = decoded?.username || decoded?.name;
        if (username) {
          setCurrentInitial(username[0]?.toUpperCase() || "U");
          const cached = localStorage.getItem(`fondpeace_profile_${username.toLowerCase()}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.profilePicture && parsed.profilePicture !== "/Fondpeace.jpg") {
              setCurrentUserAvatar(parsed.profilePicture);
            }
          }
        }

        // Live server sync from /user/me
        axios
          .get(`${API_BASE}/user/me`, {
            headers: { "x-auth-token": token, Authorization: `Bearer ${token}` }
          })
          .then((res) => {
            if (res.data?.success && res.data?.user) {
              const u = res.data.user;
              if (u.username) setCurrentInitial(u.username[0]?.toUpperCase() || "U");
              const pic = u.profilePicture || u.profilePic || u.avatar;
              if (pic && pic !== "/Fondpeace.jpg" && pic.trim() !== "") {
                setCurrentUserAvatar(pic);
              }
            }
          })
          .catch(() => {});
      }
    } catch (_) {}
  };

  useEffect(() => {
    let isMounted = true;
    loadUserAvatar();

    axios
      .get(`${API_BASE}/user/suggested-creators`)
      .then((res) => {
        if (isMounted && res.data?.success && Array.isArray(res.data.creators)) {
          setCreators(res.data.creators.slice(0, 10));
        }
      })
      .catch(() => {});

    const handleProfileUpdate = (e) => {
      if (e.detail?.profilePicture) {
        setCurrentUserAvatar(e.detail.profilePicture);
      }
      if (e.detail?.username) {
        setCurrentInitial(e.detail.username[0]?.toUpperCase() || "U");
      }
    };

    window.addEventListener("user_profile_updated", handleProfileUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("user_profile_updated", handleProfileUpdate);
    };
  }, []);

  return (
    <div className="w-full mb-4">
      <div className="bg-[var(--bg-surface)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-colors duration-200">
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
          {/* Add Story Button for Current User with their profile picture */}
          <Link
            href="/upload"
            onClick={() => playPop()}
            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-400 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-[#0a0b12] flex items-center justify-center overflow-hidden">
                {currentUserAvatar && currentUserAvatar !== "/Fondpeace.jpg" ? (
                  <img
                    src={currentUserAvatar}
                    alt="Your Story"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-sm select-none">
                    {currentInitial}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-[#0e111d] shadow-md group-hover:scale-110 transition-transform">
                <Plus size={11} className="stroke-[3]" />
              </div>
            </div>
            <span className="text-[11px] font-bold text-gray-300 group-hover:text-white transition-colors truncate max-w-[64px]">
              Your Story
            </span>
          </Link>

          {/* Creators Stories Tray */}
          {creators.map((creator, i) => {
            const rawPic = creator.profilePicture || creator.profilePic || creator.avatar;
            const hasCustomPhoto = rawPic && rawPic !== "/Fondpeace.jpg" && rawPic.trim() !== "";
            const initial = (creator.username?.[0] || creator.name?.[0] || "C").toUpperCase();

            return (
              <Link
                key={creator._id || i}
                href={`/profile/${creator.username}`}
                onClick={() => playTap()}
                className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
              >
                <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-[#0a0b12] p-[1.5px] overflow-hidden flex items-center justify-center">
                    {hasCustomPhoto ? (
                      <img
                        src={rawPic}
                        alt={creator.username}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(creator.username || "creator")}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-sm select-none">
                        {initial}
                      </div>
                    )}
                  </div>
                  {/* Live / New Ring Badge */}
                  {i % 2 === 0 && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-gradient-to-r from-rose-500 to-pink-500 text-[8.5px] font-black text-white uppercase rounded-full border border-black shadow-xs">
                      LIVE
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-gray-300 group-hover:text-blue-400 transition-colors truncate max-w-[64px]">
                  {creator.username}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
