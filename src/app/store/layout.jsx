export const metadata = {
  title: "AI Developer & Creator Tools Store",
  description:
    "Explore FondPeace digital creator tools, AI video animation studios, autonomous business playbooks, and developer prompt vaults with instant download.",
  alternates: {
    canonical: "https://www.fondpeace.com/store",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "FondPeace Digital Store — AI Developer & Creator Tools",
    description:
      "Production-ready AI tools, creator workflows, and developer systems built by FondPeace.",
    url: "https://www.fondpeace.com/store",
    siteName: "FondPeace",
    type: "website",
    images: [
      {
        url: "https://www.fondpeace.com/FondPeace-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace Store",
      },
    ],
  },
};

export default function StoreLayout({ children }) {
  return children;
}
