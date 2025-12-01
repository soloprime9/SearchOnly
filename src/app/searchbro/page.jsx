// ✅ SERVER COMPONENT (do NOT add "use client")
import SearchFull from "@/components/SearchBox";

// ===========================
//     FULL GOOGLE SEO METADATA
// ===========================
export const metadata = {
  title: "FondPeace Search — Explore News, sofik sonali 2nd video, desihub,xhamster, Images & Video Stories",
   description:
    "Sofik SK is a Bengali content creator with over half a million followers on social media. He often makes videos featuring his partner and fellow content creator, Dustu Sonali. The Palli Gram TV creator has nearly 45 videos on Instagram, most of which show him dancing and lip-syncing to songs.",
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

  alternates: {
    canonical: "https://www.fondpeace.com/searchbro",
  },

  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },

  openGraph: {
    title: "FondPeace Search — Find News, sofik sonali 2nd video, desihub,xhamster, Images & Videos Instantly",
    description:
      "Use FondPeace Search to explore trending news, images, short videos, entertainment and AI updates — fast & accurate.",
    url: "https://www.fondpeace.com/searchbro",
    siteName: "FondPeace",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://www.fondpeace.com/Fondpeace.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace Search Page",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "FondPeace Search — Explore Trending News & Videos",
    description:
      "Discover trending topics, news, images, short videos and global stories — instantly on FondPeace.",
    images: ["https://www.fondpeace.com/Fondpeace.jpg"],
  },
};

// ===========================
//     JSON-LD SCHEMAS (SEO)
// ===========================
function JsonLD() {
  const now = new Date().toISOString();

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FondPeace",
    url: "https://www.fondpeace.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.fondpeace.com/searchbro?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FondPeace",
    url: "https://www.fondpeace.com",
    logo: "https://www.fondpeace.com/Fondpeace.jpg",
    sameAs: [
      "https://www.facebook.com/FondPeace",
      "https://www.instagram.com/FondPeace",
      "https://twitter.com/FondPeace",
      "https://www.youtube.com/@FondPeace",
    ],
  };

  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "FondPeace Search",
    url: "https://www.fondpeace.com/searchbro",
    description:
      "Search trending news, images, short videos, AI tools, entertainment, sports and global stories — instantly on FondPeace Search.",
    inLanguage: "en",
    datePublished: "2024-01-01T00:00:00+00:00",
    dateModified: now,
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is FondPeace Search?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FondPeace Search helps you find trending news, images, short videos, entertainment, sports, and global stories — instantly.",
        },
      },
      {
        "@type": "Question",
        name: "Who are Sofik and Sonali?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sofik SK is a Bengali content creator with over half a million followers on social media. He often makes videos featuring his partner and fellow content creator, Dustu Sonali. The Palli Gram TV creator has nearly 45 videos on Instagram, most of which show him dancing and lip-syncing to songs. Watch. Sofik SK is a Bengali content creator with over half a million followers on social media. He often makes videos featuring his partner and fellow content creator, Dustu Sonali. The Palli Gram TV creator has nearly 45 videos on Instagram, most of which show him dancing and lip-syncing to songs. ",
        },
      },
      {
        "@type": "Question",
        name: "Is FondPeace free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, FondPeace Search is completely free to use.",
        },
      },
      {
        "@type": "Question",
        name: "Are Leaked or Viral Videos available on FondPeace?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, FondPeace Search is completely free to use and also you can find any Trending or Leaked Videos or News here",
        },
      },
      {
        "@type": "Question",
        name: "What can I search on FondPeace?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can search for news, images, short videos, entertainment, AI updates, sports highlights and much more.",
        },
      },
    ],
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.fondpeace.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Search",
        item: "https://www.fondpeace.com/searchbro",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(page) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}

// ===========================
//       FINAL PAGE
// ===========================
export default function SearchPage() {
  return (
    <div className="pt-24 p-4 max-w-4xl mx-auto">
      <JsonLD />
      <SearchFull />
    </div>
  );
}
