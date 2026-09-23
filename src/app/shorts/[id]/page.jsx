import { permanentRedirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  return {
    title: "Redirecting... | FondPeace",
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `https://www.fondpeace.com/short/${id || ""}`,
    },
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return notFound();
  
  // Permanent 308 redirect to canonical single watch page
  permanentRedirect(`/short/${id}`);
}
