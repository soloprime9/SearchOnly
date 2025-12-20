import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import VillageServer from "@/components/VillageServer";
import WhatsAppClientUI from "@/components/WhatsAppClientUI";

/* =========================
   METADATA (GOOGLE SAFE)
========================= */
export const metadata = {
  title: "FondPeace | Trusted Community Platform for Open Conversations",
  description:
    "FondPeace is an independent community platform for thoughtful discussions, idea sharing, and meaningful conversations built on trust and transparency.",
  keywords: [
    "FondPeace",
    "community platform",
    "online discussions",
    "open conversations",
    "share ideas",
    "Indian community platform",
  ],
  applicationName: "FondPeace",
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
    title: "FondPeace – A Trusted Community Platform",
    description:
      "Join FondPeace to discover meaningful discussions and participate in respectful community conversations.",
    url: "https://fondpeace.com",
    images: [
      {
        url: "https://www.fondpeace.com/Fondpeace.jpg",
        width: 1200,
        height: 630,
        alt: "FondPeace community platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FondPeace – Community Platform",
    description:
      "FondPeace is a trusted platform for discussions, ideas, and transparent conversations.",
    images: ["https://www.fondpeace.com/Fondpeace.jpg"],
  },
};

/* =========================
   STRUCTURED DATA (E-E-A-T)
========================= */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://fondpeace.com/#author",
      name: "Aman Kumar",
      url: "https://fondpeace.com/about",
      jobTitle: "Founder & Platform Editor",
      sameAs: [
        "https://www.youtube.com/@DhakadKhabar",
        "https://www.linkedin.com/in/aman-kumar"
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://fondpeace.com/#organization",
      name: "FondPeace",
      url: "https://fondpeace.com",
      logo: "https://www.fondpeace.com/Fondpeace.jpg",
      foundingDate: "2024",
      founder: {
        "@id": "https://fondpeace.com/#author"
      },
      sameAs: [
        "https://www.youtube.com/@DhakadKhabar",
        "https://www.linkedin.com/company/108773259/"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://fondpeace.com/#website",
      url: "https://fondpeace.com",
      name: "FondPeace",
      publisher: {
        "@id": "https://fondpeace.com/#organization"
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://fondpeace.com/searchbro?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

/* =========================
   HOMEPAGE
========================= */
export default function HomePage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Performance */}
      <link rel="preconnect" href="https://backend-k.vercel.app" />
      <link rel="dns-prefetch" href="https://backend-k.vercel.app" />

      <main className="flex flex-col items-center px-2 pb-16">
        <div className="w-full max-w-6xl">

          

          {/* ===== HERO ===== */}
          <header className="pt-8 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              FondPeace
            </h1>

            <p className="mt-3 text-xl text-gray-700">
              A trusted community platform for open conversations.
            </p>

            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              Discover thoughtful discussions, explore ideas, and participate in
              respectful conversations without noise or manipulation.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Independent · Community-first · Transparent
            </p>
          </header>

          {/* ===== SEARCH ===== */}
          <section className="mt-8 flex justify-center">
            <Link
              href="/searchbro"
              aria-label="Search FondPeace"
              className="flex items-center gap-3 w-full max-w-3xl p-4 border border-gray-300 rounded-xl bg-white text-gray-600 shadow-sm hover:shadow-md transition"
            >
              <FaSearch />
              <span>Search discussions, posts, and topics…</span>
            </Link>
          </section>

          {/* ===== CLIENT UI ===== */}
          <div className="mt-6 flex justify-center">
            <WhatsAppClientUI />
          </div>

          {/* ===== PURPOSE ===== */}
          <section className="mt-16 max-w-4xl mx-auto text-gray-700 space-y-10">
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                Why FondPeace Exists
              </h2>
              <p>
                FondPeace was created to offer a balanced, human-driven space for
                open discussions without algorithmic bias or misinformation.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-2">
                Who It’s For
              </h2>
              <p>
                Readers, creators, and communities who value respectful dialogue,
                independent thinking, and meaningful engagement.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-2">
                Trust & Transparency
              </h2>
              <p>
                Clear guidelines, real authorship, and responsible moderation
                ensure reliability and long-term trust.
              </p>
            </div>
          </section>

          {/* ===== INTERNAL NAV ===== */}
          <nav className="sr-only">
            <Link href="/JobTension">Job Tension</Link>
            <Link href="/IntroList">Intro List</Link>
            <Link href="/aboutus">About FondPeace</Link>
            <Link href="/contactus">Contact</Link>
            <Link href="/privacypolicy">Privacy Policy</Link>
          </nav>

          {/* ===== FEED ===== */}
          <section className="mt-16">
            <h2 className="sr-only">Latest Community Discussions</h2>
            <VillageServer />
          </section>

          {/* ===== FOOTER ===== */}
          <footer className="border-t mt-16 pt-8 text-sm text-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <h4 className="font-semibold">Platform</h4>
                <Link href="/aboutus">About</Link><br />
                <Link href="/contactus">Contact</Link><br />
                <Link href="/blog">Blog</Link>
              </div>
              <div>
                <h4 className="font-semibold">Legal</h4>
                <Link href="/privacypolicy">Privacy Policy</Link><br />
                <Link href="/termcondition">Terms & Conditions</Link><br />
                <Link href="/disclaimer">Disclaimer</Link>
              </div>
              <div>
                <h4 className="font-semibold">Join with us</h4>
                <Link href="/signup">Signup</Link><br />
                <Link href="/login">Login</Link>
              </div>
              <div>
                <h4 className="font-semibold">Follow</h4>
                <a href="https://www.linkedin.com/company/108773259/">LinkedIn</a><br />
                <a href="https://www.youtube.com/@DhakadKhabar">YouTube</a>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Operated independently by FondPeace · Built with transparency and trust
            </p>

            <p className="mt-2 text-center">
              © {new Date().getFullYear()} FondPeace. All rights reserved.
            </p>
          </footer>

        </div>
      </main>
    </>
  );
}






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









