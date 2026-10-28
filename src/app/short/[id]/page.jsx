// app/short/[id]/page.jsx
import { permanentRedirect, notFound } from "next/navigation";

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
      canonical: `https://www.fondpeace.com/shorts/${id || ""}`,
    },
  };
}

export default async function ShortRedirectPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return notFound();

  // Canonical 308 redirect from legacy singular /short/[id] to official /shorts/[id] feed
  permanentRedirect(`/shorts/${id}`);
}
