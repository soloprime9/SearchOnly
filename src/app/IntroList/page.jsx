// app/IntroList/page.jsx
import Script from "next/script";
import Link from "next/link";
import IntroListView from "@/Introcomponents/IntroListView"; 
// this is your component that shows list

// ---------- SEO Metadata ----------
export const metadata = {
  title: "IntroList — Discover Trending Digital Tools & Startups",
  description:
    "IntroList on FondPeace helps you find trending startup tools, software, AI platforms, SaaS products, and technology innovations with reviews and analysis.",

  keywords: [
    "startup tools",
    "AI tools",
    "software listing",
    "saas tools",
    "product discovery",
    "latest tech tools",
    "digital tools",
    "tech startups",
    "new startups",
    "AI startup ideas",
    "best AI tools",
    "product hunt alternative",
    "new startup launches",
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1,
    },
  },

  openGraph: {
    title: "IntroList — Discover Trending Tech & AI Tools",
    description:
      "Discover trending startup tools, SaaS, AI platforms and technology products.",
    url: "https://fondpeace.com/IntroList",
    siteName: "IntroList",
    type: "website",
    locale: "en_US",
    images: [
      { url: "/Fondpeace.jpg", width: 1200, height: 630, alt: "IntroList Logo" }
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "IntroList — Top AI & Startup Tools",
    description:
      "Find new trending AI & startup tools listed daily.",
    creator: "@fondpeace",
    images: ["/Fondpeace.jpg"],
  },

  alternates: {
    canonical: "https://fondpeace.com/IntroList",
    languages: {
      "en-US": "https://fondpeace.com/IntroList",
    },
  },

  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};


// ---------- SERVER SIDE FETCH ----------
async function getData() {
  const res = await fetch("https://list-back-nine.vercel.app/get/mango",
    {
      cache: "no-store", // always SSR
      next: { revalidate: 0 },
    }
  );

  if (!res.ok) return [];

  return res.json();
}

// ---------- MAIN PAGE ----------
export default async function Page() {
  const res = await getData();
  const list = res.products || [];

  return (
    <>
      <Script
        id="introList-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "IntroList",
            "url": "https://fondpeace.com/IntroList",
            "description":
              "Discover new trending tools, startups, software and AI technologies.",
            "publisher": {
              "@type": "Organization",
              "name": "FondPeace",
            },
          }),
        }}
      />
{/* ===== HEADER ===== */}
       <header className="w-full fixed top-0 left-0 z-50 flex justify-center items-center px-4 py-3 md:py-4 border-b border-gray-200 bg-white shadow-md backdrop-blur-sm">

  
  <h1 className="font-bold text-lg sm:text-xl md:text-2xl text-blue-600 ">
    <Link href="/IntroList" className="hover:text-blue-700 transition">
      IntroList
    </Link>
  </h1>

</header>


      <IntroListView list={list} />
    </>
  );
}

