// app/shorts/[id]/page.jsx
import { notFound, permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  return {
    title: "FondPeace Shorts",
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `https://www.fondpeace.com/short/${id || ""}`,
    },
  };
}

export default async function ShortsRedirectPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return notFound();

  // Canonical redirect to official singular /short/[id] watch page
  permanentRedirect(`/short/${id}`);
}
