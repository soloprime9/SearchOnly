import { notFound } from "next/navigation";

const API_SINGLE = "https://backend-k.vercel.app/post/single/";
const SITE_ROOT = "https://www.fondpeace.com";

export const dynamic = "force-dynamic";

/* ----------------- helpers ----------------- */
function toAbsolute(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${SITE_ROOT}${url}`;
  return `${SITE_ROOT}/${url}`;
}

/* ----------------- SEO METADATA ----------------- */
export async function generateMetadata({ params }) {
  const id = params?.id;
  if (!id) return {};

  const watchUrl = `${SITE_ROOT}/short/${id}`;

  return {
    title: "Video Embed | FondPeace",

    // 🔒 CRITICAL: embed pages must NOT compete in search
    robots: {
      index: false,
      follow: true,
    },

    // 🔗 tell Google: main authority is watch page
    alternates: {
      canonical: watchUrl,
    },
  };
}

/* ----------------- PAGE ----------------- */
export default async function EmbedPage({ params }) {
  const id = params?.id;
  if (!id) return notFound();

  const res = await fetch(`${API_SINGLE}${id}`, { cache: "no-store" });
  if (!res.ok) return notFound();

  const { post } = await res.json();
  if (!post) return notFound();

  const mediaUrl = toAbsolute(post.media || post.mediaUrl);
  if (!mediaUrl) return notFound();

  const embedUrl = `${SITE_ROOT}/embed/short/${id}`;
  const watchUrl = `${SITE_ROOT}/short/${id}`;

  return (
    <main className="w-full h-screen bg-black flex items-center justify-center">

      {/* ✅ MINIMAL LINKING SCHEMA (SAFE) */}
      {/* This does NOT create a second VideoObject */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": embedUrl,
            "name": "Video Embed",
            "isPartOf": {
              "@type": "VideoObject",
              "@id": `${watchUrl}#video`
            }
          }),
        }}
      />

      {/* ✅ PURE EMBED PLAYER */}
      <video
        src={mediaUrl}
        controls
        playsInline
        preload="metadata"
        muted
        className="max-w-full max-h-full"
      />
    </main>
  );
}
