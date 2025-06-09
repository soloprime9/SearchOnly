'use client';
import { Metadata } from 'next';
import axios from 'axios';
import { formatPostTime } from '@/components/DateFormate';
import LatestVideo from "@/components/LatestVideo";
import SafeImage from "@/components/SafeImage";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
const router = useRouter();
const relatedRefs = useRef({});


export default async function PostPage({ params }) {
  const { id } = params;
  try {
    const response = await axios.get(`https://backend-k.vercel.app/content/post/${id}`);
    const post = response.data.post;
    const relatedPosts = response.data.relatedPosts; // 👈 add this line

      useEffect(() => {
      if (!relatedPosts.length) return;
    
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const postId = entry.target.getAttribute('data-post-id');
              router.replace(`/post/${postId}`, { scroll: false });
            }
          });
        },
        {
          threshold: 0.5, // 50% visible → change URL
        }
      );
    
      // Observe all related post refs
      Object.values(relatedRefs.current).forEach((ref) => {
        if (ref) observer.observe(ref);
      });
    
      return () => {
        // Cleanup observer
        Object.values(relatedRefs.current).forEach((ref) => {
          if (ref) observer.unobserve(ref);
        });
      };
    }, [relatedPosts, router]);


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
          <div className=" border-gray-300 rounded-md h-screen">
            <div className="border-1 rounded-xl h-auto w-full p-2">
              <div className="flex gap-2 mb-6">
                <img
                  src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360"
                  alt=""
                  className="w-10 h-10 rounded-full border-2"
                />
                <strong className="pt-2">Human Cant</strong>
                <p className='text-sm  text-gray-400'>{formatPostTime(post.timestamp)}</p>

                <div className="font-bold text-2xl ml-auto">...</div>
              </div>
              <p className="cursor-pointer mb-4">{post.content}</p>
              <div className="flex justify-center">
                <SafeImage
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

           
           
            {/* RELATED POSTS */}
             <div className="p-4 mt-6 border-t border-gray-300">
              <h2 className="text-xl font-bold mb-6 text-center justify-center">Related Posts</h2>
              {relatedPosts && relatedPosts.length > 0 ? (
                relatedPosts
                  .slice()
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((relatedPost) => (
                    <div
                        key={relatedPost._id}
                        ref={(el) => (relatedRefs.current[relatedPost._id] = el)}
                        data-post-id={relatedPost._id}
                        className="mb-4 p-4 border border-gray-200 rounded-md"
                      >

                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={relatedPost.userImageURL || '/default-user.png'}
                          alt="User"
                          className="w-8 h-8 rounded-full border"
                        />
                        <strong>{relatedPost.username || 'Unknown User'}</strong>
                        <p className="text-sm text-gray-400 ml-auto">
                          {formatPostTime(relatedPost.timestamp)}
                        </p>
                      </div>
            
                      <p className="font-semibold mb-2">{relatedPost.content}</p>
            
                      {relatedPost.imageURL && (
                        <SafeImage
                          src={relatedPost.imageURL}
                          alt="Related post"
                          className="w-auto h-auto rounded-md mb-2"
                        />
                      )}
            
                      <div className="flex gap-2 justify-around mt-2">
                        <p className="cursor-pointer border-2 p-1 px-3 rounded-xl text-sm">Like</p>
                        <p className="cursor-pointer border-2 p-1 px-3 rounded-xl text-sm">Comment</p>
                        <p className="cursor-pointer border-2 p-1 px-3 rounded-xl text-sm">Share</p>
                        <p className="cursor-pointer border-2 p-1 px-3 rounded-xl text-sm">Save</p>
                      </div>
                    </div>
                  ))
              ) : (
                <p>No related posts found.</p>
              )}
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
              <button className="font-bold text-lg p-1 border-2 rounded-xl">Profile</button>
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

