// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import StatusBar from "@/components/StatusBar";
import Link from "next/link";

import { Analytics } from "@vercel/analytics/react";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
       

      </head>

      <body className={inter.variable}>
        {/* ✅ Fixed, responsive & SEO-friendly header */}
        <header className="w-full fixed top-0 left-0 z-50 flex justify-center items-center py-4 md:py-6 border-b border-gray-200 bg-white shadow-md backdrop-blur-sm">
          <div>
            <h1 className="font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-tight">
              <strong>
                <a
                  href="https://www.fondpeace.com/"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                  aria-label="Fondpeace Homepage"
                >
                  FondPeace.com
                </a>
              </strong>
            </h1>
          </div>

                    <Link
                href="/searchbro"
                className="ml-4 text-sm bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700">
                Search
         </Link>
        </header>

          

  
        {/* ✅ Adds space so page content doesn't hide behind fixed header */}
        <div className="pt-24 md:pt-28">
          {children}
        </div>

          <div className="mt-8">
        <StatusBar />
          </div>
        <Analytics />
      </body>
    </html>
  );
}
