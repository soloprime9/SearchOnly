"use client";
import Link from "next/link";
import Image from "next/image";
import { 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaTags, 
  FaRegUser, 
  FaExternalLinkAlt,
  FaGithub, 
  FaTwitter, 
  FaLinkedin, 
  FaGlobe, 
  FaGooglePlay, 
  FaApple, 
  FaChrome 
} from "react-icons/fa";

export default function ProductPageView({ data }) {

  if (!data?.ok) return (
    <div className="p-20 text-center text-red-600 text-xl">
      ❌ Product Not Found
    </div>
  );

  const { product, related } = data;

  return (
    <div className="max-w-4xl mx-auto p-5 md:p-10">

      {/* Thumbnail */}
      <div className="w-full h-56 md:h-80 rounded-xl overflow-hidden shadow-lg border border-gray-300">
  <img
    src={product.thumbnail}
    alt={product.title}
    className="w-full h-full object-cover border border-red-400"
  />
</div>


      {/* Title */}
      <h1 className="mt-6 text-center text-3xl md:text-4xl font-bold leading-tight">
        {product.title}
      </h1>

      <p className="mt-4 text-center text-lg text-gray-700 leading-relaxed">
        {product.description}
      </p>

      {/* Stats */}

      {/* Stats */}
<div className="flex flex-wrap justify-center gap-10 bg-white shadow-md p-6 rounded-xl mt-10 text-center">

  <div>
    <h4 className="font-semibold">Launched</h4>
    <p className="text-gray-600 flex justify-center items-center gap-2">
      <FaCalendar /> {new Date(product.launchDate).toDateString()}
    </p>
  </div>

  <div>
    <h4 className="font-semibold">Location</h4>
    <p className="text-gray-600 flex justify-center items-center gap-2">
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
        <div className="mt-8 text-center">
          <h4 className="font-semibold flex items-center gap-2 justify-center">
            <FaTags /> Tags
          </h4>

          <div className="flex justify-center flex-wrap gap-2 mt-3">
            {product.tags.map(t => (
              <span key={t._id} className="px-3 py-1 bg-gray-100 border rounded-full text-sm">
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* About */}
      <h2 className="mt-10 text-center text-2xl font-semibold">About Product</h2>
      <p className="mt-4 text-lg text-gray-700 leading-relaxed text-center">
        {product.longDescription}
      </p>

      {/* Important Links */}
      <div className="mt-10 flex flex-col gap-4 items-center">

        {product.websiteUrl && (
          <Link href={product.websiteUrl} target="_blank" className="flex items-center gap-2 text-lg font-semibold text-blue-600 hover:underline">
            <FaGlobe /> Website <FaExternalLinkAlt />
          </Link>
        )}

        {product.playStoreLink && (
          <a href={product.playStoreLink} target="_blank" className="flex items-center gap-2 text-green-600 hover:underline">
            <FaGooglePlay /> Play Store
          </a>
        )}

        {product.appStoreLink && (
          <a href={product.appStoreLink} target="_blank" className="flex items-center gap-2 text-gray-600 hover:underline">
            <FaApple /> App Store
          </a>
        )}

        {product.chromeExtension && (
          <a href={product.chromeExtension} target="_blank" className="flex items-center gap-2 text-purple-600 hover:underline">
            <FaChrome /> Chrome Extension
          </a>
        )}

      </div>

      {/* Social */}
      <div className="mt-10 flex flex-col gap-3 items-center">

        {product.social?.twitter && (
          <a href={product.social.twitter} target="_blank" className="flex items-center gap-2 text-blue-400 hover:underline">
            <FaTwitter /> Twitter
          </a>
        )}

        {product.social?.github && (
          <a href={product.social.github} target="_blank" className="flex items-center gap-2 hover:underline">
            <FaGithub /> Github
          </a>
        )}

        {product.social?.linkedin && (
          <a href={product.social.linkedin} target="_blank" className="flex items-center gap-2 text-blue-700 hover:underline">
            <FaLinkedin /> LinkedIn
          </a>
        )}

      </div>

      {/* Author */}
      <p className="mt-10 flex justify-center items-center gap-2 text-gray-700">
        <FaRegUser /> Added by <span className="font-semibold">{product.createdBy?.username}</span>
      </p>

      {/* Related */}
      {related?.length > 0 && (
        <div className="mt-14">
          <h2 className="text-center text-2xl font-semibold mb-6">More Like This</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {related.map(r => (
              <Link key={r._id} href={`/product/${r.slug}`} 
                className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition overflow-hidden">
                  
                <div className="h-44 w-full overflow-hidden">
                  <img src={r.thumbnail} className="h-full w-full object-cover" />
                </div>

                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg">{r.title}</h3>

                  <div className="flex justify-center items-center gap-2 mt-2 text-sm text-gray-700">
                    <FaRegUser /> {r.createdBy?.username}
                  </div>
                </div>

              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}










// "use client";
// import Link from "next/link";
// import Image from "next/image";
// import { FaCalendar, FaMapMarkerAlt, FaTags, FaRegUser, FaExternalLinkAlt } from "react-icons/fa";
// import { FaGithub, FaTwitter, FaLinkedin, FaGlobe, FaGooglePlay, FaApple, FaChrome } from "react-icons/fa";

// export default function ProductPageView({ data }) {

//   if (!data?.ok) return (
//     <div className="p-20 text-center text-red-600 text-xl">
//       ❌ Product Not Found
//     </div>
//   );

//   const { product, related } = data;

//   return (
//     <div className="max-w-6xl mx-auto p-5 md:p-10">

//       {/* Thumbnail */}
//       <div className="w-full h-64 md:h-72 rounded-xl overflow-hidden shadow-lg">
//         <img
//           src={product.thumbnail}
//           alt={product.title}
//           className="w-full h-full object-cover"
//           width={1200}
//           height={600}
//           priority
//         />
//       </div>

//       {/* Title */}
//       <h1 className="mt-6 text-4xl md:text-5xl font-bold leading-tight">
//         {product.title}
//       </h1>

//       <p className="mt-4 text-lg text-gray-700 leading-relaxed">
//         {product.description}
//       </p>

//       {/* Stats */}
//       <div className="grid md:grid-cols-3 gap-8 bg-white shadow-md p-6 rounded-xl mt-10">

//         <div>
//           <h4 className="font-semibold">Launched</h4>
//           <p className="text-gray-600 flex items-center gap-2">
//             <FaCalendar /> {new Date(product.launchDate).toDateString()}
//           </p>
//         </div>

//         <div>
//           <h4 className="font-semibold">Location</h4>
//           <p className="flex items-center gap-2 text-gray-600">
//             <FaMapMarkerAlt />
//             {product.location?.city}, {product.location?.country}
//           </p>
//         </div>

//         <div>
//           <h4 className="font-semibold">Category</h4>
//           <p className="text-gray-600">{product.category?.name}</p>
//         </div>

//       </div>

//       {/* Tags */}
//       {product.tags?.length > 0 && (
//         <div className="mt-8">
//           <h4 className="font-semibold flex items-center gap-2">
//             <FaTags /> Tags
//           </h4>

//           <div className="flex flex-wrap gap-2 mt-3">
//             {product.tags.map(t => (
//               <span key={t._id} className="px-3 py-1 bg-gray-100 border rounded-full text-sm cursor-pointer hover:bg-gray-200">
//                 {t.name}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Description */}
//       <h2 className="mt-10 text-2xl font-semibold">About Product</h2>
//       <p className="mt-4 text-lg text-gray-700 leading-relaxed">
//         {product.longDescription}
//       </p>

//       {/* Important Links */}
//       <div className="mt-10 space-y-4">

//         {product.websiteUrl && (
//           <Link href={product.websiteUrl} target="_blank" className="flex items-center text-blue-600 gap-2 hover:underline">
//             <FaGlobe /> Official Website <FaExternalLinkAlt />
//           </Link>
//         )}

//         {product.playStoreLink && (
//           <a href={product.playStoreLink} target="_blank" className="flex items-center text-green-600 gap-2 hover:underline">
//             <FaGooglePlay /> Play Store
//           </a>
//         )}

//         {product.appStoreLink && (
//           <a href={product.appStoreLink} target="_blank" className="flex items-center text-gray-600 gap-2 hover:underline">
//             <FaApple /> App Store
//           </a>
//         )}

//         {product.chromeExtension && (
//           <a href={product.chromeExtension} target="_blank" className="flex items-center text-purple-600 gap-2 hover:underline">
//             <FaChrome /> Chrome Extension
//           </a>
//         )}

//       </div>

//       {/* Social */}
//       <div className="mt-10 space-y-3">

//         {product.social?.twitter && (
//           <a href={product.social.twitter} target="_blank" className="flex items-center gap-2 text-blue-400 hover:underline">
//             <FaTwitter /> Twitter
//           </a>
//         )}

//         {product.social?.github && (
//           <a href={product.social.github} target="_blank" className="flex items-center gap-2 hover:underline">
//             <FaGithub /> Github
//           </a>
//         )}

//         {product.social?.linkedin && (
//           <a href={product.social.linkedin} target="_blank" className="flex items-center gap-2 text-blue-700 hover:underline">
//             <FaLinkedin /> LinkedIn
//           </a>
//         )}

//       </div>

//       {/* Author */}
//       <p className="mt-10 flex items-center gap-2 text-gray-700">
//         <FaRegUser /> Added by <span className="font-semibold">{product.createdBy?.username}</span>
//       </p>

//       {/* Related Section */}
// {!!related?.length && (
//   <div className="mt-14">
//     <h2 className="text-2xl font-semibold mb-6">Related Products</h2>

//     <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
//       {related.map(r => (
//         <Link
//           key={r._id}
//           href={`/product/${r.slug}`}
//           className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition hover:-translate-y-1 duration-300"
//         >
//           {/* Thumbnail */}
//           <div className="h-44 w-full overflow-hidden">
//             <img
//               src={r.thumbnail}
//               className="h-full w-full object-cover"
//               alt={r.title}
//             />
//           </div>

//           {/* Content */}
//           <div className="p-4 space-y-2">

//             <h3 className="font-semibold text-lg leading-tight">
//               {r.title}
//             </h3>

//             {/* Creator */}
//             <div className="flex items-center gap-2">
//               <FaRegUser className="text-gray-500 text-sm" />

//               <span className="text-sm text-gray-700">
//                 {r.createdBy?.username}
//               </span>
//             </div>

//           </div>
//         </Link>
//       ))}
//     </div>
//   </div>
// )}


//     </div>
//   )
// }












// import Link from "next/link";
// import { FaCalendar, FaMapMarkerAlt, FaTags, FaRegUser } from "react-icons/fa";

// export default function ProductPageView({ data }) {

//   if (!data?.ok) return (
//     <div className="p-10 text-center text-red-600">
//       Product Not Found
//     </div>
//   );

//   const { product, related } = data;

//   return (
//     <div className="max-w-6xl mx-auto p-5 md:p-10">

//       {/* Thumbnail */}
//       <div className="w-full h-80 md:h-[420px] rounded-xl overflow-hidden">
//         <img src={product.thumbnail} className="w-full h-full object-cover" />
//       </div>

//       {/* Title */}
//       <h1 className="mt-6 text-4xl font-bold">{product.title}</h1>

//       <p className="mt-4 text-lg text-gray-600">
//         {product.description}
//       </p>

//       {/* Stats */}
//       <div className="grid md:grid-cols-3 gap-8 bg-white shadow p-6 rounded-xl mt-10">

//         <div>
//           <h4 className="font-semibold">Launched</h4>
//           <p className="text-gray-600 flex items-center gap-2">
//             <FaCalendar />
//             {new Date(product.launchDate).toDateString()}
//           </p>
//         </div>

//         <div>
//           <h4 className="font-semibold">Location</h4>
//           <p className="flex items-center gap-2 text-gray-600">
//             <FaMapMarkerAlt />
//             {product.location?.city}, {product.location?.country}
//           </p>
//         </div>

//         <div>
//           <h4 className="font-semibold">Category</h4>
//           <p className="text-gray-600">{product.category?.name}</p>
//         </div>

//       </div>

//       {/* Tags */}
//       {product.tags?.length > 0 && (
//         <div className="mt-8">
//           <h4 className="font-semibold flex items-center gap-2">
//             <FaTags /> Tags
//           </h4>

//           <div className="flex flex-wrap gap-2 mt-2">
//             {product.tags.map(t => (
//               <span key={t._id} className="px-3 py-1 bg-gray-200 rounded-full text-sm">
//                 {t.name}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Description */}
//       <h2 className="mt-10 text-2xl font-semibold">About Product</h2>
//       <p className="mt-4 text-lg text-gray-700">
//         {product.longDescription}
//       </p>

//       <div>
//           <h4 className="font-semibold">{product.websiteUrl}</h4>
//           <h4 className="font-semibold">{product.appStoreLink}</h4>
//           <h4 className="font-semibold">{product.playStoreLink}</h4>
//           <h4 className="font-semibold">{product.chromeExtension}</h4>
          
          
//         </div>

//       <div>
//           <h4 className="font-semibold">
//             {product.social.twitter}</h4>
//           <h4 className="font-semibold">{product.social.github}</h4>
//           <h4 className="font-semibold">{product.social.linkedin}</h4>
          
//         </div>

//       <div>
//           <p className="fond-semibold"><FaRegUser /> {product.createdBy.username}</p>
//       </div>

//       {/* Related */}
//       {related?.length > 0 && (
//         <div className="mt-14">
//           <h2 className="text-2xl font-semibold mb-6">Related Products</h2>

//           <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
//             {related.map(r => (
//               <Link key={r._id} href={`/product/${r.slug}`}
//                 className="rounded-xl overflow-hidden shadow hover:shadow-xl transition"
//               >
//                 <img src={r.thumbnail} className="h-44 w-full object-cover" />
//                 <div className="p-3">
//                   <h3 className="font-semibold">{r.title}</h3>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }
