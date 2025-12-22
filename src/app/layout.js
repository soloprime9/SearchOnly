// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import StatusBar from "@/components/StatusBar";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { FaSearch } from "react-icons/fa";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>

            {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VTZGD645EG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VTZGD645EG');
          `}
        </Script>
    
      </head>
      <body className={`${inter.variable} bg-gray-50`}>

        {/* ===== HEADER ===== 
       <header className="w-full fixed top-0 left-0 z-50 flex justify-center items-center px-4 py-3 md:py-4 border-b border-gray-200 bg-white shadow-md backdrop-blur-sm">

  
  <h1 className="font-bold text-lg sm:text-xl md:text-2xl text-blue-600 text-center">
    <Link href="/" className="hover:text-blue-700 transition">
      FondPeace.com
    </Link>
  </h1>

</header>

*/}

        

        {/* ===== PAGE CONTENT ===== */}
        <div className="pt- md:px-0 max-w-5xl mx-auto">
          {children}
        </div>

        {/* ===== STATUS BAR ===== 
        <div className="mt-8 px-4 md:px-0">
          <StatusBar />
        </div>
        */}

        <Analytics />
      </body>
    </html>
  );
}
