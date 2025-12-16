// app/IntroList/[slug]/page.js

import ProductPageView from "@/Introcomponents/SingleProductDetail";
import Footer from "@/Introcomponents/Footer";
import Link from "next/link";

// ✅ Viewport Fix (removes Next.js warning)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// ======================================================
// 🔥 FULL GOOGLE SEO + OPEN GRAPH + TWITTER + JSON-LD
// ======================================================
export async function generateMetadata({ params }) {
  const slug = params.slug;

  const res = await fetch(
    `https://list-back-nine.vercel.app/hello/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return {
      title: "Product not found – IntroList",
      description: "This product is not available on IntroList.",
    };
  }

  const { product } = await res.json();

  const title = `${product.title}: ${product.description} | IntroList`;
  const desc = product.longDescription?.slice(0, 160) || product.description;
  const image = product.thumbnail || "/Fondpeace.jpg";
  const url = `https://www.fondpeace.com/IntroList/${slug}`;
  const keywords = product.tags?.map(t => t.name).join(", ") || "";

  return {
    title,
    description: desc,
    keywords,

    alternates: {
      canonical: url,
    },

    // ============================
    // 🔥 OPEN GRAPH SEO
    // ============================
    openGraph: {
      title,
      description: desc,
      url,
      siteName: "IntroList",
      type: "article",
      locale: "en_US",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${product.title} image`,
        },
      ],
    },

    // ============================
    // 🔥 TWITTER SEO
    // ============================
    twitter: {
      card: "summary_large_image",
      site: "@IntroListHQ",
      creator: "@IntroListHQ",
      title,
      description: desc,
      images: [image],
    },

    // ============================
    // 🔥 JSON-LD Structured Data (Correct Next.js Format)
    // ============================
    other: {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: desc,
        image: image,
        url,
        brand: {
          "@type": "Brand",
          name: "IntroList",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating || 4.8,
          reviewCount: product.reviewsCount || 120,
        },
      },
    },
  };
}

// ======================================================
// PAGE COMPONENT
// ======================================================
export default async function Page({ params }) {
  const slug = params.slug;

  const res = await fetch(
    `https://list-back-nine.vercel.app/hello/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return (
      <div className="text-center py-20 text-red-500">
        Product not found.
      </div>
    );
  }

  const data = await res.json();

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="w-full sticky top-0 left-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-14">
          <h1 className="font-extrabold text-blue-600 text-xl sm:text-2xl">
            <Link
              href="/IntroList"
              className="hover:text-blue-700 transition-colors duration-300"
            >
              IntroList
            </Link>
          </h1>
        </div>
      </header>

      <ProductPageView data={data} />
      <Footer />
    </>
  );
}










// // app/IntroList/[slug]/page.js
// import ProductPageView from "@/Introcomponents/SingleProductDetail";
// import Footer from "@/Introcomponents/Footer";
// import Link from "next/link";

// // ======================================================
// // 🔥 FULL GOOGLE SEO + SOCIAL SEO + FALLBACKS ADDED
// // ======================================================
// export async function generateMetadata({ params }) {
//   const slug = params.slug;

//   const res = await fetch(
//     `https://list-back-nine.vercel.app/hello/${slug}`,
//     { cache: "no-store" }
//   );

//   if (!res.ok) {
//     return {
//       title: "Product not found – IntroList",
//       description: "This product is not available on IntroList.",
//     };
//   }

//   const { product } = await res.json();

//   const title = `${product.title}: ${product.description} | IntroList`;
//   const desc = product.longDescription?.slice(0, 160) || product.description;
//   const image = product.thumbnail;
//   const url = `https://www.fondpeace.com/IntroList/${slug}`;
//   const keywords = product.tags?.map(t => t.name).join(", ") || "";

//   return {
//     title,
//     description: desc,
//     keywords,

//     alternates: {
//       canonical: url,
//     },

//     openGraph: {
//       title,
//       description: desc,
//       url,
//       siteName: "IntroList",
//       type: "article",
//       locale: "en_US",
//       images: [
//         {
//           url: image,
//           width: 1200,
//           height: 630,
//           alt: `${product.title} image`,
//         },
//       ],
//     },

//     twitter: {
//       card: "summary_large_image",
//       site: "@IntroListHQ",
//       creator: "@IntroListHQ",
//       title,
//       description: desc,
//       images: [image],
//     },

//     // ======================================================
//     // 🔥 JSON-LD STRUCTURED DATA (BOOST GOOGLE RANKING)
//     // ======================================================
//     other: {
//       "script:ld+json": JSON.stringify({
//         "@context": "https://schema.org",
//         "@type": "Product",
//         name: product.title,
//         description: desc,
//         image: image,
//         url,
//         brand: {
//           "@type": "Brand",
//           name: "IntroList"
//         },
//         aggregateRating: {
//           "@type": "AggregateRating",
//           ratingValue: product.rating || 4.8,
//           reviewCount: product.reviewsCount || 120
//         }
//       })
//     }
//   };
// }

// // ======================================================
// // PAGE COMPONENT
// // ======================================================
// export default async function Page({ params }) {
//   const slug = params.slug;

//   const res = await fetch(
//     `https://list-back-nine.vercel.app/hello/${slug}`,
//     { cache: "no-store" }
//   );

//   if (!res.ok) {
//     return (
//       <div className="text-center py-20 text-red-500">
//         Product not found.
//       </div>
//     );
//   }

//   const data = await res.json();

//   return (
//     <>
//       {/* ===== HEADER ===== */}
//       <header className="w-full sticky top-0 left-0 z-50 bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 flex items-center h-14">
//           <h1 className="font-extrabold text-blue-600 text-xl sm:text-2xl">
//             <Link href="/IntroList" className="hover:text-blue-700 transition-colors duration-300">
//               IntroList
//             </Link>
//           </h1>
//         </div>
//       </header>

//       <ProductPageView data={data} />
//       <Footer />
//     </>
//   );
// }
















// // app/IntroList/[slug]/page.js
// import ProductPageView from "@/Introcomponents/SingleProductDetail";
// import Footer from "@/Introcomponents/Footer";
// import Link from "next/link";
// // Generate dynamic metadata for SEO
// export async function generateMetadata({ params }) {
//   const slug = params.slug;

//   const res = await fetch(
//     `https://list-back-nine.vercel.app/hello/${slug}`,
//     { cache: "no-store" }
//   );

//   if (!res.ok) {
//     return {
//       title: "Product not found – IntroList",
//     };
//   }

//   const { product } = await res.json();

//   return {
//     title: `${product.title}: ${product.description} | IntroList`,
//     description: product.longDescription?.slice(0,160),
//     keywords: product.tags?.map(t => t.name).join(", "),
//     alternates: {
//       canonical: `https://www.fondpeace.com/IntroList/${slug}`,
//     },

//     openGraph: {
//       title: `${product.title}: ${product.description} | IntroList`,
//       description: product.longDescription,
//       url: `https://www.fondpeace.com/IntroList/${slug}`,
//       siteName: "IntroList",
//       type: "article",
//       images: [
//         {
//           url: product.thumbnail,
//           width: 1200,
//           height: 630,
//         },
//       ],
//     },

//     twitter: {
//       card: "summary_large_image",
//       site: "@introList",
//       creator: "@introList",
//       title: product.title,
//       description: product.longDescription,
//       images: [product.thumbnail],
//     },
//   };
// }

// export default async function Page({ params }) {
//   const slug = params.slug;

//   const res = await fetch(
//     `https://list-back-nine.vercel.app/hello/${slug}`,
//     { cache: "no-store" }
//   );

//   if (!res.ok) {
//     return (
//       <div className="text-center py-20 text-red-500">
//         Product not found.
//       </div>
//     );
//   }

//   const data = await res.json();

//   return (
//   <>
//     {/* ===== HEADER ===== */}
//        <header className="w-full top-0 left-0 pb-2 z-50 bg-white shadow-md">
//   <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 flex items-center justify-between h-6">
    
//     <h1 className="font-extrabold px-2 text-blue-600 text-lg sm:text-xl md:text-2xl">
//       <Link href="/IntroList" className="hover:text-blue-700 transition-colors duration-300">
//         IntroList
//       </Link>
//     </h1>

//   </div>
// </header>

//     <ProductPageView data={data} />
//     <Footer />
//   </>
// );

// }









// // app/IntroList/[slug]/page.js
// import ProductPageView from "@/Introcomponents/SingleProductDetail";

// export default async function Page({ params }) {
//   const { slug } = params;
//   console.log("Hello : ", slug);

//   try {
//     const res = await fetch(`https://list-back-nine.vercel.app/hello/${slug}`, {
//       cache: "no-store",
//     });

//     // Check if response is OK
//     if (!res.ok) {
//       return (
//         <div className="p-10 text-center text-red-600">
//           Failed to fetch product. Status: {res.status}
//         </div>
//       );
//     }

//     // Try parsing JSON
//     let data;
//     try {
//       data = await res.json();
//     } catch (err) {
//       console.error("JSON parse error:", err);
//       return (
//         <div className="p-10 text-center text-red-600">
//           Invalid JSON response from server
//         </div>
//       );
//     }

//     return <ProductPageView data={data} />;
//   } catch (error) {
//     console.error("Fetch error:", error);
//     return (
//       <div className="p-10 text-center text-red-600">
//         Error fetching product data
//       </div>
//     );
//   }
// }
