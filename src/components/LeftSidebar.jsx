import React from "react";
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

const menu = [
  { icon: FaHome, label: "Home" },
  { icon: FaSearch, label: "Search" },
  { icon: FaUser, label: "Profile" },
  { icon: FaVideo, label: "Shorts" },
  { icon: FaUpload, label: "Upload" },
  { icon: FaHeart, label: "Activity" },
  { icon: FaShareAlt, label: "Social" },
  { icon: FaCog, label: "Settings" },
];

export default function LeftSidebar() {
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
          w-16 hover:w-56 left-0
        "
      >
        <nav className="flex flex-col gap-1 mt-20 w-full">
          {menu.map((item, i) => (
            <button
              key={i}
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

              {/* Label (shows on hover) */}
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
            </button>
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
          py-2
          lg:hidden
        "
      >
        {menu.slice(0, 5).map((item, i) => (
          <button
            key={i}
            className="flex flex-col items-center text-gray-600 hover:text-black transition"
          >
            <item.icon className="text-xl" />
          </button>
        ))}
      </nav>
    </>
  );
}
