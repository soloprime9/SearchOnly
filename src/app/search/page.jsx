// app/search/page.jsx
// FINAL PRODUCTION VERSION — fully SEO optimized, no "use client"
// Entire page is server-rendered. SearchGo is client-only but isolated.

import React from "react";
import SearchGo from "@/components/SearchGo"; // client component (assumed path)
import Link from "next/link";
import { Metadata } from "next"; 

// -------------------- SEO METADATA --------------------

export const metadata = {
  // Primary Title: Keep it concise and keyword-rich
  title: "FondPeace Search — Trending News, sofik sonali 2nd video, desihub,xhamster, AI, Tech & Global Stories",
  
  // Primary Description: Detailed, compelling, and keyword-inclusive
  description:
    "sofik sonali 2nd Viral video 19 minute link full video download, desihub, xhamster, AI, anime 19 minute viral video link download free,19 minutes viral video download, 19 minute viral video original link, All viral video link website, Viral video link original, 19 minute viral, video original link telegram, 19 minute viral video telegram link , you can search anything here on FondPeace.",
  // Keywords: Use sparingly, focus on Title/Description instead
  keywords: [
    "FondPeace search",
    "desihub", "19 minute viral video original link","video original link telegram","sofik sonali 2nd video","xhamster",
    "trending news",
    "viral videos",
    "AI tools",
    "tech news",
    "serial updates",
    "sports highlights",
    "global stories",
    "breaking news",
  ],
  // Canonical URL: Essential for avoiding duplicate content issues
  alternates: {
    canonical: "https://www.fondpeace.com/search",
    languages: {
      "en": "/search", 
      "en-IN": "/in/search", 
      "en-GB": "/uk/search", 
    },
  },
  // Robots: Standard best practice for full indexing
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1, 
    "max-video-preview": -1, 
  },
  // Open Graph (OG) for social media previews
  openGraph: {
    title: "FondPeace Search — Find Trending News & Viral Videos",
    description:
      "Explore trending news, viral videos, AI updates, tech, entertainment & more — instantly.",
    url: "https://www.fondpeace.com/search",
    siteName: "FondPeace",
    type: "website",
    locale: "en_US", 
    images: [
      {
        url: "https://www.fondpeace.com/Fondpeace.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace Search",
      },
    ],
  },
  // Twitter Card for X (Twitter) previews
  twitter: {
    card: "summary_large_image",
    title: "FondPeace Search — Fast Trending News & Viral Videos",
    description:
      "Search global news, viral videos, AI tools & entertainment instantly.",
    images: ["https://www.fondpeace.com/logo.jpg"],
  },
};

// -------------------- DATA (REMAINS THE SAME) --------------------

const GLOBAL_CATEGORIES = [
  "India News", "World News", "USA News", "UK News", "Europe", "Middle East", "Asia", "Africa",
  "Politics", "Elections", "Crime", "Weather", "Technology", "Artificial Intelligence",
  "Machine Learning", "Startups", "Business", "Finance", "Stock Market", "Crypto", "Economy",
  "Science", "Space", "Sports", "Cricket", "Football", "NBA", "Gaming", "Movies", "Bollywood",
  "Hollywood", "K-Dramas", "Anime", "Serial Updates", "Lifestyle", "Health", "Food",
  "Travel", "Education", "Jobs", "Automobile", "Viral Videos", "Shorts", "Reels", "Influencers"
];

const TRENDING_TOPICS = [
  "OpenAI updates",
  "World Cup Highlights",
  "India Breaking News",
  "Top Viral Video Today",
  "Best AI Tools 2025",
  "Latest Movie Trailers",
  "Serial Written Update Today"
];

const FAQS = [
  {
    q: "What is FondPeace Search?",
    a: "FondPeace Search helps users discover trending news, viral videos, AI updates, entertainment, sports and global stories — fast and organized.",
  },
  {
    q: "Is FondPeace free?",
    a: "Yes. FondPeace Search is completely free to use.",
  },
  {
    q: "How does FondPeace find trending topics?",
    a: "We use freshness, engagement, trust score and AI clustering to highlight trending topics.",
  },
];

// ------------------ JSON-LD (Structured Data) ------------------

function JsonLD() {
  const now = new Date().toISOString();

  // 1. WebSite Schema (For Sitelinks Searchbox)
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FondPeace",
    url: "https://www.fondpeace.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.fondpeace.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  // 2. Organization Schema
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FondPeace",
    url: "https://www.fondpeace.com",
    logo: "https://www.fondpeacelogo.jpg",
    sameAs: [
      "https://www.facebookfondpeace",
      "https://www.instagramfondpeace",
      "https://twitterfondpeace",
      "https://www.youtube@FondPeace",
    ],
  };

  // 3. WebPage Schema
  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "FondPeace Search",
    url: "https://www.fondpeacesearch",
    description: metadata.description,
    inLanguage: "en",
    datePublished: "2024-01-01T00:00:00+00:00", 
    dateModified: now,
  };

  // 4. FAQPage Schema (For FAQ Rich Snippets)
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(page) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}

// ------------------ PAGE COMPONENT ------------------

export default function SearchPage() {
  const today = new Date().toISOString().split("T")[0];
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <JsonLD />

      {/* 1. SEARCH BOX (Main Functional Component - HIGHEST VISUAL POSITION) */}
      <section
  className="max-w-3xl mx-auto px-4 pt-1 md:pt-2" // reduced top padding
  aria-label="FondPeace Search Bar"
>
  <div className="sticky top-4 bg-white z-30"> {/* removed py-4 */}
    <SearchGo />
  </div>
</section>


      {/* 2. HERO SECTION (Page Title and Meta Information - NOW BELOW THE SEARCH BAR) */}
      <header className="max-w-5xl mx-auto px-2 pt-4 pb-4">
        
        {/* H1 must still exist to define the page topic, but is now second in the content flow */}
        <h1 className="text-3xl md:text-4xl font-extrabold">
          FondPeace Search — Discover Trending News, Videos, AI & More
        </h1>
        <p className="mt-3 text-gray-700 max-w-3xl">
          Find trending topics, viral videos, AI tool updates, sports highlights & local stories.
          Fast, reliable and updated — powered by FondPeace.
        </p>

        <div className="mt-3 text-sm text-gray-600">
          © FondPeace • Updated <time dateTime={today}>{today}</time> • Email:{" "}
          <a href="mailto:contact@fondpeace.com" className="underline">
            contact@fondpeace.com
          </a>
        </div>
      </header>

      {/* 3. TRENDING NOW - Good for internal linking and indexation of high-value keywords */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <h2 className="text-lg font-semibold">Trending Now</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {TRENDING_TOPICS.map((t, i) => (
            <Link
              key={i}
              href={`/search?q=${encodeURIComponent(t)}`}
              className="px-3 py-2 text-sm bg-gray-100 rounded-full hover:bg-black hover:text-white transition"
              prefetch={false} 
            >
              {t}
            </Link>
          ))}
        </div>
      </section>

      {/* 4. CATEGORIES - Excellent for internal linking and topic authority */}
      <section className="max-w-5xl mx-auto px-4 mt-10">
        <h3 className="text-xl font-semibold">Popular Categories</h3>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {GLOBAL_CATEGORIES.map((cat, index) => (
            <Link
              key={index}
              href={`/search?q=${encodeURIComponent(cat)}`}
              className="bg-sky-50 hover:bg-sky-100 p-3 rounded-md"
              prefetch={false}
            >
              <div className="font-medium">{cat}</div>
              <div className="text-xs text-gray-600">Trending stories</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. SEO CONTENT - Trust and E-A-T Building */}
      <article className="max-w-5xl mx-auto px-4 prose prose-lg mt-10">
        <h2 className="!mb-4">About FondPeace Search</h2>

        <p className="text-gray-700 leading-relaxed">
          FondPeace Search is built to help people discover information faster —
          whether it’s **breaking news**, **viral videos**, entertainment updates, **AI tools**,
          sports highlights or community stories. Our focus is on delivering a clean,
          simple and reliable search experience that works smoothly across all devices.
        </p>

        <p className="text-gray-700 mt-4 leading-relaxed">
          Instead of overwhelming users with clutter, FondPeace Search organizes topics
          into easy categories and presents results in a straightforward way. This makes
          it easier for you to explore what’s trending without distractions or confusion.
        </p>

        <h3 className="mt-8">What Makes FondPeace Different?</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Fast and clean search experience without unnecessary complexity.</li>
          <li>Fresh updates across news, entertainment, tech and sports.</li>
          <li>Simple design that focuses on clarity and user comfort.</li>
          <li>No intrusive ads, no aggressive push — just straightforward results.</li>
          <li>Privacy-friendly approach with minimum required data usage.</li>
        </ul>

        <h3 className="mt-8">Our Commitment</h3>
        <p className="text-gray-700 leading-relaxed">
          FondPeace aims to maintain **accuracy**, **clarity** and **transparency** in all search
          results. When possible, we provide context and source references to ensure
          readers can verify the information easily.
        </p>

        <p className="text-gray-700 mt-4 leading-relaxed">
          If you ever find incorrect information or need clarification, feel free to
          reach us at{" "}
          <a href="mailto:contact@fondpeace.com" className="underline">
            contact@fondpeace.com
          </a>.
        </p>
      </article>

      {/* 6. FAQ SECTION - Supports Rich Snippets (using h3) */}
      <section className="max-w-5xl mx-auto px-4 mt-12">
        <h3 className="text-2xl font-semibold mb-4">Frequently Asked Questions (FAQ)</h3>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <details key={i} className="bg-gray-50 p-4 rounded-md">
              <summary className="font-medium">{f.q}</summary>
              <p className="mt-2 text-gray-700">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 7. PRIVACY & DATA HANDLING - Critical for Trust/E-A-T */}
      <section className="max-w-5xl mx-auto px-4 mt-12">
        <h3 className="text-2xl font-semibold mb-4">Privacy & Data Handling</h3>

        <p className="text-gray-700 mt-3">
          FondPeace is designed with user privacy in mind. We do not sell, rent, or misuse
          any personal data. Only essential technical information is processed to keep the
          website secure, stable, and fast.
        </p>

        <p className="text-gray-700 mt-3">
          Search terms are only used to show results and improve performance. They are
          not linked to your identity, and we do not create user profiles or track
          personal behavior across pages.
        </p>

        <p className="text-gray-700 mt-3">
          We use a small number of necessary cookies for performance, spam-prevention,
          and error monitoring. These cookies do not identify who you are and are never
          used for targeted advertising.
        </p>

        <p className="text-gray-700 mt-3">
          Some search results may link to third-party websites. Their privacy policies
          may differ, and FondPeace does not control their content. We encourage users
          to review external policies before interacting with them.
        </p>

        <p className="text-gray-700 mt-3">
          Users may request correction or removal of content or ask for data-related
          clarifications anytime by contacting us at 
          <a className="underline ml-1" href="mailto:contact@fondpeace.com">
            contact@fondpeace.com
          </a>.
        </p>

        <p className="text-gray-700 mt-3">
          Updated: {today}. For full details, visit our{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>.
        </p>
      </section>

      {/* 8. FOOTER - Essential utility links */}
      <footer className="max-w-5xl mx-auto px-4 mt-12 mb-12 border-t pt-6 text-sm text-gray-600">
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>© {currentYear} FondPeace</div>
          <nav className="flex gap-4" aria-label="Footer Navigation">
            <Link href="/aboutus" className="hover:underline">About</Link>
            <Link href="/contactus" className="hover:underline">Contact</Link>
            <Link href="/privacypolicy" className="hover:underline">Privacy</Link>
            <Link href="/termcondition" className="hover:underline">Terms</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}





// // app/search/page.jsx
// // FINAL PRODUCTION VERSION — fully SEO optimized, no "use client"
// // Entire page is server-rendered. SearchGo is client-only but isolated.

// import React from "react";
// import SearchGo from "@/components/SearchGo"; // client component (assumed path)
// import Link from "next/link";
// import { Metadata } from "next"; // Import for type hinting, though not strictly needed for runtime

// // -------------------- SEO METADATA --------------------

// export const metadata = {
//   // Primary Title: Keep it concise and keyword-rich
//   title: "FondPeace Search — Trending News, Viral Videos, AI, Tech & Global Stories",
//   // Primary Description: Detailed, compelling, and keyword-inclusive
//   description:
//     "Search trending news, viral videos, AI tools, tech updates, serial written updates, sports highlights & global stories on FondPeace.",
//   // Keywords: Include a mix of primary and long-tail terms (Google uses these less, but still good for context)
//   keywords: [
//     "FondPeace search",
//     "trending news",
//     "viral videos",
//     "AI tools",
//     "tech news",
//     "serial updates",
//     "sports highlights",
//     "global stories",
//     "breaking news",
//   ],
//   // Canonical URL: Essential for avoiding duplicate content issues
//   alternates: {
//     canonical: "https://www.fondpeacesearch",
//     languages: {
//       "en": "/search", // Default English
//       "en-IN": "/in/search", // Specific for India, good for geo-targeting
//       "en-GB": "/uk/search", // Specific for UK
//     },
//   },
//   // Robots: Standard best practice for full indexing
//   robots: {
//     index: true,
//     follow: true,
//     "max-image-preview": "large",
//     "max-snippet": -1, // Allows Google to use maximum snippet length
//     "max-video-preview": -1, // Allows Google to use maximum video preview length
//   },
//   // Open Graph (OG) for social media previews (Facebook, LinkedIn, etc.)
//   openGraph: {
//     title: "FondPeace Search — Find Trending News & Viral Videos",
//     description:
//       "Explore trending news, viral videos, AI updates, tech, entertainment & more — instantly.",
//     url: "https://www.fondpeace.com/search",
//     siteName: "FondPeace",
//     type: "website",
//     locale: "en_US", // Best practice to set locale
//     images: [
//       {
//         url: "https://www.fondpeace.com/og-search.jpg",
//         width: 1200,
//         height: 630,
//         alt: "FondPeace Search",
//       },
//     ],
//   },
//   // Twitter Card for X (Twitter) previews
//   twitter: {
//     card: "summary_large_image",
//     title: "FondPeace Search — Fast Trending News & Viral Videos",
//     description:
//       "Search global news, viral videos, AI tools & entertainment instantly.",
//     images: ["https://www.fondpeace.com/og-search.jpg"],
//   },
// };

// // -------------------- DATA (REMAINS THE SAME) --------------------

// const GLOBAL_CATEGORIES = [
//   "India News", "World News", "USA News", "UK News", "Europe", "Middle East", "Asia", "Africa",
//   "Politics", "Elections", "Crime", "Weather", "Technology", "Artificial Intelligence",
//   "Machine Learning", "Startups", "Business", "Finance", "Stock Market", "Crypto", "Economy",
//   "Science", "Space", "Sports", "Cricket", "Football", "NBA", "Gaming", "Movies", "Bollywood",
//   "Hollywood", "K-Dramas", "Anime", "Serial Updates", "Lifestyle", "Health", "Food",
//   "Travel", "Education", "Jobs", "Automobile", "Viral Videos", "Shorts", "Reels", "Influencers"
// ];

// const TRENDING_TOPICS = [
//   "OpenAI updates",
//   "World Cup Highlights",
//   "India Breaking News",
//   "Top Viral Video Today",
//   "Best AI Tools 2025",
//   "Latest Movie Trailers",
//   "Serial Written Update Today"
// ];

// const FAQS = [
//   {
//     q: "What is FondPeace Search?",
//     a: "FondPeace Search helps users discover trending news, viral videos, AI updates, entertainment, sports and global stories — fast and organized.",
//   },
//   {
//     q: "Is FondPeace free?",
//     a: "Yes. FondPeace Search is completely free to use.",
//   },
//   {
//     q: "How does FondPeace find trending topics?",
//     a: "We use freshness, engagement, trust score and AI clustering to highlight trending topics.",
//   },
// ];

// // ------------------ JSON-LD (Structured Data) ------------------
// // This is CRITICAL for good search results and features like Sitelinks Searchbox and FAQ Snippets.

// function JsonLD() {
//   const now = new Date().toISOString();

//   // 1. WebSite Schema (For Sitelinks Searchbox)
//   const website = {
//     "@context": "https://schema.org",
//     "@type": "WebSite",
//     name: "FondPeace",
//     url: "https://www.fondpeace.com",
//     potentialAction: {
//       "@type": "SearchAction",
//       target: "https://www.fondpeace.com/search?q={search_term_string}",
//       "query-input": "required name=search_term_string",
//     },
//   };

//   // 2. Organization Schema
//   const org = {
//     "@context": "https://schema.org",
//     "@type": "Organization",
//     name: "FondPeace",
//     url: "https://www.fondpeace.com",
//     logo: "https://www.fondpeace.com/logo.png",
//     sameAs: [
//       "https://www.facebook.com/fondpeace",
//       "https://www.instagram.com/fondpeace",
//       "https://twitter.com/fondpeace",
//       "https://www.youtube.com/@FondPeace",
//     ],
//   };

//   // 3. WebPage Schema
//   const page = {
//     "@context": "https://schema.org",
//     "@type": "WebPage",
//     name: "FondPeace Search",
//     url: "https://www.fondpeace.com/search",
//     description: metadata.description,
//     inLanguage: "en",
//     datePublished: "2024-01-01T00:00:00+00:00", // Placeholder for a real published date
//     dateModified: now,
//   };

//   // 4. FAQPage Schema (For FAQ Rich Snippets)
//   const faq = {
//     "@context": "https://schema.org",
//     "@type": "FAQPage",
//     mainEntity: FAQS.map((f) => ({
//       "@type": "Question",
//       name: f.q,
//       acceptedAnswer: { "@type": "Answer", text: f.a },
//     })),
//   };

//   return (
//     // Use dangerouslySetInnerHTML to inject valid JSON-LD scripts
//     <>
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(page) }} />
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
//     </>
//   );
// }

// // ------------------ PAGE COMPONENT ------------------

// export default function SearchPage() {
//   const today = new Date().toISOString().split("T")[0];
//   const currentYear = new Date().getFullYear();

//   return (
//     <main className="min-h-screen bg-white text-gray-900">
//       {/* Inject the SEO-critical structured data here. 
//         Google recommends placing JSON-LD scripts high in the page. 
//       */}
//       <JsonLD />

//       {/* HERO SECTION - Good use of h1, strong title */}
//       <header className="max-w-5xl mx-auto px-4 py-8">

//         {/* SEARCH BOX - Key functionality, wrapped in a section for semantic clarity */}
//       <section 
//         className="max-w-3xl mx-auto px-4"
//         aria-label="FondPeace Search Bar" // Added for accessibility
//       >
//         <div className="sticky top-4 bg-white z-30 py-4">
//           {/* SearchGo is the client component, properly isolated */}
//           <SearchGo />
//         </div>
//       </section>
        
//         <h1 className="text-3xl md:text-4xl font-extrabold">
//           FondPeace Search — Discover Trending News, Videos, AI & More
//         </h1>
//         <p className="mt-3 text-gray-700 max-w-3xl">
//           Find trending topics, viral videos, AI tool updates, sports highlights & local stories.
//           Fast, reliable and updated — powered by FondPeace.
//         </p>

//         <div className="mt-3 text-sm text-gray-600">
//           © FondPeace • Updated <time dateTime={today}>{today}</time> • Email:{" "}
//           <a href="mailto:contact@fondpeace.com" className="underline">
//             contact@fondpeace.com
//           </a>
//         </div>
//       </header>

      

//       {/* TRENDING NOW - Good for internal linking and indexation of high-value keywords */}
//       <section className="max-w-5xl mx-auto px-4 mt-6">
//         {/* Use a clear heading for this content block */}
//         <h2 className="text-lg font-semibold">Trending Now</h2>
//         <div className="mt-3 flex flex-wrap gap-2">
//           {TRENDING_TOPICS.map((t, i) => (
//             // Links are essential for SEO, directing link equity
//             <Link
//               key={i}
//               href={`/search?q=${encodeURIComponent(t)}`}
//               className="px-3 py-2 text-sm bg-gray-100 rounded-full hover:bg-black hover:text-white transition"
//               prefetch={false} // May improve performance for less critical links
//             >
//               {t}
//             </Link>
//           ))}
//         </div>
//       </section>

//       {/* CATEGORIES - Excellent for internal linking and topic authority */}
//       <section className="max-w-5xl mx-auto px-4 mt-10">
//         <h3 className="text-xl font-semibold">Popular Categories</h3>
//         <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//           {GLOBAL_CATEGORIES.map((cat, index) => (
//             <Link
//               key={index}
//               href={`/search?q=${encodeURIComponent(cat)}`}
//               className="bg-sky-50 hover:bg-sky-100 p-3 rounded-md"
//               prefetch={false}
//             >
//               <div className="font-medium">{cat}</div>
//               <div className="text-xs text-gray-600">Trending stories</div>
//             </Link>
//           ))}
//         </div>
//       </section>


//       <article className="max-w-5xl mx-auto px-4 prose prose-lg mt-10">
//   <h2 className="!mb-4">About FondPeace Search</h2>

//   <p className="text-gray-700 leading-relaxed">
//     FondPeace Search is built to help people discover information faster —
//     whether it’s breaking news, viral videos, entertainment updates, AI tools,
//     sports highlights or community stories. Our focus is on delivering a clean,
//     simple and reliable search experience that works smoothly across all devices.
//   </p>

//   <p className="text-gray-700 mt-4 leading-relaxed">
//     Instead of overwhelming users with clutter, FondPeace Search organizes topics
//     into easy categories and presents results in a straightforward way. This makes
//     it easier for you to explore what’s trending without distractions or confusion.
//   </p>

//   <h3 className="mt-8">What Makes FondPeace Different?</h3>
//   <ul className="list-disc pl-5 space-y-2">
//     <li>Fast and clean search experience without unnecessary complexity.</li>
//     <li>Fresh updates across news, entertainment, tech and sports.</li>
//     <li>Simple design that focuses on clarity and user comfort.</li>
//     <li>No intrusive ads, no aggressive push — just straightforward results.</li>
//     <li>Privacy-friendly approach with minimum required data usage.</li>
//   </ul>

//   <h3 className="mt-8">Our Commitment</h3>
//   <p className="text-gray-700 leading-relaxed">
//     FondPeace aims to maintain accuracy, clarity and transparency in all search
//     results. When possible, we provide context and source references to ensure
//     readers can verify the information easily.
//   </p>

//   <p className="text-gray-700 mt-4 leading-relaxed">
//     If you ever find incorrect information or need clarification, feel free to
//     reach us at{" "}
//     <a href="mailto:contact@fondpeace.com" className="underline">
//       contact@fondpeace.com
//     </a>.
//   </p>
// </article>


//       {/* FAQ SECTION - Directly maps to the FAQPage schema.org data */}
//       <section className="max-w-5xl mx-auto px-4 mt-12">
//         <h3 className="text-2xl font-semibold mb-4">Frequently Asked Questions (FAQ)</h3>
//         <div className="space-y-3">
//           {FAQS.map((f, i) => (
//             // details/summary is a great native, accessible way to handle FAQs
//             <details key={i} className="bg-gray-50 p-4 rounded-md">
//               <summary className="font-medium">{f.q}</summary>
//               <p className="mt-2 text-gray-700">{f.a}</p>
//             </details>
//           ))}
//         </div>
//       </section>


//       {/* PRIVACY & DATA HANDLING */}
// <section className="max-w-5xl mx-auto px-4 mt-12">
//   <h3 className="text-2xl font-semibold mb-4">Privacy & Data Handling</h3>

//   <p className="text-gray-700 mt-3">
//     FondPeace is designed with user privacy in mind. We do not sell, rent, or misuse
//     any personal data. Only essential technical information is processed to keep the
//     website secure, stable, and fast.
//   </p>

//   <p className="text-gray-700 mt-3">
//     Search terms are only used to show results and improve performance. They are
//     not linked to your identity, and we do not create user profiles or track
//     personal behavior across pages.
//   </p>

//   <p className="text-gray-700 mt-3">
//     We use a small number of necessary cookies for performance, spam-prevention,
//     and error monitoring. These cookies do not identify who you are and are never
//     used for targeted advertising.
//   </p>

//   <p className="text-gray-700 mt-3">
//     Some search results may link to third-party websites. Their privacy policies
//     may differ, and FondPeace does not control their content. We encourage users
//     to review external policies before interacting with them.
//   </p>

//   <p className="text-gray-700 mt-3">
//     Users may request correction or removal of content or ask for data-related
//     clarifications anytime by contacting us at 
//     <a className="underline ml-1" href="mailto:contact@fondpeace.com">
//       contact@fondpeace.com
//     </a>.
//   </p>

//   <p className="text-gray-700 mt-3">
//     Updated: {today}. For full details, visit our{" "}
//     <Link href="/privacy" className="underline">
//       Privacy Policy
//     </Link>.
//   </p>
// </section>

      

//       {/* FOOTER - Essential utility links */}
//       <footer className="max-w-5xl mx-auto px-4 mt-12 mb-12 border-t pt-6 text-sm text-gray-600">
//         <div className="flex flex-col md:flex-row md:justify-between gap-4">
//           <div>© {currentYear} FondPeace</div>
//           <nav className="flex gap-4" aria-label="Footer Navigation">
//             <Link href="/about" className="hover:underline">About</Link>
//             <Link href="/contact" className="hover:underline">Contact</Link>
//             <Link href="/privacy" className="hover:underline">Privacy</Link>
//             <Link href="/terms" className="hover:underline">Terms</Link>
//           </nav>
//         </div>
//       </footer>
//     </main>
//   );
// }




// 'use client';
// import React, { useState } from "react";
// import axios from "axios";

// function App() {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [images, setImages] = useState([]);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get(`https://backend-k.vercel.app/autoai/result?q=${query}`);
//       const SearchResults = response.data.ScrapedData[0];
//       setResults(SearchResults.results || []);
//       setImages(SearchResults.images[3] || []);
//       console.log("Results:", SearchResults.results);
//       console.log("Images:", SearchResults.images);
//     } catch (err) {
//       setError("Error fetching results. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex  items-center justify-center">
//       <div className=" w-full px-2 py-8 bg-white shadow-lg rounded-lg">
//         <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">Search Engine</h1>

//         <form onSubmit={handleSearch} className="flex mb-6">
//           <input
//             type="text"
//             className="p-3 w-full border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//             placeholder="Search..."
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//           />
//           <button
//             type="submit"
//             className="p-3 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 focus:outline-none"
//           >
//             Search
//           </button>
//         </form>

//         {loading && <p className="text-center text-gray-500">Loading...</p>}
//         {error && <p className="text-center text-red-500">{error}</p>}

//         {/* General Images Section */}
//         {images.length > 0 && (
//           <div className="mb-6">
//             <h2 className="text-xl font-semibold text-indigo-700 mb-4">Top Images</h2>
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//               {images.map((img, idx) => (
//                 <img
//                   key={idx}
//                   src={img}
//                   alt={`Image ${idx + 1}`}
//                   className="w-full h-32 object-cover rounded-md"
//                 />
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Results Section */}
//         <div className="space-y-2">
//           {results.length > 0 ? (
//             results.map((result, index) => (
//               <div key={index} className="border-b pb-2">
//                 <h2 className="text-xl font-semibold text-indigo-700">
//                 <a
//                   href={result.link}
//                   className="text-blue-600 hover:text-blue-800 mt-2 block"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   {result.title}
//                 </a>
//                   </h2>
//                 <div className="flex gap-2">
//                 <p className="text-gray-700 mt-2 ">{result.snippet}</p>
//                   <img src={result.thumbnail} className="h-28 w-auto object-cover rounded-md ml-auto md:block hidden" />
//                 </div>
//                 {result.images && result.images.length > 0 && (
//                   <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
//                     {result.images.map((image, idx) => (
//                       <img
//                         key={idx}
//                         src={image}
//                         alt={`Result Image ${idx + 1}`}
//                         className="w-full h-32 object-cover rounded-md"
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))
//           ) : (
//             !loading && <p className="text-center text-gray-500">No results found.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;









// // 'use client';

// // import axios from "axios";
// // import React, { useState, useEffect } from 'react';
// // import Head from 'next/head';

// // function App() {
// //   const [data, setData] = useState([]);
// //   const [query, setQuery] = useState('');
// //   const [search, setSearch] = useState('');
// //   const [explain, setexplain] = useState('');
// //   const [image, setimage]  = useState([]);
// //   const [Youtube, setYoutube] = useState([]);
// //   const [loading, setloading] = useState(false);

// //   const handleChange = (e) => {
// //     setQuery(e.target.value);
// //   };

// //   const handleSearch = () => {
    
// //     setSearch(query);
// //   };

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       if (search) {
// //         setloading(true);
// //         try {
// //           const response = await axios.get(`https://backendk-z915.onrender.com/autoai/search?q=${search}`);
// //           const result = await response.data[0];
// //           const sumarize = await response.data[1];
// //           const images = await response.data[2];
// //           const youtube_detail = await response.data[3]
// //           // setimage(images);
// //           console.log("Images",images);
// //           setimage(images)
// //           console.log(response)
// //           // setexplain(sumarize);
// //           setData(result);
// //           setYoutube(youtube_detail);
// //           console.log( result,sumarize)
// //         } catch (error) {
// //           console.error(error);``
// //         }
// //         finally{
// //           setloading(false);
// //         }
// //       }
// //     };
// //     fetchData();
// //   }, [search]);



// //   //  Function to formate text with headings,lists,paragraph and code blocks 

// //   const FormateText = (text) => {
// //     if (!text) return null;
  
// //     // Replace Markdown-style headings
// //     text = text.replace(/^###\s(.+)/gm, "<h3 class='text-lg'>$1</h3>");
// //     text = text.replace(/^####\s(.+)/gm, "<h4 class='text-md'>$1</h4>");
// //     text = text.replace(/^##\s(.+)/gm, "<h2 class='text-lg'>$1</h2>");
// //     text = text.replace(/^#\s(.+)/gm, "<h1 class='text-xl font-bold'>$1</h1>");
  
// //     // Replace Markdown-style bullet points (- item or * item)
// //     text = text.replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>");
// //     text = text.replace(/^\* (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>");
// //     text = text.replace(/(<li.+<\/li>)/g, "<ul>$1</ul>"); // Wrap list items in <ul>
  
// //     // Replace triple backticks for code blocks
// //     text = text.replace(
// //       /```([\s\S]+?)```/g,
// //       "<pre class='bg-gray-200 text-black text-md mb-2 p-2 rounded-md overflow-x-auto'><code>$1</code></pre>"
// //     );
  
// //     // Replace inline code using backticks (`code`)
// //     text = text.replace(/`([^`]+)`/g, "<code class='bg-gray-200 px-1 py-0.5 rounded'>$1</code>");
  
// //     // Bold and Italic
// //     text = text.replace(/\*\*(.+?)\*\*/g, "<strong class='font-bold'>$1</strong>"); // **bold**
// //     text = text.replace(/\*(.+?)\*/g, "<em class='italic'>$1</em>"); // *italic*
  
// //     // Convert Markdown tables to HTML tables
// //     text = text.replace(
// //       /\|(.+?)\|\n\|[-:\s|]+\|\n((?:\|.+?\|\n?)+)/g,
// //       (match, headers, rows) => {
// //         const headerCells = headers
// //           .split("|")
// //           .map((h) => h.trim())
// //           .filter((h) => h.length > 0)
// //           .map((h) => `<th class='border p-2 bg-gray-200'>${h}</th>`)
// //           .join("");
  
// //         const rowCells = rows
// //           .trim()
// //           .split("\n")
// //           .filter((row) => row.trim().length > 0)
// //           .map((row) => {
// //             const columns = row
// //               .split("|")
// //               .map((col) => col.trim())
// //               .filter((col) => col.length > 0)
// //               .map((col) => `<td class='border p-2'>${col}</td>`)
// //               .join("");
// //             return `<tr>${columns}</tr>`;
// //           })
// //           .join("");
  
// //         return `<table class='border-collapse border border-gray-300 w-full my-4'>
// //                   <thead><tr>${headerCells}</tr></thead>
// //                   <tbody>${rowCells}</tbody>
// //                 </table>`;
// //       }
// //     );
  
// //     // Convert double newlines to paragraphs
// //     text = text.replace(/\n{2,}/g, "</p><p class='mb-4'>");
  
// //     // Wrap everything in <p> tags
// //     return `<p class='mb-4'>${text}</p>`;
// //   };
  
// //   const ExplainText = ({ text }) => {
// //     return text ? (
// //       <div
// //         className="border-blue-500 bg-white font-normal text-black w-full"
// //         dangerouslySetInnerHTML={{ __html: FormateText(text) }}
// //       />
// //     ) : null;
// //   };

// // if(loading){
// //   return ( <div className ="text-4xl font-bold inline-block align-middle">Loading Data...</div> );
// // }
// //   return (
// //     <div className="m-1 mb-10"> 

// //    <Head>
// //         <title>Fond Peace AI Social Media Platform</title>
// //         <meta name="description" content="Unlock the limitless potential of AI with Fond Peace AI. Experience cutting-edge AI-powered search, automation, content generation, and assistance tools—all for free. This is a platform where you can search anything like Google, Bing, and the web." />
// //         <meta name="keywords" content="Fond Peace AI, free AI tools, AI search engine, AI assistant, AI automation, AI content generator, AI-powered search, AI chatbot, AI-driven solutions, AI-powered research, AI discovery, AI-powered learning, AI innovation, AI productivity, AI-powered applications, AI-powered insights, AI-powered recommendations, AI for everyone, next-gen AI, best free AI tools, AI-powered knowledge base, AI-driven search engine, AI-powered decision-making, AI-powered problem-solving, AI assistant for work and study, AI-powered writing tools, AI-powered creative solutions, chatgpt, openai, Claude AI, Grok AI, Elon Musk AI, search engine alternatives, written updates, Telly updates, Anupama, YRKKH, Bhagya Lakshmi, Dhruv Rathee, MacRumors, 9to5Mac, Apple Insider, Apple rumors, iPhone news, AI SEO optimization, 2025 Google SEO, AI-powered blogging, real-time AI answers, best AI tools 2025, AI automation for business, SEO AI tools, AI-driven marketing, Google core update 2025, AI-enhanced productivity, AI-generated content, machine learning trends 2025, AI-powered analytics, AI for digital marketing, AI SEO ranking strategies, how to rank on Google with AI, best AI-powered research tools" />
// //         <meta name="robots" content="index, follow" />
// //         <meta name="author" content="Fond Peace AI Team" />
// //         <meta name="theme-color" content="#000000" />
// //         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
// //         <link rel="canonical" href="https://www.fondpeace.com/" />
        



// //         {/* Open Graph Meta Tags */}
// //         <meta property="og:type" content="website" />
// //         <meta property="og:title" content="Fond Peace AI - Your Ultimate Free AI Assistant for Everything" />
// //         <meta property="og:description" content="Experience the future of AI today! Search, create, and automate effortlessly with Fond Peace AI. Free AI-powered solutions for search, writing, automation, and more!" />
// //         <meta property="og:url" content="https://www.fondpeace.com/" />
// //         <meta property="og:image" content="https://www.fondpeace.com/og-image.jpg" />
// //         <meta property="og:image:width" content="1200" />
// //         <meta property="og:image:height" content="630" />
// //         <meta property="og:site_name" content="Fond Peace AI" />
// //         <meta property="og:locale" content="en_US" />

// //         {/* Twitter Meta Tags */}
// //         <meta name="twitter:card" content="summary_large_image" />
// //         <meta name="twitter:title" content="Fond Peace AI - Explore Advanced AI Tools for Free" />
// //         <meta name="twitter:description" content="Experience the future of AI today! Search, create, and automate effortlessly with Fond Peace AI. Free AI-powered solutions for search, writing, automation, and more!" />
// //         <meta name="twitter:image" content="https://www.fondpeace.com/twitter-image.jpg" />
// //         <meta name="twitter:site" content="@FondPeaceAI" />
// //         <meta name="twitter:creator" content="@FondPeaceAI" />

// //         {/* Schema.org JSON-LD */}
// //         <script
// //           type="application/ld+json"
// //           dangerouslySetInnerHTML={{
// //             __html: JSON.stringify({
// //               "@context": "https://schema.org",
// //               "@type": "SoftwareApplication",
// //               name: "Fond Peace AI",
// //               operatingSystem: "Web",
// //               applicationCategory: "Artificial Intelligence",
// //               offers: {
// //                 "@type": "Offer",
// //                 price: "0",
// //               },
// //               aggregateRating: {
// //                 "@type": "AggregateRating",
// //                 ratingValue: "4.9",
// //                 ratingCount: "2500",
// //               },
// //               publisher: {
// //                 "@type": "Organization",
// //                 name: "Fond Peace AI",
// //                 url: "https://www.fondpeace.com/",
// //                 logo: {
// //                   "@type": "ImageObject",
// //                   url: "https://www.fondpeace.com/logo.png",
// //                   width: 300,
// //                   height: 300,
// //                 },
// //               },
// //             }),
// //           }}
// //         />

        
// //       </Head>
   
// //     <div className="m-4">
// //       <h2 className="text-2xl font-bold text-center">Search Only Not Open</h2>
// //     </div>
// //     <div className="m-10 p-5 border-2 rounded-md">
// //       <input type="text" value={query} onChange={handleChange} className="border-2 rounded-md w-full p-2 text-lg"/>
// //       <button onClick={handleSearch} className="cursor-pointer w-full text-xl font-bold border-2 rounded-md mt-4 p-2 bg-blue-400 text-white">Search</button>
// //       </div>
// // {/*       {explain ? (
// //       <div className=" border-2 rounded-md border-black md:p-6 p-2  ">
// //             <ExplainText text={explain}/> 
// //       </div>) : ( <div></div>)
      
// //       } */}

// //        <div className="">
// //         {Youtube.map((index) =>(
// //           <div key={index.id} className="border-2 rounded-md w-full mt-2 p-2">
// //             <img src={index.thumbnail} alt="" className="w-full py-2" />
// //           </div>
// //         ))}
// //       </div> 

// //       <div className="grid grid-cols-4 gap-4 items-center">
// //         {image?.length > 0 ? (
// //           image.map((photo, index) => (
// //             <div key={index} className="border-2 rounded-md w-60 h-40 flex justify-center items-center mt-2 p-2">
// //               <img src={photo} alt="img" className="w-full h-full object-cover rounded-md " />
// //             </div>
// //           ))
// //         ) : (
// //           <p className="col-span-4 text-center">No images found</p>
// //         )}
// //       </div>


      
// //         {/* <div className="videos">
// //         {Youtube.map((video) => (
// //           <div key={video.id} className="video-card">
// //             <a href={video.url} target="_blank" rel="noopener noreferrer">
// //               <img src={video.thumbnail} alt={video.title} className="thumbnail" />
// //             </a>
// //             <h3>{video.title}</h3>
// //             <p>Channel: {video.channel}</p>
// //             <p>Views: {video.views}</p>
// //             <p>Likes: {video.likes}</p>
// //           </div>
// //         ))}
// //         </div> */}


// //       <ul >
// //         {data.map((item, index) => (
// //           <li key={index} className="mt-4 border-2 rounded-md p-1">
// //             <h2 className="text-lg text-blue-600 "><a href={item.url} target="_blank">{item.title}</a></h2>
// //             <p>{item.snippet}</p>
// //             <a href={item.url} target="_blank" className="text-blue-500 font-bold">Read more</a>
// //           </li>
// //         ))}
// //       </ul>
// //     </div>
// //   );
// // }

// // export default App;
