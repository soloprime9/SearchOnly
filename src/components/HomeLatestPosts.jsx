'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Head from 'next/head';
import { formatPostTime } from '@/components/DateFormate';

function Posts () {
    const [data, setData] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setloading] = useState(false);



    const Content = async () => {
        try{
            const response =  await axios.get('https://backendk-z915.onrender.com/content/get');
            
            setData(response.data);
            console.log("Data",response.data);
    
            }
            catch(error){
                // console.log(error);
            }

        };


        // const fetchPosts = async () => {
                
        //     try {
        //         const { data } = await axios.get("https://backendk-z915.onrender.com/post/mango/getall");
        //         setPosts(data);
        //         console.log(data);
        //         } catch (err) {
        //         console.log(err);
        //         }
        //     };
    
        useEffect(() => {


            
            Content();
            // fetchPosts();
        },[]);

        

    return (
        <>
            <Head>
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
                     
        <div>
            <div className='  '>
    
            {/* <div className=' w-full border-1 rounded-2xl p-2  fixed justify-center z-10 bg-blue-400 md:block'>
                <header className='text-2xl font-bold'>
                    <h1>Hello Monu Mujara</h1>
                </header>
            </div> */}
                
            <div  className='grid grid-cols-1 md:grid-cols-[150px_1fr_300px]   '>
    
    
            {/* Starting of Left Sidebzr */}
            <div className='sticky top-10 h-screen overflow-y-auto w-full font-bold text-2xl my-0 border-1 border-gray-300 rounded-md hidden md:block'>

                        <h4 className='mx-2 my-4'>Worlds</h4>
                        <h4 className='mx-2 my-4'>Search</h4>
                        <h4 className='mx-2 my-4'>Account</h4>
                        <h4 className='mx-2 my-4'>Setting</h4>
                        <h4 className='mx-2 my-4'>Privacy</h4>
                        
    
                </div>
    
            {/* Starting of Main Content Area*/}

                <div className=" mt-10 px-4 space-y-6  w-full">

{/*             { posts.length > 0 ?
                (
                    posts.map((post, index) => 
                
                    (
                        <div key={index} className='border-1 rounded-lg border-gray-300 p-2'>


                            
                            <div className=' flex items-start gap-3 mb-4 '>
                            <Link href={`/profile/${post?.userId?.username}`}>
                            <img src={post?.UserId?.profilePic || "https://images.macrumors.com/t/5K1xePYg0aiVFhfzTAd8181ROw8=/800x0/article-new/2024/07/Apple-TV-Plus-Feature-2-Magenta-and-Blue.jpg?lossy"} alt="" className='w-10 h-10 rounded-full border-2 cursor-pointer' />
                            </Link>
                            <div className='flex flex-col'>
                            <Link href={`/profile/${post?.userId?.username}`}>
                            <span className='font-semibold text-md cursor-pointer'>{post?.userId?.username}</span>
                            </Link>
                            <p className='text-sx  text-gray-500'>{formatPostTime(post.createdAt)}</p>
                            </div>

                            <div className='font-bold ml-auto text-2xl text-gray-600 cursor-pointer '>...</div>
                        </div>
                        

                        <div className='rounded-xl overflow-hidden border border-gray-200 mt-2'>

                        
                        {post.media  ? (
                            post.media.endsWith(".mp4") ? (
                                
                                // <Link href={`/short/${post._id}` }>
                                // <video src={post.media || ""} className="w-full h-72 border- border-gray-300 rounded-xl object-cover "  muted
                                
                                // playsInline controls autoPlay />
                                // </Link>

                                <Link href={`/short/${post._id}`} passHref>
                                  <div className="w-full h-72 border border-gray-300 rounded-xl overflow-hidden cursor-pointer">
                                    <video
                                      src={post.media || ""}
                                      className="w-full h-full object-cover"
                                      muted
                                      loop
                                      playsInline
                                      preload="metadata"
                                      // 🚫 REMOVE controls and autoPlay to prevent conflict
                                    />
                                  </div>
                                </Link>

                                
                                
                            ) : (
                                <img src={post.media || ""} alt="Post" className=" w-full  h-auto border- border-gray-300 rounded-md object-cover " />
                            )
                            ) : (
                            <div ></div> // Fallback if media is missing
                            )}
                            
                        </div>

                        <div className='flex justify-between text-md text-gray-500 mt-3 px-4'>

                    
                    
                    
                    <p className='flex items-center gap-1 cursor-pointer hover:text-blue-500 transition'> like</p>
                    <p className='flex items-center gap-1 cursor-pointer hover:text-blue-500 transition'>comment</p>
                    <p className='flex items-center gap-1 cursor-pointer hover:text-blue-500 transition'>share</p>
                    <p className='flex items-center gap-1 cursor-pointer hover:text-blue-500 transition'>Save</p>
                    
                    </div>

                    </div>

                        

                    )
                )
                ) : ( 
                    <div class="mx-auto w-full max-w-sm rounded-md border border-blue-300 p-4">
                      <div class="flex animate-pulse space-x-4">
                        <div class="size-10 rounded-full bg-gray-200"></div>
                        <div class="flex-1 space-y-6 py-1">
                          <div class="h-2 rounded bg-gray-200"></div>
                          <div class="space-y-3">
                            <div class="grid grid-cols-3 gap-4">
                              <div class="col-span-2 h-2 rounded bg-gray-200"></div>
                              <div class="col-span-1 h-2 rounded bg-gray-200"></div>
                            </div>
                            <div class="h-2 rounded bg-gray-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                )

            } */}
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
                            <strong className='pt-2 '>Human Cant</strong>
                            
                            <p className='text-sm  text-gray-400'>{formatPostTime(post.timestamp)}</p>
                            </div>
                            
                            <div className='font-bold text-2xl ml-auto'>...</div>
                        </div>
                        
                    <p className='cursor-pointer mb-4'>{post.content}</p>
                    
                    <div className='flex justify-center'>
                    <img src={post.imageURL || ""}  className='w-auto  h-auto border-1 border-gray-300 rounded-2xl cursor-pointer'/>
                    </div>
                    </Link>
                    
                    </div>
                    
                    
                    
                     <div className='flex justify-between text-md text-gray-500 mt-3 px-4'>

                    
                    
                    
                    <p className='flex items-center gap-1 cursor-pointer hover:text-blue-500 transition'> like</p>
                    <p className='flex items-center gap-1 cursor-pointer hover:text-blue-500 transition'>comment</p>
                    <p className='flex items-center gap-1 cursor-pointer hover:text-blue-500 transition'>share</p>
                    <p className='flex items-center gap-1 cursor-pointer hover:text-blue-500 transition'>Save</p>
                    
                    </div>
                
                </div>
                    ))): (
                        
                            
                            <div role="status" class="max-w-sm p-4 border border-gray-200 rounded-sm shadow-sm animate-pulse md:p-6 dark:border-gray-700">
                                <div class="flex items-center mt-4">
                                   <svg class="w-10 h-10 me-3 text-gray-200 dark:text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                                    </svg>
                                    <div>
                                        <div class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2"></div>
                                        <div class="w-48 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                                    </div>
                                </div>
                                
                                <div class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                                <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                                
                                <span class="sr-only">Loading...</span>
                                
                                <div class="flex items-center justify-center h-48 mb-4 bg-gray-300 rounded-sm dark:bg-gray-700">
                                    <svg class="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 20">
                                        <path d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM10.5 6a1.5 1.5 0 1 1 0 2.999A1.5 1.5 0 0 1 10.5 6Zm2.221 10.515a1 1 0 0 1-.858.485h-8a1 1 0 0 1-.9-1.43L5.6 10.039a.978.978 0 0 1 .936-.57 1 1 0 0 1 .9.632l1.181 2.981.541-1a.945.945 0 0 1 .883-.522 1 1 0 0 1 .879.529l1.832 3.438a1 1 0 0 1-.031.988Z"/>
                                        <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"/>
                                    </svg>
                                </div>
                                
                            </div>


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
        </div>
        </>
        
    )
    
}

export default Posts;

















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
            


//         <Head>
//               <script
//                 type="application/ld+json"
//                 dangerouslySetInnerHTML={{
//                   __html: JSON.stringify({
//                     "@context": "https://schema.org",
//                     "@type": "SoftwareApplication",
//                     name: "Fond Peace AI",
//                     operatingSystem: "Web",
//                     applicationCategory: "Artificial Intelligence",
//                     offers: {
//                       "@type": "Offer",
//                       price: "0",
//                     },
//                     aggregateRating: {
//                       "@type": "AggregateRating",
//                       ratingValue: "4.9",
//                       ratingCount: "2500",
//                     },
//                     publisher: {
//                       "@type": "Organization",
//                       name: "Fond Peace AI",
//                       url: "https://www.fondpeace.com/",
//                       logo: {
//                         "@type": "ImageObject",
//                         url: "https://www.fondpeace.com/logo.png",
//                         width: 300,
//                         height: 300,
//                       },
//                     },
//                   }),
//                 }}
//               />
//             </Head>

            
//             <div >
    
                
//             <div  className='grid grid-cols-1 md:grid-cols-[150px_1fr_300px]   '>
    
    
//             {/* Starting of Left Sidebzr */}
//             <div className='sticky top-10 h-screen overflow-y-auto w-full font-bold text-2xl my-0 border-1 border-gray-300 rounded-md hidden md:block'>

//                         <h4 className='mx-2 my-4'>Worlds</h4>
//                         <h4 className='mx-2 my-4'>Search</h4>
//                         <h4 className='mx-2 my-4'>Account</h4>
//                         <h4 className='mx-2 my-4'>Setting</h4>
//                         <h4 className='mx-2 my-4'>Privacy</h4>
                        
    
//                 </div>
    
//             {/* Starting of Main Content Area*/}

//                 <div className=" mt-10 px-4 space-y-6  w-full">

//             { posts.length > 0 ?
//                 (
//                     posts.map((post, index) => 
                
//                     (
//                         <div key={index} className='border-1 rounded-lg border-gray-300 p-2'>


                            
//                             <div className=' flex items-start gap-3 mb-4 '>

//                             <img src={post?.UserId?.profilePic || "https://images.macrumors.com/t/5K1xePYg0aiVFhfzTAd8181ROw8=/800x0/article-new/2024/07/Apple-TV-Plus-Feature-2-Magenta-and-Blue.jpg?lossy"} alt="" className='w-10 h-10 rounded-full border-2' />

//                             <div className='flex flex-col'>
//                             <span className='font-semibold text-sm'>{post?.userId?.username}</span>
                            
//                             <p className='text-sx  text-gray-500'>{formatPostTime(post.createdAt)}</p>
//                             </div>

//                             <div className='font-bold ml-auto text-2xl text-gray-600 cursor-pointer '>...</div>
//                         </div>
                        

//                         <div className='rounded-xl overflow-hidden border border-gray-200 mt-2'>

                        
//                         {post.media  ? (
//                             post.media.endsWith(".mp4") ? (
                                
//                                 <Link href={`/video/${post._id}` }>
//                                 <video src={post.media || ""} className="w-full h-72 border- border-gray-300 rounded-xl object-cover "  muted
                                
//                                 playsInline controls autoPlay />
//                                 </Link>

                                
                                
//                             ) : (
//                                 <img src={post.media || ""} alt="Post" className=" w-full  h-auto border- border-gray-300 rounded-md object-cover " />
//                             )
//                             ) : (
//                             <div ></div> // Fallback if media is missing
//                             )}
                            
//                         </div>

//                         <div className='flex justify-between text-md text-gray-500 mt-3 px-4'>

                    
                    
                    
//                     <p className='flex items-center gap-1 cursor-pointer hover:text-blue-500 transition'> like</p>
//                     <p className='flex items-center gap-1 cursor-pointer hover:text-blue-500 transition'>comment</p>
//                     <p className='flex items-center gap-1 cursor-pointer hover:text-blue-500 transition'>share</p>
//                     <p className='flex items-center gap-1 cursor-pointer hover:text-blue-500 transition'>Save</p>
                    
//                     </div>

//                     </div>

                        

//                     )
//                 )
//                 ) : ( <div></div>

//                 )

//             }
//             {data.length > 0 ? 
//                 (
//                     data.slice().sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((post,index) => 
//                     (

//                         <div key={index} className='  border-1 border-gray-300 rounded-md h-auto'>
//                     <div className=' rounded-xl p-2 h-auto '>
                     
//                     <Link href={`/p/${post._id}`}>

//                         <div className=' flex gap-3 mb-6'>
//                             <img src="https://images.macrumors.com/t/5K1xePYg0aiVFhfzTAd8181ROw8=/800x0/article-new/2024/07/Apple-TV-Plus-Feature-2-Magenta-and-Blue.jpg?lossy" alt="" className='w-10 h-10 rounded-full border-2' />
    
//                             <div className=''>
//                             <strong className='pt-2 '>Human Cant</strong>
                            
//                             <p className='text-sm  text-gray-400'>{formatPostTime(post.timestamp)}</p>
//                             </div>
                            
//                             <div className='font-bold text-2xl ml-auto'>...</div>
//                         </div>
                        
//                     <p className='cursor-pointer mb-4'>{post.content}</p>
                    
//                     <div className='flex justify-center'>
//                     {/* <img src={post.imageURL || ""}  className='w-auto  h-auto border-1 border-gray-300 rounded-2xl'/> */}
//                     </div>
//                     </Link>
                    
//                     </div>
                    
                    
                    
//                     <div className='flex gap-1 justify-evenly md:p-2 border-1 border-gray-300  '>
                    
                    
                    
//                     <p className='cursor-pointer border-1 p-2  rounded-xl px-2'> like</p>
//                     <p className='cursor-pointer border-2 p-2 rounded-xl px-2'>comment</p>
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
//         </>
//     );
// }

// export default Posts;
//           }
