// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import StatusBar from "@/components/StatusBar";
import { Analytics } from "@vercel/analytics/react";

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

        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5007774826517640"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Optional extra Adsterra script */}
        <Script
          id="adsterra-extra"
          src="//stinklistedtobacco.com/f6/16/56/f6165662a86e444978a2f98e3bc536f2.js"
          strategy="afterInteractive"
        />
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
                  Fondpeace.com<span className="hidden sm:inline">.com</span>
                </a>
              </strong>
            </h1>
          </div>
        </header>

        {/* ✅ Adds space so page content doesn't hide behind fixed header */}
        <div className="pt-24 md:pt-28">
          {children}
        </div>

        <StatusBar />
        <Analytics />
      </body>
    </html>
  );
}
