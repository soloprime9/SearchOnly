// app/IntroList/[slug]/page.js
import ProductPageView from "@/Introcomponents/SingleProductDetail";

export default async function Page({ params }) {
  const { slug } = params;
  console.log("Hello : ", slug);

  try {
    const res = await fetch(`https://gas-back.vercel.app/hello/${slug}`, {
      cache: "no-store",
    });

    // Check if response is OK
    if (!res.ok) {
      return (
        <div className="p-10 text-center text-red-600">
          Failed to fetch product. Status: {res.status}
        </div>
      );
    }

    // Try parsing JSON
    let data;
    try {
      data = await res.json();
    } catch (err) {
      console.error("JSON parse error:", err);
      return (
        <div className="p-10 text-center text-red-600">
          Invalid JSON response from server
        </div>
      );
    }

    return <ProductPageView data={data} />;
  } catch (error) {
    console.error("Fetch error:", error);
    return (
      <div className="p-10 text-center text-red-600">
        Error fetching product data
      </div>
    );
  }
}
