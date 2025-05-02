// app/post/[id]/page.jsx
import { Metadata } from 'next';
import axios from 'axios';

export async function generateMetadata({ params }) {
  const { id } = params;
  try {
    const response = await axios.get(`https://backend-k.vercel.app/content/post/${id}`);
    const post = response.data;

    return {
      title: post.content ? `${post.content} | Fondpeace` : 'Fondpeace',
      description: post.content ? post.content.slice(0, 150) : 'Fondpeace latest post.',
      openGraph: {
        title: post.content ? post.content : 'Fondpeace Post',
        description: post.content ? post.content.slice(0, 150) : 'Fondpeace post content',
        images: [
          {
            url: post.imageURL || 'https://www.fondpeace.com/default-og-image.jpg',
            width: 800,
            height: 600,
          },
        ],
        url: `https://www.fondpeace.com/post/${id}`,
        type: 'article',
        article: {
      publishedTime: post.timestamp, // 👈 important for SEO
    },
      },
      twitter: {
        card: 'summary_large_image',
        title: post.content ? post.content : 'Fondpeace Post',
        description: post.content ? post.content.slice(0, 150) : 'Fondpeace post content',
        images: [post.imageURL || 'https://www.fondpeace.com/default-og-image.jpg'],
      },
    };
  } catch (error) {
    // console.error('Error fetching post data:', error);
    return {
      title: 'Fondpeace',
      description: 'Fondpeace latest post.',
      openGraph: {
        title: 'Fondpeace Post',
        description: 'Fondpeace post content',
        images: [
          {
            url: 'https://www.fondpeace.com/default-og-image.jpg',
            width: 800,
            height: 600,
          },
        ],
        url: `https://www.fondpeace.com/post/${id}`,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Fondpeace Post',
        description: 'Fondpeace post content',
        images: ['https://www.fondpeace.com/default-og-image.jpg'],
      },
    };
  }
}

export default async function PostPage({ params }) {
  const { id } = params;
  try {
    const response = await axios.get(`https://backend-k.vercel.app/content/post/${id}`);
    const post = response.data;

    return (
      <div className="md:mt-10">
        <div className="grid grid-cols-1 md:grid-cols-[150px_1fr_300px] h-screen">
          {/* Left Sidebar */}
          <div className="w-full font-bold text-2xl my-30 text-between hidden md:block">
            <h4 className="mx-2 my-4">Worlds</h4>
            <h4 className="mx-2 my-4">Search</h4>
            <h4 className="mx-2 my-4">Account</h4>
            <h4 className="mx-2 my-4">Setting</h4>
            <h4 className="mx-2 my-4">Privacy</h4>
          </div>

          {/* Main Content Area */}
          <div className="border-1 border-gray-300 rounded-md h-screen">
            <div className="rounded-xl h-auto w-full p-2">
              <div className="flex gap-2 mb-6">
                <img
                  src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360"
                  alt=""
                  className="w-10 h-10 rounded-full border-2"
                />
                <strong className="pt-2">Human Cant</strong>
                <div className="font-bold text-2xl md:ml-80 sm:ml-110 ml-50">...</div>
              </div>
              <p className="cursor-pointer mb-4">{post.content}</p>
              <div className="flex justify-center">
                <img
                  src={post.imageURL}
                  alt="hello"
                  className="w-auto h-auto border-1 border-gray-900 rounded-2xl"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-around p-2 border-1 border-gray-300">
              <p className="cursor-pointer border-2 p-2 px-4 rounded-xl">like</p>
              <p className="cursor-pointer border-2 p-2 rounded-xl px-4">comment</p>
              <p className="cursor-pointer border-2 rounded-xl p-2 px-4">share</p>
              <p className="cursor-pointer border-2 rounded-xl p-2 px-4">Save</p>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="justify-center text-center border-1 border-gray-300 p-4 mx-4 rounded-md hidden md:block">
            <div className="flex gap-10 mb-6">
              <div className="flex gap-2">
                <img
                  src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360"
                  alt=""
                  className="w-10 h-10 rounded-full border-2"
                />
                <strong className="pt-2 truncate">Human Cant</strong>
              </div>
              <button className="font-bold text-lg p-1 border-2 rounded-xl">Follow</button>
            </div>
            {/* Repeat the above block for additional items */}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // console.error('Error fetching post data:', error);
    return <div>Error loading post.</div>;
  }
}








// "use client";
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Head from 'next/head';
 
// function Single () {

//     const [data, setdata] = useState([]);
//  const [postId, setPostId] = useState('');
    
//     useEffect(() => {
//         const SinglePost = async() => {
//             const path = window.location.pathname;
//             const id = path.split("/").pop();
//             setPostId(id);
//             console.log(id);

//             try{
//             const response = await axios.get(`https://backend-k.vercel.app/content/post/${id}`);

//             setdata(response.data);
//             console.log(response.data);
//             }
//             catch(error){
//                 console.log(error);
//             }

//         };
//         SinglePost();
//     },[])

//     return (
//         <>
            
//             {/* SEO Head Section */}
//             <Head>
//                 <title>{data.content ? `${data.content} | Fondpeace` : "Fondpeace"}</title>
//                 <meta name="description" content={data.content ? data.content.slice(0, 150) : "Fondpeace latest post."} />
//                 <meta name="viewport" content="width=device-width, initial-scale=1" />
//                 <link rel="canonical" href={`https://www.fondpeace.com/post/${postId}`} />
                
//                 {/* OpenGraph Meta for Social Media Sharing */}
//                 <meta property="og:title" content={data.content ? data.content : "Fondpeace Post"} />
//                 <meta property="og:description" content={data.content ? data.content.slice(0, 150) : "Fondpeace post content"} />
//                 <meta property="og:image" content={data.imageURL ? data.imageURL : "https://www.fondpeace.com/default-og-image.jpg"} />
//                 <meta property="og:url" content={`https://www.fondpeace.com/post/${postId}`} />
//                 <meta property="og:type" content="article" />

//                 {/* Twitter Card Meta */}
//                 <meta name="twitter:card" content="summary_large_image" />
//                 <meta name="twitter:title" content={data.content ? data.content : "Fondpeace Post"} />
//                 <meta name="twitter:description" content={data.content ? data.content.slice(0, 150) : "Fondpeace post content"} />
//                 <meta name="twitter:image" content={data.imageURL ? data.imageURL : "https://www.fondpeace.com/default-og-image.jpg"} />
//             </Head>

//             <div className=' md:mt-10  '>

                
//             <div  className='grid grid-cols-1 md:grid-cols-[150px_1fr_300px] h-screen '>


//             {/* Starting of Left Sidebzr */}
//                 <div className=' w-full font=bold text-2xl my-30 text-between hidden md:block'>
//                         <h4 className='mx-2 my-4'>Worlds</h4>
//                         <h4 className='mx-2 my-4'>Search</h4>
//                         <h4 className='mx-2 my-4'>Account</h4>
//                         <h4 className='mx-2 my-4'>Setting</h4>
//                         <h4 className='mx-2 my-4'>Privacy</h4>
                        

//                 </div>

//             {/* Starting of Main Content Area         */}
//                 <div className=' border-1 border-gray-300 rounded-md h-screen'>
//                     <div className=' rounded-xl  h-auto w-full p-2'>

//                         <div className='flex gap-2 mb-6'>
//                             <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />

//                             <strong className='pt-2'>Human Cant</strong>
//                             <div className='font-bold text-2xl md:ml-80 sm:ml-110 ml-50'>...</div>
//                         </div>
                        
//                     <p className='cursor-pointer mb-4'>  {data.content}</p>
                    
//                     <div className='flex justify-center'>
//                     <img src={data.imageURL} alt="hello" className='w-auto  h-auto border-1 border-gray-900 rounded-2xl'/>
//                     </div>
                    
                    
//                     </div>
                    
//                     <div className='flex gap-2 justify-around p-2 border-1 border-gray-300 '>
                    
//                     <p className='cursor-pointer border-2 p-2  px-4 rounded-xl'> like</p>
//                     <p className='cursor-pointer border-2 p-2 rounded-xl px-4'>comment</p>
//                     <p className='cursor-pointer border-2 rounded-xl p-2 px-4'>share</p>
//                     <p className='cursor-pointer border-2 rounded-xl p-2 px-4'>Save</p>
                    
//                     </div>
                
//                 </div>


//             {/* Starting of RightSide bar */}
            
//                 <div className=' justify-center text-center border-1 border-gray-300 p-4 mx-4 rounded-md hidden md:block'>
                
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
//     )

// }

// export default Single;
