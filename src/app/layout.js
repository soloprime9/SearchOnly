// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import StatusBar from "@/components/StatusBar";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { FaSearch } from "react-icons/fa";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head></head>
      <body className={`${inter.variable} bg-gray-50`}>

        {/* ===== HEADER ===== */}
        <header className="w-full fixed top-0 left-0 z-50 flex justify-between items-center px-4 py-3 md:py-4 border-b border-gray-200 bg-white shadow-md backdrop-blur-sm">
          
          {/* Empty div for spacing left (so title stays centered) */}
          <div className="w-10 md:w-12"></div>

          {/* Centered Title */}
          <h1 className="font-extrabold text-xl sm:text-2xl md:text-3xl text-blue-600 text-center">
            <Link href="/" className="hover:text-blue-700 transition">
              FondPeace.com
            </Link>
          </h1>

          {/* Search icon on the right 
          <Link
            href="/searchbro"
            className="flex items-center text-sm bg-blue-600 text-white px-3 py-2 rounded-full shadow hover:bg-blue-700 transition cursor-pointer"
          >
            <FaSearch className="mr-1" /> Search
          </Link>
          */}

        </header>

        {/* ===== SEARCH BOX BELOW HEADER ===== */}
        <div className="pt-20 md:pt-24 px-4 flex justify-center w-full">
          <div className="w-full max-w-3xl">
            <Link
              href="/searchbro"
              className="block w-full text-gray-500 text-sm md:text-base p-3 rounded-xl border border-gray-300 bg-white shadow hover:shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <FaSearch /> Click here to search posts...
            </Link>
          </div>
        </div>

        {/* ===== PAGE CONTENT ===== */}
        <div className="pt-8 px-4 md:px-0 max-w-5xl mx-auto">
          {children}
        </div>

        {/* ===== STATUS BAR ===== */}
        <div className="mt-8 px-4 md:px-0">
          <StatusBar />
        </div>

        <Analytics />
      </body>
    </html>
  );
}
