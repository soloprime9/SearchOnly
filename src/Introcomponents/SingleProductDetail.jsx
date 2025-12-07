import Link from "next/link";
import { FaCalendar, FaMapMarkerAlt, FaTags } from "react-icons/fa";

export default function ProductPageView({ data }) {

  if (!data?.ok) return (
    <div className="p-10 text-center text-red-600">
      Product Not Found
    </div>
  );

  const { product, related } = data;

  return (
    <div className="max-w-6xl mx-auto p-5 md:p-10">

      {/* Thumbnail */}
      <div className="w-full h-80 md:h-[420px] rounded-xl overflow-hidden">
        <img src={product.thumbnail} className="w-full h-full object-cover" />
      </div>

      {/* Title */}
      <h1 className="mt-6 text-4xl font-bold">{product.title}</h1>

      <p className="mt-4 text-lg text-gray-600">
        {product.description}
      </p>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-8 bg-white shadow p-6 rounded-xl mt-10">

        <div>
          <h4 className="font-semibold">Launched</h4>
          <p className="text-gray-600 flex items-center gap-2">
            <FaCalendar />
            {new Date(product.launchDate).toDateString()}
          </p>
        </div>

        <div>
          <h4 className="font-semibold">Location</h4>
          <p className="flex items-center gap-2 text-gray-600">
            <FaMapMarkerAlt />
            {product.location?.city}, {product.location?.country}
          </p>
        </div>

        <div>
          <h4 className="font-semibold">Category</h4>
          <p className="text-gray-600">{product.category?.name}</p>
        </div>

      </div>

      {/* Tags */}
      {product.tags?.length > 0 && (
        <div className="mt-8">
          <h4 className="font-semibold flex items-center gap-2">
            <FaTags /> Tags
          </h4>

          <div className="flex flex-wrap gap-2 mt-2">
            {product.tags.map(t => (
              <span key={t._id} className="px-3 py-1 bg-gray-200 rounded-full text-sm">
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <h2 className="mt-10 text-2xl font-semibold">About Product</h2>
      <p className="mt-4 text-lg text-gray-700">
        {product.longDescription}
      </p>

      {/* Related */}
      {related?.length > 0 && (
        <div className="mt-14">
          <h2 className="text-2xl font-semibold mb-6">Related Products</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {related.map(r => (
              <Link key={r._id} href={`/product/${r.slug}`}
                className="rounded-xl overflow-hidden shadow hover:shadow-xl transition"
              >
                <img src={r.thumbnail} className="h-44 w-full object-cover" />
                <div className="p-3">
                  <h3 className="font-semibold">{r.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
