// No 'use client' here!
import YoutubeThumbnailTester from '@/components/YoutubeThumbnailTester';

export const metadata = {
  title: "YouTube Thumbnail Tester - Preview & Analyze Thumbnails Online",
  description:
    "Test and optimize YouTube thumbnails for maximum CTR. Preview on multiple devices, analyze readability, and compare versions instantly. Free online tool for creators.",
  keywords:
    "youtube thumbnail tester, thumbnail preview, youtube seo, preview thumbnail youtube, etc...",
  openGraph: {
    title: "Free YouTube Thumbnail Tester Tool",
    description:
      "Get real-time previews of your YouTube thumbnails on desktop, mobile and TV screens. Improve click-through rates with professional analysis.",
    url: "https://fondpeace.com/youtubethumbnailtester",
    images: [
      {
        url: "https://fondpeace.com/youtubethumbnailtester/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Optimize YouTube Thumbnails Online",
    description:
      "Get real-time previews of your YouTube thumbnails on desktop, mobile and TV screens.",
    images: ["https://fondpeace.com/youtubethumbnailtester/twitter-image.jpg"],
    site: "@your_twitter_handle",
  },
  alternates: {
    canonical: "https://fondpeace.com/youtubethumbnailtester",
  },
};

export default function Page() {
  return <YoutubeThumbnailTester />;
}
