'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
  
function Posts() {
    const [data, setData] = useState([]);
    const [loading, setloading] = useState(false);

    useEffect(() => {
        const Content = async () => {
            try {
                const response = await axios.get('https://backendk-z915.onrender.com/content/get');
                setData(response.data);
                
            }
            catch (error) {
                // console.log(error);
            }
        };
        Content();
    }, []);

    return (
        <>
            

            <Head>
        <title>Fond Peace AI - Free AI-Powered Search & Do Anything for Free</title>
        <meta name="description" content="Unlock the limitless potential of AI with Fond Peace AI. Experience cutting-edge AI-powered search, automation, content generation, and assistance tools—all for free. This is a platform where you can search anything like Google, Bing, and the web." />
        <meta name="keywords" content="Online Chatting, Xhamster, blacked.com, jav.guru, jav guru, perplexity ai, macrumors, today written update, instagram, youtube, brazzer, angela white, alyx star, how to, Fond Peace AI, free AI tools, AI search engine, AI assistant, AI automation, AI content generator, AI-powered search, AI chatbot, AI-driven solutions, AI-powered research, AI discovery, AI-powered learning, AI innovation, AI productivity, AI-powered applications, AI-powered insights, AI-powered recommendations, AI for everyone, next-gen AI, best free AI tools, AI-powered knowledge base, AI-driven search engine, AI-powered decision-making, AI-powered problem-solving, AI assistant for work and study, AI-powered writing tools, AI-powered creative solutions, chatgpt, openai, Claude AI, Grok AI, Elon Musk AI, search engine alternatives, written updates, Telly updates, Anupama, YRKKH, Bhagya Lakshmi, Dhruv Rathee, MacRumors, 9to5Mac, Apple Insider, Apple rumors, iPhone news, AI SEO optimization, 2025 Google SEO, AI-powered blogging, real-time AI answers, best AI tools 2025, AI automation for business, SEO AI tools, AI-driven marketing, Google core update 2025, AI-enhanced productivity, AI-generated content, machine learning trends 2025, AI-powered analytics, AI for digital marketing, AI SEO ranking strategies, how to rank on Google with AI, best AI-powered research tools" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Fond Peace AI Team" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.fondpeace.com/" />
        



        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Fond Peace AI - Your Ultimate Free AI Assistant for Everything" />
        <meta property="og:description" content="Experience the future of AI today! Search, create, and automate effortlessly with Fond Peace AI. Free AI-powered solutions for search, writing, automation, and more!" />
        <meta property="og:url" content="https://www.fondpeace.com/" />
        <meta property="og:image" content="https://www.fondpeace.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Fond Peace AI" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fond Peace AI - Explore Advanced AI Tools for Free" />
        <meta name="twitter:description" content="Experience the future of AI today! Search, create, and automate effortlessly with Fond Peace AI. Free AI-powered solutions for search, writing, automation, and more!" />
        <meta name="twitter:image" content="https://www.fondpeace.com/twitter-image.jpg" />
        <meta name="twitter:site" content="@FondPeaceAI" />
        <meta name="twitter:creator" content="@FondPeaceAI" />

        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Fond Peace AI",
              operatingSystem: "Web",
              applicationCategory: "Artificial Intelligence",
              offers: {
                "@type": "Offer",
                price: "0",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "2500",
              },
              publisher: {
                "@type": "Organization",
                name: "Fond Peace AI",
                url: "https://www.fondpeace.com/",
                logo: {
                  "@type": "ImageObject",
                  url: "https://www.fondpeace.com/logo.png",
                  width: 300,
                  height: 300,
                },
              },
            }),
          }}
        />

        
      </Head>
            
            <div className='   '>
    
                
            <div  className='grid grid-cols-1 md:grid-cols-[150px_1fr_300px] '>
    
    
            {/* Starting of Left Sidebzr */}
            <div className='sticky top-10 h-screen overflow-y-auto w-full font-bold text-2xl my-0 border-1 border-gray-300 rounded-md hidden md:block'>

                        <h4 className='mx-2 my-4'>Worlds</h4>
                        <h4 className='mx-2 my-4'>Search</h4>
                        <h4 className='mx-2 my-4'>Account</h4>
                        <h4 className='mx-2 my-4'>Setting</h4>
                        <h4 className='mx-2 my-4'>Privacy</h4>
                        
    
                </div>
    
            {/* Starting of Main Content Area*/}

                <div className="   px-4 space-y-6  w-full">
            {data.length > 0 ? 
                (
                    data.slice().sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((post,index) => 
                    (

                        <div key={index} className='  border-1 border-gray-300 rounded-md h-auto'>
                    <div className=' rounded-xl p-2 h-auto '>
                     
                    <Link href={`/post/${post._id}`}>

                        <div className=' flex gap-3 mb-6'>
                            <img src="https://images.macrumors.com/t/5K1xePYg0aiVFhfzTAd8181ROw8=/800x0/article-new/2024/07/Apple-TV-Plus-Feature-2-Magenta-and-Blue.jpg?lossy" alt="" className='w-10 h-10 rounded-full border-2' />
    
                            <div className=''>
                            <p className='pt-2 font-bold'>Human Cant</p>
                            
                            
                            </div>
                            
                            <div className='font-bold text-2xl md:ml-55 sm:ml-25 xs:ml-10 ml-30 lg:ml-60'>...</div>
                        </div>
                        
                    <p className='cursor-pointer mb-4'>{post.content}</p>
                    
                    <div className='flex justify-center'>
                    <img src={post.imageURL || ""}  className='w-auto  h-auto border-1 border-gray-300 rounded-2xl'/>
                    </div>
                    </Link>
                    
                    </div>
                    
                    
                    
                    <div className='flex gap-1 justify-evenly md:p-2 border-1 border-gray-300  '>
                    
                    
                    
                    <p className='cursor-pointer border-1 p-2  rounded-xl px-2'> like</p>
                    <p className='cursor-pointer border-1 p-2 rounded-xl px-2'>comment</p>
                    <p className='cursor-pointer border-1 rounded-xl p-2 px-2'>share</p>
                    <p className='cursor-pointer border-1 rounded-xl p-2 px-2'>Save</p>
                    
                    </div>
                
                </div>
                    ))): (
                        <div>hello dear </div>
                    )
                }
    
    </div>
            {/* Starting of RightSide bar */}
            
            <div className='sticky top-10 h-screen overflow-y-auto justify-center text-center border-1 border-gray-300 p-4 mx-4 rounded-md  hidden md:block'>

                
                <div className='flex  gap-10 mb-6  '>
                            <div className='flex gap-2'>
                            <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
                            <strong className='pt-2 truncate  '>Human Cant</strong>
                            </div>
    
    
                            <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
                        </div> 
    
                        <div className='flex  gap-10 mb-6  '>
                            <div className='flex gap-2'>
                            <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
                            <strong className='pt-2 truncate  '>Human Cant</strong>
                            </div>
    
    
                            <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
                        </div> 
    
                        <div className='flex  gap-10 mb-6  '>
                            <div className='flex gap-2'>
                            <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
                            <strong className='pt-2 truncate  '>Human Cant</strong>
                            </div>
    
    
                            <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
                        </div> 
    
                        <div className='flex  gap-10 mb-6  '>
                            <div className='flex gap-2'>
                            <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
                            <strong className='pt-2 truncate  '>Human Cant</strong>
                            </div>
    
    
                            <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
                        </div> 
    
                        <div className='flex  gap-10 mb-6  '>
                            <div className='flex gap-2'>
                            <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
                            <strong className='pt-2 truncate  '>Human Cant</strong>
                            </div>
    
    
                            <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
                        </div> 
                </div>
    
                </div>
            
    
            </div>
        </>
    );
}

export default Posts;
