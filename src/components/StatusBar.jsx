'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const MobileTopNavBar = () => {
  const router = useRouter();

  const ListId = [
  "68a6d4cd57e57fe75c4f4dd2",
  "68a6d55057e57fe75c4f4dd4",
  "68a6d4cd57e57fe75c4f4dd2",
  "68a6d55057e57fe75c4f4dd4",
  "68a6d4cd57e57fe75c4f4dd2",
  "68a6d55057e57fe75c4f4dd4",
  "68fec8cb370dc6724fcc86a9"
];


  const HandleVideoId = () => {
    const single = ListId[Math.floor(Math.random() * ListId.length)];
    router.push(`/short/${single}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-300 shadow-md pt-2">
      <div className="flex justify-around items-center py-2">
        <Link href="/">
          <a className="flex flex-col items-center text-xs text-gray-700 hover:text-blue-600">
            {/* Home icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v6m4 0v-6m0 0l2 2" />
            </svg>
            Home
          </a>
        </Link>

        <button
          onClick={HandleVideoId}
          className="flex flex-col items-center text-xs text-gray-700 hover:text-blue-600 focus:outline-none"
          aria-label="Shorts"
        >
          {/* Video/Shorts icon (play button) */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="currentColor" viewBox="0 0 24 24" stroke="none">
            <path d="M8 5v14l11-7z" />
          </svg>
          Shorts
        </button>

        <Link href="/upload">
          <a className="flex flex-col items-center text-xs text-gray-700 hover:text-blue-600">
            {/* Upload icon (cloud upload) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9m0-9l-3 3m3-3l3 3M16 8l-4-4-4 4" />
            </svg>
            Upload
          </a>
        </Link>

        <Link href="/signup">
          <a className="flex flex-col items-center text-xs text-gray-700 hover:text-blue-600">
            {/* Profile icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A11.954 11.954 0 0112 15c2.236 0 4.312.656 6.121 1.804M15 11a3 3 0 10-6 0 3 3 0 006 0z" />
            </svg>
            Profile
          </a>
        </Link>
      </div>
    </div>
  );
};

export default MobileTopNavBar;
