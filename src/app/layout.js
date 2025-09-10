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

        {/* OneSignal Push Notifications */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          defer
          strategy="afterInteractive"
        />
        <Script id="one-signal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "7155774c-af3a-4dbd-8c0e-ff6ed3bd2090",
                safari_web_id: "web.onesignal.auto.43666e9c-a8ad-4b1e-8de4-10291bcbdb86",
                notifyButton: {
                  enable: true,
                },
              });
            });
          `}
        </Script>
      </head>

      <body className={inter.variable}>
        <header className="md:m-2 flex justify-evenly">
          <div>
            <h1 className="font-bold md:block hidden">
              <strong>
                <a href="https://www.fondpeace.com/">Fondpeace</a>
              </strong>
            </h1>
          </div>
        </header>

        {children}

        <StatusBar />
        <Analytics />
      </body>
    </html>
  );
}
