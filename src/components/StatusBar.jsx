'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const MobileTopNavBar = () => {
  const router = useRouter();

  const ListId = ["6822f740837865db851a8fd9","6822f65b837865db851a8fd6", "6822f5e2837865db851a8fd3", "6822e769a506ae6cbbc9bf52", "6822e715a506ae6cbbc9bf4f", "6822e672a506ae6cbbc9bf4c", "6822e645a506ae6cbbc9bf49", "6810749cb98938fd31f6d35b", "68107476b98938fd31f6d358", "68107451b98938fd31f6d355", "6810742ab98938fd31f6d351", "67b28584f090c59509bdaf10", "67b1875a94bde7d066dfcd05", "67b1849f6a9b31f132629d81", "67b184166a9b31f132629d7e", "67aeddfb00c49d67169a054f", "67ab201887be7041220810d4" ]




  const HandleVideoId = () =>{

  const single = ListId[Math.floor(Math.random() * ListId.length)];
  router.push(`/short/${single}`);
  
  // console.log(single);

  
  }



  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-b border-gray-200 shadow-sm">
      <div className="flex justify-around items-center py-2">
        <Link href="/">
        <button className="flex flex-col items-center text-sm text-gray-700 hover:text-blue-600">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 12l2-2m0 0l7-7 7 7m-9 2v6m4 0v-6m0 0l2 2" />
          </svg>
          
        </button>
        </Link>

        
        <button onClick={HandleVideoId} className="flex flex-col items-center text-sm text-gray-700 hover:text-blue-600">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 10l4.553 2.276a1 1 0 010 1.448L15 16m-6 0V8m0 0l6 4-6 4z" />
          </svg>
          
        </button>
        

        <Link href="/search"> 
        <button className="flex flex-col items-center text-sm text-gray-700 hover:text-blue-600">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2z" />
          </svg>
          
        </button>
        </Link>
        <Link href="/signup">
        <button className="flex flex-col items-center text-sm text-gray-700 hover:text-blue-600">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5.121 17.804A11.954 11.954 0 0112 15c2.236 0 4.312.656 6.121 1.804M15 11a3 3 0 10-6 0 3 3 0 006 0z" />
          </svg>
          
        </button>
          </Link>
      </div>
    </div>
  );
};

export default MobileTopNavBar;
