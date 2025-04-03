import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Fond Peace AI - Free AI-Powered Search & Do Anything for Free",
  description:
    "Unlock the limitless potential of AI with Fond Peace AI. Experience cutting-edge AI-powered search, automation, content generation, and assistance tools—all for free. This is a platform where you can search anything like Google, Bing, and the web.",
  keywords: [
    "Fond Peace AI", "free AI tools", "AI search engine", "AI assistant", "AI automation",
    "AI content generator", "AI-powered search", "AI chatbot", "AI-driven solutions", 
    "AI-powered research", "AI discovery", "AI-powered learning", "AI innovation", 
    "AI productivity", "AI-powered applications", "AI-powered insights", "AI-powered recommendations",
    "AI for everyone", "next-gen AI", "best free AI tools", "AI-powered knowledge base", 
    "AI-driven search engine", "AI-powered decision-making", "AI-powered problem-solving", 
    "AI assistant for work and study", "AI-powered writing tools", "AI-powered creative solutions",
    "chatgpt", "openai", "Claude AI", "Grok AI", "Elon Musk AI", "search engine alternatives",
    "written updates", "Telly updates", "Anupama", "YRKKH", "Bhagya Lakshmi", "Dhruv Rathee",
    "MacRumors", "9to5Mac", "Apple Insider", "Apple rumors", "iPhone news", "AI SEO optimization",
    "2025 Google SEO", "AI-powered blogging", "real-time AI answers", "best AI tools 2025",
    "AI automation for business", "SEO AI tools", "AI-driven marketing", "Google core update 2025",
    "AI-enhanced productivity", "AI-generated content", "machine learning trends 2025",
    "AI-powered analytics", "AI for digital marketing", "AI SEO ranking strategies",
    "how to rank on Google with AI", "best AI-powered research tools"
  ],
  openGraph: {
    title: "Fond Peace AI - Your Ultimate Free AI Assistant for Everything",
    description:
      "Experience the future of AI today! Search, create, and automate effortlessly with Fond Peace AI. Free AI-powered solutions for search, writing, automation, and more!",
    images: [
      {
        url: "https://www.fondpeace.com/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fond Peace AI - Explore Advanced AI Tools for Free",
    images: ["https://www.fondpeace.com/twitter-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://www.fondpeace.com/" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Fond Peace AI Team" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.fondpeace.com/" />
        <meta property="og:site_name" content="Fond Peace AI" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:site" content="@FondPeaceAI" />
        <meta name="twitter:creator" content="@FondPeaceAI" />
        <meta name="keywords" content="AI-powered solutions, AI search engine, SEO AI tools, AI automation" />
        <meta name="description" content="Explore the best AI-powered tools for research, writing, automation, and more! Stay ahead with AI-driven solutions for 2025." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Fond Peace AI",
            operatingSystem: "Web",
            applicationCategory: "Artificial Intelligence",
            offers: {
              "@type": "Offer",
              price: "0",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "2500",
            },
            publisher: {
              "@type": "Organization",
              name: "Fond Peace AI",
              url: "https://www.fondpeace.com/",
              logo: {
                "@type": "ImageObject",
                url: "https://www.fondpeace.com/logo.png",
                width: 300,
                height: 300
              }
            }
          }),
        }} />
      </head>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
