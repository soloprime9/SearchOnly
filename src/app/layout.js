// app/layout.jsx
import { Inter } from "next/font/google";
import InstallPWA from "@/components/InstallPWA";
import WhatsAppClientUI from "@/components/WhatsAppClientUI";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import AuthGuard from "@/components/AuthGuard";
import CommandPalette from "@/components/CommandPalette";
import TopLoader from "@/components/TopLoader";
import CursorSpotlight from "@/components/CursorSpotlight";
import ToastContainer from "@/components/ToastContainer";
import FloatingDock from "@/components/FloatingDock";
import NetworkSentinel from "@/components/NetworkSentinel";
import GoogleOneTapPrompt from "@/components/GoogleOneTapPrompt";
import { ThemeBackgroundProvider } from "@/context/ThemeBackgroundContext";
import PassiveTelemetryTracker from "@/components/PassiveTelemetryTracker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.fondpeace.com"),

  title: {
    default: "FondPeace - Community, Ideas & Trending Videos",
    template: "%s | FondPeace",
  },

  description:
    "FondPeace is an independent community platform for thoughtful discussions, idea sharing, and trending short videos built on trust and transparency.",

  applicationName: "FondPeace",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://www.fondpeace.com",
  },

  openGraph: {
    title: "FondPeace - Community, Ideas & Trending Videos",
    description:
      "FondPeace is an independent community platform for thoughtful discussions, idea sharing, and trending short videos.",
    url: "https://www.fondpeace.com",
    siteName: "FondPeace",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.fondpeace.com/FondPeace-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "FondPeace - Community, Ideas & Trending Videos",
    description:
      "FondPeace is an independent community platform for thoughtful discussions, idea sharing, and trending short videos.",
    images: ["https://www.fondpeace.com/FondPeace-1200x630.jpg"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" data-bg="black" style={{ colorScheme: "dark" }}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var bg = localStorage.getItem('fondpeace_bg_theme') || 'black';
                  if (bg !== 'white' && bg !== 'black') bg = 'black';
                  var root = document.documentElement;
                  root.setAttribute('data-bg', bg);
                  if (bg === 'white') {
                    root.classList.remove('dark');
                    root.classList.add('light');
                    root.style.colorScheme = 'light';
                    root.style.setProperty('--bg-canvas', '#ffffff');
                    root.style.setProperty('--bg-surface', '#ffffff');
                    root.style.setProperty('--bg-surface-elevated', '#f8fafc');
                    root.style.setProperty('--bg-subtle', '#f4f4f5');
                    root.style.setProperty('--border-subtle', 'rgba(0, 0, 0, 0.08)');
                    root.style.setProperty('--background', '#ffffff');
                    root.style.setProperty('--foreground', '#09090b');
                    root.style.setProperty('--text-primary', '#09090b');
                    root.style.setProperty('--text-secondary', '#64748b');
                    root.style.backgroundColor = '#ffffff';
                  } else {
                    root.classList.add('dark');
                    root.classList.remove('light');
                    root.style.colorScheme = 'dark';
                    root.style.setProperty('--bg-canvas', '#000000');
                    root.style.setProperty('--bg-surface', '#0a0b10');
                    root.style.setProperty('--bg-surface-elevated', '#111218');
                    root.style.setProperty('--bg-subtle', '#161822');
                    root.style.setProperty('--border-subtle', 'rgba(255, 255, 255, 0.12)');
                    root.style.setProperty('--background', '#000000');
                    root.style.setProperty('--foreground', '#ffffff');
                    root.style.setProperty('--text-primary', '#ffffff');
                    root.style.setProperty('--text-secondary', '#a1a1aa');
                    root.style.backgroundColor = '#000000';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} bg-[var(--bg-canvas)] text-[var(--text-primary)] min-h-screen antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200`}>
        <ThemeBackgroundProvider>
          <TopLoader />
          <CursorSpotlight />
          <NetworkSentinel />
          <ToastContainer />
          <CommandPalette />
          <FloatingDock />
          <GoogleOneTapPrompt />
          <PassiveTelemetryTracker />

        {/* Global Schema.org JSON-LD Structured Data (Organization + WebSite + SearchAction) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.fondpeace.com/#organization",
                  "name": "FondPeace",
                  "url": "https://www.fondpeace.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.fondpeace.com/FondPeace-1200x630.jpg",
                    "width": 1200,
                    "height": 630,
                  },
                  "sameAs": [
                    "https://twitter.com/fondpeace",
                    "https://www.youtube.com/@fondpeace",
                    "https://www.linkedin.com/company/fondpeace",
                    "https://www.instagram.com/fondpeace",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.fondpeace.com/#website",
                  "url": "https://www.fondpeace.com",
                  "name": "FondPeace",
                  "description":
                    "FondPeace is an independent community platform for thoughtful discussions, idea sharing, and trending short videos.",
                  "publisher": { "@id": "https://www.fondpeace.com/#organization" },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://www.fondpeace.com/search?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />

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

        <div className="w-full min-h-screen">
          {children}
        </div>

        <Analytics />
        </ThemeBackgroundProvider>
      </body>
    </html>
  );
}
