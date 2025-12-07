import ProductPageView from "@/Introcomponents/SingleProductDetail";

export default async function Page({ params }) {
  const { slug } = params;
  console.log("Hello : ", slug);

  const res = await fetch(
    `https://gas-back.vercel.app/product/hello/${slug}`,
    { cache: "no-store" }
  );

  const data = await res.json();

  return <ProductPageView data={data} />;
}
