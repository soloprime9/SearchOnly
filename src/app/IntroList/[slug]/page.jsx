// app/IntroList/[slug]/page.js
import ProductPageView from "@/Introcomponents/SingleProductDetail";
import Footer from "@/Introcomponents/Footer";
import Link from "next/link";
// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const slug = params.slug;

  const res = await fetch(
    `https://list-back-nine.vercel.app/hello/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return {
      title: "Product not found – IntroList",
    };
  }

  const { product } = await res.json();

  return {
    title: `${product.title} – IntroList`,
    description: product.longDescription?.slice(0,160),
    keywords: product.tags?.map(t => t.name).join(", "),
    alternates: {
      canonical: `https://www.fondpeace.com/IntroList/${slug}`,
    },

    openGraph: {
      title: product.title,
      description: product.longDescription,
      url: `https://www.fondpeace.com/IntroList/${slug}`,
      siteName: "IntroList",
      type: "article",
      images: [
        {
          url: product.thumbnail,
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      site: "@introList",
      creator: "@introList",
      title: product.title,
      description: product.longDescription,
      images: [product.thumbnail],
    },
  };
}

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
       <header className="w-full top-0 left-0 pb-2 z-50 bg-white shadow-md">
  <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 flex items-center justify-between h-6">
    
    <h1 className="font-extrabold px-2 text-blue-600 text-lg sm:text-xl md:text-2xl">
      <Link href="/IntroList" className="hover:text-blue-700 transition-colors duration-300">
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
