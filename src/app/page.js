'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

function Posts () {
    const [data, setData] = useState([]);
    const [loading, setloading] = useState(false);

    
        useEffect(() => {

            const Content = async () => {
            try{
                const response =  await axios.get('https://backend-k.vercel.app/content/get');
                
                setData(response.data);
                console.log("Data",response.data);
        
                }
                catch(error){
                    // console.log(error);
                }

            };
            Content();
        },[]);

        

    return (
        <div>
            <div className=' mt-10  '>
    
                
            <div  className='grid grid-cols-[150px_1fr_300px] relative'>
    
    
            {/* Starting of Left Sidebzr */}
            <div className='sticky top-10 h-screen overflow-y-auto w-full font-bold text-2xl my-0 border-1 border-gray-300 rounded-md'>

                        <h4 className='mx-2 my-4'>Worlds</h4>
                        <h4 className='mx-2 my-4'>Search</h4>
                        <h4 className='mx-2 my-4'>Account</h4>
                        <h4 className='mx-2 my-4'>Setting</h4>
                        <h4 className='mx-2 my-4'>Privacy</h4>
                        
    
                </div>
    
            {/* Starting of Main Content Area*/}

                <div className="  py- px-4 space-y-6  ">
            {data.length > 0 ? 
                (
                    data.slice().sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((post,index) => 
                    (

                        <div key={index} className='  border-1 border-gray-300 rounded-md h-auto'>
                    <div className=' rounded-xl p-2 h-auto '>
                     
                    <Link href={`/p/${post._id}`}>

                        <div className=' flex gap-3 mb-6'>
                            <Image src="https://images.macrumors.com/t/5K1xePYg0aiVFhfzTAd8181ROw8=/800x0/article-new/2024/07/Apple-TV-Plus-Feature-2-Magenta-and-Blue.jpg?lossy" alt="" className='w-10 h-10 rounded-full border-2' />
    
                            <div className=''>
                            <strong className='pt-2 '>Human Cant</strong>
                            
                                                                                                  {/* <p className='text-sm  text-gray-400'>{formatPostTime(post.timestamp)}</p>*\}
                            </div>
                            
                            <div className='font-bold text-2xl ml-70 '>...</div>
                        </div>
                        
                    <p className='cursor-pointer mb-4'>{post.content}</p>
                    
                    <div className='flex justify-center'>
                    <Image src="https://indianexpress.com/wp-content/uploads/2025/04/Pope-death-4.jpg?resize=1536,864" alt="hello" className='w-auto  h-auto border-1 border-gray-300 rounded-2xl'/>
                    </div>
                    </Link>
                    
                    </div>
                    
                    
                    
                    <div className='flex gap-2 justify-around p-2 border-1 border-gray-300 '>
                    
                    
                    
                    <p className='cursor-pointer border-2 p-2  px-4 rounded-xl'> like</p>
                    <p className='cursor-pointer border-2 p-2 rounded-xl px-4'>comment</p>
                    <p className='cursor-pointer border-2 rounded-xl p-2 px-4'>share</p>
                    <p className='cursor-pointer border-2 rounded-xl p-2 px-4'>Save</p>
                    
                    </div>
                
                </div>
                    ))): (
                        <div>hello dear </div>
                    )
                }
    
    </div>
            {/* Starting of RightSide bar */}
            
            <div className='sticky top-10 h-screen overflow-y-auto justify-center text-center border-1 border-gray-300 p-4 mx-4 rounded-md'>

                
                <div className='flex  gap-10 mb-6  '>
                            <div className='flex gap-2'>
                            <Image src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
                            <strong className='pt-2 truncate  '>Human Cant</strong>
                            </div>
    
    
                            <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
                        </div> 
    
                        <div className='flex  gap-10 mb-6  '>
                            <div className='flex gap-2'>
                            <Image src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
                            <strong className='pt-2 truncate  '>Human Cant</strong>
                            </div>
    
    
                            <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
                        </div> 
    
                        <div className='flex  gap-10 mb-6  '>
                            <div className='flex gap-2'>
                            <Image src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
                            <strong className='pt-2 truncate  '>Human Cant</strong>
                            </div>
    
    
                            <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
                        </div> 
    
                        <div className='flex  gap-10 mb-6  '>
                            <div className='flex gap-2'>
                            <Image src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
                            <strong className='pt-2 truncate  '>Human Cant</strong>
                            </div>
    
    
                            <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
                        </div> 
    
                        <div className='flex  gap-10 mb-6  '>
                            <div className='flex gap-2'>
                            <Image src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />
    
                            <strong className='pt-2 truncate  '>Human Cant</strong>
                            </div>
    
    
                            <button className='font-bold text-lg p-1 border-2 rounded-xl'>Follow</button>
    
                            
                        </div> 
                </div>
    
                </div>
            
    
            </div>
        </div>
    );
}  
export default Posts;
