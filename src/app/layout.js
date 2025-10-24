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


            {/* Optional extra Adsterra script (if required globally) */}
        <Script
          id="adsterra-extra"
          src="//stinklistedtobacco.com/f6/16/56/f6165662a86e444978a2f98e3bc536f2.js"
          strategy="afterInteractive"
        />
            
      </head>

      <body className={inter.variable}>
        <header className="w-full md:m-2 flex justify-evenly items-center py-3 border-b border-gray-200 bg-white shadow-sm">
        <div>
          <h1 className="font-bold text-lg md:text-xl">
            <strong>
              <a
                href="https://www.fondpeace.com/"
                className="text-blue-600 hover:text-blue-700 transition-colors"
                aria-label="Fondpeace Homepage"
              >
                Fondpeace
              </a>
            </strong>
          </h1>
        </div>
      </header>

        {/* Page Content */}
        {children}

        
        <StatusBar />
        <Analytics />
      </body>
    </html>
  );
}
