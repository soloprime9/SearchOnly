import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import VillageClient from "@/components/VillageClient";
import WhatsAppClientUI from "@/components/WhatsAppClientUI";
 import LeftSidebar from "@//components/LeftSidebar"
const API_BASE = "https://backend-k.vercel.app";
   
/* =========================
   METADATA (GOOGLE SAFE)
========================= */
export const metadata = {
  title: "FondPeace", // Brand-first title
  description:
    "FondPeace is an independent community platform for thoughtful discussions, idea sharing, and meaningful conversations built on trust and transparency.",
  keywords: [
    "FondPeace",
    "community platform",
    "open conversations",
    "online discussions",
    "share ideas",
    "Indian community platform",
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://fondpeace.com",
    languages: {
      "en-IN": "https://fondpeace.com",
      en: "https://fondpeace.com",
      "x-default": "https://fondpeace.com",
    },
  },
  openGraph: {
    type: "website",
    siteName: "FondPeace",
    title: "FondPeace",
    description:
      "Join FondPeace to discover meaningful discussions and participate in respectful community conversations.",
    url: "https://fondpeace.com",
    images: [
      {
        url: "https://fondpeace.com/FondPeace-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace community platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FondPeace",
    description:
      "FondPeace is a trusted platform for discussions, ideas, and transparent conversations.",
    images: ["https://fondpeace.com/FondPeace-1200x630.jpg"],
  },
};

/* =========================
   STRUCTURED DATA JSON-LD
========================= */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    // Founder
    {
      "@type": "Person",
      "@id": "https://fondpeace.com/#author",
      name: "Aman Kumar",
      url: "https://fondpeace.com/about",
      jobTitle: "Founder & Platform Editor",
      sameAs: [
        "http://www.youtube.com/@FondPeaceUpdate",
        "https://www.instagram.com/fondpeacetecho/",
         "https://x.com/FondPeaceTech",
         "https://news.fondpeace.com/"
         
      ],
    },
    // Organization
    {
      "@type": "Organization",
      "@id": "https://fondpeace.com/#organization",
      name: "FondPeace",
      alternateName: "FondPeace Community",
      url: "https://fondpeace.com",
      logo: {
     "@type": "ImageObject",
      url: "https://fondpeace.com/android-chrome-512x512.png",
     width: 512,
     height: 512,
   },

      foundingDate: "2024",
      founder: { "@id": "https://fondpeace.com/#author" },
      sameAs: [
         "http://www.youtube.com/@FondPeaceUpdate",
        "https://www.instagram.com/fondpeacetecho/",
         "https://x.com/FondPeaceTech",
         "https://news.fondpeace.com/"
         
         
      ],
    },
    // WebSite
    {
      "@type": "WebSite",
      "@id": "https://fondpeace.com/#website",
      url: "https://fondpeace.com",
      name: "FondPeace",
      alternateName: "FondPeace",
      publisher: { "@id": "https://fondpeace.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://fondpeace.com/searchbro?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    
    // Single Breadcrumb for Homepage
    {
      "@type": "BreadcrumbList",
      "@id": "https://fondpeace.com/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "FondPeace",
          item: "https://fondpeace.com",
        },
      ],
    },
  ],
};

/* =========================
   HOMEPAGE COMPONENT
========================= */
export default async function HomePage() {
  let posts = [];

  try {
    const res = await fetch(`${API_BASE}/post/mango/getall`, {
      cache: "no-store",
    });
    posts = await res.json();
  } catch (err) {
    console.error("Homepage feed fetch failed", err);
  }

    return (
  <>
    {/* Structured Data */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />

    {/* FIXED LEFT SIDEBAR */}
    

    {/* MAIN CONTENT (SPACE RESERVED FOR SIDEBAR) */}
    <main className="min-h-screen w-full bg-gray-50 overflow-x-hidden">
  <div
    className="
      grid 
      grid-cols-1 
      lg:grid-cols-[220px_minmax(0,1fr)_300px] 
      max-w-7xl 
      mx-auto
      gap-4
      md:px-2
    "
  >
    {/* Left Sidebar */}
    <aside className="hidden lg:block">
      <LeftSidebar />
    </aside>

    {/* Main Feed (WIDER) */}
    <section className="w-full mt-6">
      <Village initialPosts={posts} />
    </section>

    {/* Right Sidebar */}
    <aside className="hidden lg:block  rounded:md">
      <div className=" mt-20 fixed">
        <div  className="bg-blue-600 rounded-xl p-6 text-white shadow-xl shadow-blue-100">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-[2px] flex-grow bg-blue-400/50"></div>
              <span className="text-xl font-black">FondPeace</span>
              <div className="h-[2px] flex-grow bg-blue-400/50"></div>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-blue-50">
              
              <p className="opacity-80">FondPeace is an independent, community-driven social media and discussion platform built to support meaningful conversations, original content creation, and transparent online interaction.</p>
            </div>
            </div>


            <div className="mt-8 text-xs text-gray-500">
  <div className="flex flex-wrap gap-x-4 justify-evenn gap-y-2">
    <a href="/" className="hover:underline">About</a>
    <a href="/" className="hover:underline">Accessibility</a>
    <a href="/" className="hover:underline">Help Center</a>
    <a href="/" className="hover:underline">Privacy & Terms</a>
    <a href="/" className="hover:underline">Ad Choices</a>
    <a href="/" className="hover:underline">Advertising</a>
    <a href="/" className="hover:underline">Business Services</a>
    <a href="/" className="hover:underline">Get the App</a>
    <a href="/" className="hover:underline">More</a>
  </div>
 <div className="mt-3 text-gray-400">
    © {new Date().getFullYear()} FondPeace Corporation
  </div>
</div>


          </div>
    </aside>
  </div>
</main>

  </>

)

};

// <main className="min-h-screen w-full bg-gray-50 overflow-x-hidden">
//   <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

//     {/* ===== HERO / HEADER ===== */}
//     <header className="py-6 md:py-10 text-center">
//       <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900">
//         FondPeace
//       </h1>
//       <p className="mt-2 text-gray-500 text-sm md:text-base">Experience the community feed</p>
//     </header>

//     {/* ===== SEARCH - Wider on Desktop ===== */}
//     <section className="mb-8 flex justify-center">
//       <Link
//         href="/searchbro"
//         aria-label="Search FondPeace"
//         className="flex items-center gap-3 w-full max-w-4xl p-4 border border-gray-200 rounded-2xl bg-white text-gray-600 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300"
//       >
//         <FaSearch className="text-blue-500" />
//         <span className="font-medium">Search posts, videos, or people...</span>
//       </Link>
//     </section>

//     {/* ===== CLIENT UI (WhatsApp Style) ===== */}
//     <div className="mb-8 flex justify-center w-full">
//       <div className="w-full max-w-4xl">
//          <WhatsAppClientUI />
//       </div>
//     </div>

//     {/* ===== FEED (VillageClient) - The "Instagram" Style Layout ===== */}
//     <section className="w-full max-w-4xl mx-auto space-y-6">
//       <h2 className="sr-only">Community Feed</h2> 
//       {/* VillageClient should handle its own grid/flex for posts/videos internally */}
//       <VillageClient initialPosts={posts} />
//     </section>

//     {/* ===== FOOTER - Improved Desktop Grid ===== */}
//     <footer className="mt-16 border-t border-gray-200 pt-12 pb-8 w-full">
//       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 mb-10">

//         <nav aria-label="Platform links">
//           <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Platform</h4>
//           <div className="space-y-3">
//             <Link className="block hover:text-blue-600 transition" href="/aboutus">About</Link>
//             <Link className="block hover:text-blue-600 transition" href="/contactus">Contact</Link>
//             <Link className="block hover:text-blue-600 transition" href="/blog">Blog</Link>
//           </div>
//         </nav>

//         <nav aria-label="Legal links">
//           <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Legal</h4>
//           <div className="space-y-3">
//             <Link className="block hover:text-blue-600 transition" href="/privacypolicy">Privacy Policy</Link>
//             <Link className="block hover:text-blue-600 transition" href="/termcondition">Terms & Conditions</Link>
//             <Link className="block hover:text-blue-600 transition" href="/disclaimer">Disclaimer</Link>
//           </div>
//         </nav>

//         <nav aria-label="Account links">
//           <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Join Us</h4>
//           <div className="space-y-3">
//             <Link className="block hover:text-blue-600 transition" href="/signup">Signup</Link>
//             <Link className="block hover:text-blue-600 transition" href="/login">Login</Link>
//           </div>
//         </nav>

//         <nav aria-label="Social links">
//           <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Follow</h4>
//           <div className="grid grid-cols-1 gap-3 break-all">
//             <a className="hover:text-blue-600 transition" href="https://www.linkedin.com/company/108773259/">LinkedIn</a>
//             <a className="hover:text-red-600 transition" href="https://www.youtube.com/@FondPeaceUpdate/">YouTube</a>
//             <a className="hover:text-blue-700 transition" href="https://www.facebook.com/people/FondPeace-Social/61583656988052/">Facebook</a>
//             <a className="hover:text-pink-600 transition" href="https://www.instagram.com/fondpeacetecho/">Instagram</a>
//             <a className="hover:text-black transition" href="https://x.com/FondPeaceTech">Twitter</a>
//           </div>
//         </nav>

//       </div>

//       <div className="border-t border-gray-100 pt-8 text-center">
//         <p className="text-gray-500 text-sm">
//           Operated independently by <strong>FondPeace</strong> · Built with transparency and trust
//         </p>
//         <p className="mt-2 text-gray-400 text-xs">
//           © {new Date().getFullYear()} FondPeace. All rights reserved.
//         </p>
//       </div>
//     </footer>

//   </div>
// </main>


//     </>
//   );
// }





// import { Metadata } from 'next';
// import HomeLatestPosts from '@/components/HomeLatestPosts';
// import CreatePage from "@/components/CreatePage";
// import SearchGo from "@/components/SearchGo";
// import OnlyFeed from "@/components/OnlyFeed";
// import Upload from "@/components/Upload";
// import Village from "@/components/Village";
// import WhatsAppClientUI from "@/components/WhatsAppClientUI";
// import {FaSearch} from "react-icons/fa";
// import Link from "next/link";




// export const metadata = {
//   title: "Fond Peace",
//   description:
//     "Fondpeace.com is a free and modern all-in-one social platform that combines powerful web search and community features in one place. Whether you're looking to connect with friends, explore trending news, or search the internet like you would with Google or Bing, Fondpeace offers a seamless experience. Stay updated with what's happening around you, watch and share videos, chat with others, create posts, join communities, and explore the web—all from one easy-to-use platform. Built for speed, simplicity, and social engagement, Fondpeace.com is designed to be your go-to digital hub for information and interaction.",
//   keywords:
//     "free social media platform, trending news and videos, all-in-one search and social platform, Online Chatting, Xhamster, blacked.com, jav.guru, jav guru, perplexity ai, macrumors, today written update, instagram, youtube, brazzer, angela white, alyx star, how to, Fond Peace AI, free AI tools, AI search engine, AI assistant, AI automation, AI content generator, AI-powered search, AI chatbot, AI-driven solutions, AI-powered research, AI discovery, AI-powered learning, AI innovation, AI productivity, AI-powered applications, AI-powered insights, AI-powered recommendations, AI for everyone, next-gen AI, best free AI tools, AI-powered knowledge base, AI-driven search engine, AI-powered decision-making, AI-powered problem-solving, AI assistant for work and study, AI-powered writing tools, AI-powered creative solutions, chatgpt, openai, Claude AI, Grok AI, Elon Musk AI, search engine alternatives, written updates, Telly updates, Anupama, YRKKH, Bhagya Lakshmi, Dhruv Rathee, MacRumors, 9to5Mac, Apple Insider, Apple rumors, iPhone news, AI SEO optimization, 2025 Google SEO, AI-powered blogging, real-time AI answers, best AI tools 2025, AI automation for business, SEO AI tools, AI-driven marketing, Google core update 2025, AI-enhanced productivity, AI-generated content, machine learning trends 2025, AI-powered analytics, AI for digital marketing, AI SEO ranking strategies, how to rank on Google with AI, best AI-powered research tools,youtube thumbnail tester, thumbnail preview, youtube seo, preview thumbnail youtube,Google-like search engine,chat and connect online,post, share, explore content,modern social network,discover local and global news,video sharing platform,free community platform",
//   openGraph: {
//     title: "Fond Peace",
//     description:
//       "Fondpeace.com is a free social platform where you can search the web, share posts and videos, discover trending news, chat, and stay connected—all in one place.",
//     url: "https://fondpeace.com",
//     images: [
//       {
//         url: "https://www.fondpeace.com/Fondpeace.jpg",
//         width: 1200,
//         height: 630,
//       },
//     ],
//     type: "website",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Fond Peace",
//     description:
//       "Fondpeace.com is a free social platform where you can search the web, share posts and videos, discover trending news, chat, and stay connected—all in one place.",
//     images: ["https://www.fondpeace.com/Fondpeace.jpg"],
//     site: "@Gayatrisingho",
//   },
//   alternates: {
//     canonical: "https://fondpeace.com",
//   },
// };

// export default function Page() {

 
//   return (
    
//       <>
//     <WhatsAppClientUI />
//     <div className="flex flex-col items-center p-4">
      

//       <div className="w-full max-w-6xl">
//     {/* ===== SEARCH BOX BELOW HEADER ===== */}
//         <div className="pt-20 md:pt-24 px-4 flex justify-center w-full">
//           <div className="w-full max-w-3xl">
//             <Link
//               href="/searchbro"
//               className="block w-full text-gray-500 text-sm md:text-base p-3 rounded-xl border border-gray-300 bg-white shadow hover:shadow-md transition cursor-pointer flex items-center gap-2"
//             >
//               <FaSearch /> Click here to search posts...
//             </Link>
//           </div>
//         </div> 
                
//          <Village />
//       </div>
//     </div>
        
//         </>
//   )

// };








// 'use client';
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Link from 'next/link';
// import Image from 'next/image';
// import Head from 'next/head';
  
// function Posts() {
//     const [data, setData] = useState([]);
//     const [loading, setloading] = useState(false);

//     useEffect(() => {
//         const Content = async () => {
//             try {
//                 const response = await axios.get('https://backendk-z915.onrender.com/content/get');
//                 setData(response.data);
                
//             }
//             catch (error) {
//                 // console.log(error);
//             }
//         };
//         Content();
//     }, []);

//     return (
//         <>
            


//         {/* Schema.org JSON-LD */}
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify({
//               "@context": "https://schema.org",
//               "@type": "SoftwareApplication",
//               name: "Fond Peace AI",
//               operatingSystem: "Web",
//               applicationCategory: "Artificial Intelligence",
//               offers: {
//                 "@type": "Offer",
//                 price: "0",
//               },
//               aggregateRating: {
//                 "@type": "AggregateRating",
//                 ratingValue: "4.9",
//                 ratingCount: "2500",
//               },
//               publisher: {
//                 "@type": "Organization",
//                 name: "Fond Peace AI",
//                 url: "https://www.fondpeace.com/",
//                 logo: {
//                   "@type": "ImageObject",
//                   url: "https://www.fondpeace.com/logo.png",
//                   width: 300,
//                   height: 300,
//                 },
//               },
//             }),
//           }}
//         />

        
//       </Head>
            
//             <div className='   '>
    
                
//             <div  className='grid grid-cols-1 md:grid-cols-[150px_1fr_300px] '>
    
    
//             {/* Starting of Left Sidebzr */}
//             <div className='sticky top-10 h-screen overflow-y-auto w-full font-bold text-2xl my-0 border-1 border-gray-300 rounded-md hidden md:block'>

//                         <h4 className='mx-2 my-4'>Worlds</h4>
//                         <h4 className='mx-2 my-4'>Search</h4>
//                         <h4 className='mx-2 my-4'>Account</h4>
//                         <h4 className='mx-2 my-4'>Setting</h4>
//                         <h4 className='mx-2 my-4'>Privacy</h4>
                        
    
//                 </div>
    
//             {/* Starting of Main Content Area*/}

//                 <div className="   px-4 space-y-6  w-full">
//             {data.length > 0 ? 
//                 (
//                     data.slice().sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((post,index) => 
//                     (

//                         <div key={index} className='  border-1 border-gray-300 rounded-md h-auto'>
//                     <div className=' rounded-xl p-2 h-auto '>
                     
//                     <Link href={`/post/${post._id}`}>

//                         <div className=' flex gap-3 mb-6'>
//                             <img src="https://images.macrumors.com/t/5K1xePYg0aiVFhfzTAd8181ROw8=/800x0/article-new/2024/07/Apple-TV-Plus-Feature-2-Magenta-and-Blue.jpg?lossy" alt="" className='w-10 h-10 rounded-full border-2' />
    
//                             <div className=''>
//                             <p className='pt-2 font-bold'>Human Cant</p>
                            
                            
//                             </div>
                            
//                             <div className='font-bold text-2xl md:ml-55 sm:ml-25 xs:ml-10 ml-30 lg:ml-60'>...</div>
//                         </div>
                        
//                     <p className='cursor-pointer mb-4'>{post.content}</p>
                    
//                     <div className='flex justify-center'>
//                     <img src={post.imageURL || ""}  className='w-auto  h-auto border-1 border-gray-300 rounded-2xl'/>
//                     </div>
//                     </Link>
                    
//                     </div>
                    
                    
                    
//                     <div className='flex gap-1 justify-evenly md:p-2 border-1 border-gray-300  '>
                    
                    
                    
//                     <p className='cursor-pointer border-1 p-2  rounded-xl px-2'> like</p>
//                     <p className='cursor-pointer border-1 p-2 rounded-xl px-2'>comment</p>
//                     <p className='cursor-pointer border-1 rounded-xl p-2 px-2'>share</p>
//                     <p className='cursor-pointer border-1 rounded-xl p-2 px-2'>Save</p>
                    
//                     </div>
                
//                 </div>
//                     ))): (
//                         <div>hello dear </div>
//                     )
//                 }
    
//     </div>
//             {/* Starting of RightSide bar */}
            
//             <div className='sticky top-10 h-screen overflow-y-auto justify-center text-center border-1 border-gray-300 p-4 mx-4 rounded-md  hidden md:block'>

                
//                 <div className='flex  gap-10 mb-6  '>
//                             <div className='flex gap-2'>
//                             <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
//                             <strong className='pt-2 truncate  '>Human Cant</strong>
//                             </div>
    
    
//                             <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
//                         </div> 
    
//                         <div className='flex  gap-10 mb-6  '>
//                             <div className='flex gap-2'>
//                             <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
//                             <strong className='pt-2 truncate  '>Human Cant</strong>
//                             </div>
    
    
//                             <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
//                         </div> 
    
//                         <div className='flex  gap-10 mb-6  '>
//                             <div className='flex gap-2'>
//                             <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
//                             <strong className='pt-2 truncate  '>Human Cant</strong>
//                             </div>
    
    
//                             <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
//                         </div> 
    
//                         <div className='flex  gap-10 mb-6  '>
//                             <div className='flex gap-2'>
//                             <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
//                             <strong className='pt-2 truncate  '>Human Cant</strong>
//                             </div>
    
    
//                             <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
//                         </div> 
    
//                         <div className='flex  gap-10 mb-6  '>
//                             <div className='flex gap-2'>
//                             <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
//                             <strong className='pt-2 truncate  '>Human Cant</strong>
//                             </div>
    
    
//                             <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
//                         </div> 
//                 </div>
    
//                 </div>
            
    
//             </div>
//         </>
//     );
// }

// export default Posts;
// }









