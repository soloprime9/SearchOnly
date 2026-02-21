"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import jwtDecode from "jwt-decode";
import {
  FaHome,
  FaSearch,
  FaUser,
  FaVideo,
  FaUpload,
  FaCog,
  FaHeart,
  FaShareAlt,
} from "react-icons/fa";

export default function LeftSidebar() {
  const [userId, setUserId] = useState(null);

  // ✅ Get userId from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 > Date.now()) {
        setUserId(decoded.username);
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Invalid token");
    }
  }, []);

  // ✅ Menu INSIDE component (so it can access userId)
  const menu = [
    { icon: FaHome, label: "Home", href: "/" },
    { icon: FaSearch, label: "Search", href: "/searchbro" },
    
    { icon: FaVideo, label: "Shorts", href: "/shorts/698c432d0a8059958d20a4f4" },
    { icon: FaUpload, label: "Upload", href: "/upload" },
    
    
    {
      icon: FaUser,
      label: "Profile",
      href: userId ? `/profile/${userId}` : "/login",
    },
    { icon: FaShareAlt, label: "Social", href: "/aboutus" },
    
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className="
          hidden lg:flex
          fixed left-0 top-0
          h-screen
          bg-white
          border-r
          z-30
          group
          transition-all duration-300
          w-16 hover:w-56
        "
      >
        <nav className="flex flex-col gap-1 mt-20 w-full">
          {menu.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="
                flex items-center gap-4
                px-4 py-3
                text-gray-700
                hover:bg-gray-100
                transition
                w-full
              "
            >
              <item.icon className="text-xl shrink-0" />

              <span
                className="
                  whitespace-nowrap
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity duration-200
                "
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* MOBILE BOTTOM BAR */}
      <nav
        className="
          fixed bottom-0 left-0 right-0
          z-40
          bg-white
          border-t
          flex justify-around
          py-4
          lg:hidden
        "
      >
        {menu.slice(0, 5).map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="flex flex-col items-center text-gray-600 hover:text-black transition"
          >
            <item.icon className="text-2xl" />
          </Link>
        ))}
      </nav>
    </>
  );
}
