"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Plus, Sparkles } from "lucide-react";
import { getApiBase } from "@/utils/apiConfig";
import { playTap, playPop } from "@/utils/soundEffects";

export default function StoriesBar({ onOpenCreate }) {
  const [creators, setCreators] = useState([]);
  const API_BASE = getApiBase();

  useEffect(() => {
    let isMounted = true;
    axios
      .get(`${API_BASE}/user/suggested-creators`)
      .then((res) => {
        if (isMounted && res.data?.success && Array.isArray(res.data.creators)) {
          setCreators(res.data.creators.slice(0, 10));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="w-full mb-4">
      <div className="bg-[#0e111d] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1 px-1">
          {/* Add Story Button for Current User */}
          <Link
            href="/upload"
            onClick={() => playPop()}
            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
          >
            <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-cyan-400 group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-[#0a0b12] flex items-center justify-center overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400">
                  <Plus size={18} className="stroke-[3]" />
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-[#0e111d] shadow-md">
                <Plus size={11} className="stroke-[3]" />
              </div>
            </div>
            <span className="text-[11px] font-bold text-gray-300 group-hover:text-white transition-colors truncate max-w-[64px]">
              Your Story
            </span>
          </Link>

          {/* Creators Stories Tray */}
          {creators.map((creator, i) => (
            <Link
              key={creator._id || i}
              href={`/profile/${creator.username}`}
              onClick={() => playTap()}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
            >
              <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-[#0a0b12] p-[1.5px] overflow-hidden">
                  <img
                    src={creator.profilePic || creator.avatar || "/Fondpeace.jpg"}
                    alt={creator.username}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/Fondpeace.jpg";
                    }}
                  />
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
          ))}
        </div>
      </div>
    </div>
  );
}
