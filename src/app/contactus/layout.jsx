export const metadata = {
  title: "Contact Us — Support, Partnerships & Inquiries",
  description:
    "Contact the FondPeace team for creator support, copyright or DMCA notices, privacy data requests, bug reports, and brand collaboration inquiries.",
  alternates: {
    canonical: "https://www.fondpeace.com/contactus",
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
    title: "Contact Us | FondPeace",
    description:
      "Reach out to the FondPeace team for community support, creator partnerships, privacy inquiries, or feedback.",
    url: "https://www.fondpeace.com/contactus",
    siteName: "FondPeace",
    type: "website",
    images: [
      {
        url: "https://www.fondpeace.com/FondPeace-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "Contact FondPeace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | FondPeace",
    description:
      "Get in touch with FondPeace for creator support, feedback, legal inquiries, and collaborations.",
    images: ["https://www.fondpeace.com/FondPeace-1200x630.jpg"],
  },
};

export default function ContactLayout({ children }) {
  const contactSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": "https://www.fondpeace.com/contactus#webpage",
        url: "https://www.fondpeace.com/contactus",
        name: "Contact FondPeace",
        description:
          "Official support, partnership, privacy, and DMCA inquiry page for FondPeace.",
        isPartOf: { "@id": "https://www.fondpeace.com/#website" },
        mainEntity: { "@id": "https://www.fondpeace.com/#organization" },
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
            name: "Contact Us",
            item: "https://www.fondpeace.com/contactus",
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      {children}
    </>
  );
}
