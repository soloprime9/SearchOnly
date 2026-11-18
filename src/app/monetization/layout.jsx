export const metadata = {
  title: "Creator Monetization — Earn 60% Ad Revenue & 95% Tips",
  description:
    "Monetize your short videos, reels, and community posts on FondPeace from Day 1. Keep 95% of direct tips and 60% creator ad revenue share with zero shadowbans.",
  alternates: {
    canonical: "https://www.fondpeace.com/monetization",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Creator Monetization — Earn 60% Ad Revenue & 95% Tips",
    description:
      "Monetize your short videos and community discussions on FondPeace from Day 1.",
    url: "https://www.fondpeace.com/monetization",
    siteName: "FondPeace",
    type: "website",
    images: [
      {
        url: "https://www.fondpeace.com/FondPeace-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace Creator Monetization",
      },
    ],
  },
};

export default function MonetizationLayout({ children }) {
  return children;
}
