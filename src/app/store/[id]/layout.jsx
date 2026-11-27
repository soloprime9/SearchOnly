import { notFound } from "next/navigation";
import { STORE_PRODUCTS } from "@/data/storeProducts";

const SITE_ROOT = "https://www.fondpeace.com";

function toAbsolute(url) {
  if (!url) return `${SITE_ROOT}/FondPeace-1200x630.jpg`;
  if (url.startsWith("http")) return url;
  return `${SITE_ROOT}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.id || "";
  const product = STORE_PRODUCTS.find((p) => p.id === slug || p.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: true },
    };
  }

  const pageUrl = `${SITE_ROOT}/store/${product.slug || product.id}`;
  const cleanTitle = (product.title || "Digital Tool").replace(/^[^\p{L}\p{N}]+/u, "").trim();
  const imageUrl = toAbsolute(product.image);

  return {
    title: cleanTitle,
    description: product.subtitle || product.description || `Instant digital access to ${cleanTitle} on FondPeace Store.`,
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: cleanTitle,
      description: product.subtitle || product.description,
      url: pageUrl,
      siteName: "FondPeace Store",
      type: "website",
      images: [
        {
          url: imageUrl,
          alt: cleanTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: product.subtitle || product.description,
      images: [imageUrl],
    },
  };
}

export default async function StoreProductLayout({ children, params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.id || "";
  const product = STORE_PRODUCTS.find((p) => p.id === slug || p.slug === slug);

  if (!product) {
    notFound();
  }

  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: (product.title || "").replace(/^[^\p{L}\p{N}]+/u, "").trim(),
        description: product.subtitle || product.description,
        image: toAbsolute(product.image),
        url: `${SITE_ROOT}/store/${product.slug || product.id}`,
        brand: {
          "@type": "Brand",
          name: "FondPeace",
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: String(product.priceUSD || 9),
          availability: "https://schema.org/InStock",
          url: `${SITE_ROOT}/store/${product.slug || product.id}`,
        },
      }
    : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {children}
    </>
  );
}
