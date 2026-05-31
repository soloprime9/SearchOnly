"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import jwtDecode from "jwt-decode";
import {
  FaHome,
  FaSearch,
  FaUser,
  FaVideo,
  FaUpload,
  FaShareAlt,
} from "react-icons/fa";

export default function LeftSidebar() {
  const [username, setUsername] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      if (decoded?.exp * 1000 > Date.now()) {
        setUsername(decoded.username);
      } else {
        localStorage.removeItem("token");
      }
    } catch {
      /* noop */
    }
  }, []);

  const menu = [
    { icon: FaHome,     label: "Home",    href: "/" },
    { icon: FaSearch,   label: "Explore", href: "/searchbro" },
    { icon: FaVideo,    label: "Shorts",  href: "/shorts/698c432d0a8059958d20a4f4" },
    { icon: FaUpload,   label: "Upload",  href: "/upload" },
    {
      icon: FaUser,
      label: "Profile",
      href: username ? `/profile/${username}` : "/login",
    },
    { icon: FaShareAlt, label: "Social",  href: "/aboutus" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════
          DESKTOP SIDEBAR
      ═══════════════════════════════════════════════════ */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`
          hidden lg:flex flex-col
          fixed left-0 top-0 h-screen z-40
          bg-white border-r border-black/[0.06]
          transition-all duration-300 ease-in-out
          overflow-hidden
          ${expanded ? "w-56 shadow-[4px_0_24px_rgba(0,0,0,0.06)]" : "w-[68px]"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-black/[0.04] shrink-0">
          <div className={`w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
            <span className="text-white font-black text-[15px] leading-none">F</span>
          </div>
          <span
            className={`
              ml-3 font-black text-[17px] tracking-tighter text-gray-950 whitespace-nowrap
              transition-all duration-200
              ${expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"}
            `}
          >
            Fond<span className="text-blue-500">Peace</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 mt-3 px-2 flex-1 overflow-hidden">
          {menu.map((item, i) => {
            const active = isActive(item.href);
            return (
              <Link
                key={i}
                href={item.href}
                className={`
                  relative flex items-center gap-3.5
                  h-11 px-2.5 rounded-xl
                  transition-all duration-150
                  group
                  ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-500 hover:bg-black/[0.04] hover:text-gray-900"
                  }
                `}
              >
                {/* Active indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
                )}

                <item.icon
                  className={`
                    shrink-0 text-[18px] ml-0.5
                    transition-transform duration-200
                    ${active ? "text-blue-500" : "group-hover:scale-110"}
                  `}
                />

                <span
                  className={`
                    text-[13.5px] font-semibold whitespace-nowrap
                    transition-all duration-200
                    ${expanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3 pointer-events-none w-0"}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom profile pill */}
        <div className="px-2 pb-4 shrink-0">
          <div className={`
            flex items-center gap-3 px-2.5 py-2.5 rounded-xl
            ${expanded ? "bg-black/[0.03]" : ""}
            transition-all duration-200
          `}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-[12px] uppercase">
                {username?.[0] || "?"}
              </span>
            </div>
            <div
              className={`
                flex flex-col min-w-0
                transition-all duration-200
                ${expanded ? "opacity-100" : "opacity-0 w-0 pointer-events-none"}
              `}
            >
              <span className="text-[12px] font-bold text-gray-900 truncate leading-tight">
                {username || "Guest"}
              </span>
              <span className="text-[10.5px] text-gray-400">
                {username ? "View profile →" : "Log in →"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION
      ═══════════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 backdrop-blur-xl border-t border-black/[0.07]">
        {/* Safe area for notched phones */}
        <div className="flex items-center justify-around px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
          {menu.slice(0, 5).map((item, i) => {
            const active = isActive(item.href);
            return (
              <Link
                key={i}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-1
                  min-w-[52px] py-1 rounded-xl
                  transition-all duration-150 active:scale-90
                  ${active ? "text-blue-600" : "text-gray-400"}
                `}
              >
                <div
                  className={`
                    relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200
                    ${active ? "bg-blue-50 scale-110" : ""}
                  `}
                >
                  <item.icon className={`text-[18px] transition-colors ${active ? "text-blue-500" : ""}`} />
                  {active && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </div>
                <span
                  className={`
                    text-[9.5px] font-semibold transition-colors
                    ${active ? "text-blue-600" : "text-gray-400"}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}









// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import jwtDecode from "jwt-decode";
// import {
//   FaHome,
//   FaSearch,
//   FaUser,
//   FaVideo,
//   FaUpload,
//   FaCog,
//   FaHeart,
//   FaShareAlt,
// } from "react-icons/fa";

// export default function LeftSidebar() {
//   const [userId, setUserId] = useState(null);

//   // ✅ Get userId from token
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     try {
//       const decoded = jwtDecode(token);

//       if (decoded.exp * 1000 > Date.now()) {
//         setUserId(decoded.username);
//       } else {
//         localStorage.removeItem("token");
//       }
//     } catch (error) {
//       console.error("Invalid token");
//     }
//   }, []);

//   // ✅ Menu INSIDE component (so it can access userId)
//   const menu = [
//     { icon: FaHome, label: "Home", href: "/" },
//     { icon: FaSearch, label: "Search", href: "/searchbro" },
    
//     { icon: FaVideo, label: "Shorts", href: "/shorts/698c432d0a8059958d20a4f4" },
//     { icon: FaUpload, label: "Upload", href: "/upload" },
    
    
//     {
//       icon: FaUser,
//       label: "Profile",
//       href: userId ? `/profile/${userId}` : "/login",
//     },
//     { icon: FaShareAlt, label: "Social", href: "/aboutus" },
    
//   ];

//   return (
//     <>
//       {/* DESKTOP SIDEBAR */}
//       <aside
//         className="
//           hidden lg:flex
//           fixed left-0 top-0
//           h-screen
//           bg-white
//           border-r
//           z-30
//           group
//           transition-all duration-300
//           w-16 hover:w-56
//         "
//       >
//         <nav className="flex flex-col gap-1 mt-20 w-full">
//           {menu.map((item, i) => (
//             <Link
//               key={i}
//               href={item.href}
//               className="
//                 flex items-center gap-4
//                 px-4 py-3
//                 text-gray-700
//                 hover:bg-gray-100
//                 transition
//                 w-full
//               "
//             >
//               <item.icon className="text-xl shrink-0" />

//               <span
//                 className="
//                   whitespace-nowrap
//                   opacity-0
//                   group-hover:opacity-100
//                   transition-opacity duration-200
//                 "
//               >
//                 {item.label}
//               </span>
//             </Link>
//           ))}
//         </nav>
//       </aside>

//       {/* MOBILE BOTTOM BAR */}
//       <nav
//         className="
//           fixed bottom-0 left-0 right-0
//           z-40
//           bg-white
//           border-t
//           flex justify-around
//           py-4
//           lg:hidden
//         "
//       >
//         {menu.slice(0, 5).map((item, i) => (
//           <Link
//             key={i}
//             href={item.href}
//             className="flex flex-col items-center text-gray-600 hover:text-black transition"
//           >
//             <item.icon className="text-2xl" />
//           </Link>
//         ))}
//       </nav>
//     </>
//   );
// }
