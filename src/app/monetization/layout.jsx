export const metadata = {
  title: "Creator Program & Monetization Overview",
  description:
    "Explore the FondPeace Creator Program — learn how creators grow their audience, track post engagement, qualify for brand collaborations, and adhere to originality standards.",
  alternates: {
    canonical: "https://www.fondpeace.com/monetization",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Creator Program & Monetization Overview | FondPeace",
    description:
      "Learn about creator growth tools, eligibility guidelines, and transparent partnership opportunities on FondPeace.",
    url: "https://www.fondpeace.com/monetization",
    siteName: "FondPeace",
    type: "website",
    images: [
      {
        url: "https://www.fondpeace.com/FondPeace-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace Creator Program",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator Program & Monetization Overview | FondPeace",
    description:
      "Creator growth tools, audience analytics, and transparent partnership guidelines on FondPeace.",
    images: ["https://www.fondpeace.com/FondPeace-1200x630.jpg"],
  },
};

export default function MonetizationLayout({ children }) {
  const monetizationSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.fondpeace.com/monetization#webpage",
        url: "https://www.fondpeace.com/monetization",
        name: "Creator Program & Monetization Overview | FondPeace",
        description:
          "Overview of FondPeace creator tools, audience growth, partner eligibility requirements, and content compliance standards.",
        isPartOf: { "@id": "https://www.fondpeace.com/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.fondpeace.com/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Creator Program",
            item: "https://www.fondpeace.com/monetization",
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(monetizationSchema) }}
      />
      {children}
    </>
  );
}
