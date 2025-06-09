// app/post/[id]/page.jsx
import { Metadata } from 'next';
import axios from 'axios';
import { formatPostTime } from '@/components/DateFormate';
import LatestVideo from "@/components/LatestVideo";
import SafeImage from "@/components/SafeImage";
 

export async function generateMetadata({ params }) {
  const { id } = params;
  try {
    const response = await axios.get(`https://backend-k.vercel.app/content/post/${id}`);
    const post = response.data;
    const content = typeof post.content === 'string' && post.content.trim().length > 0
    ? post.content.trim()
    : null;

  
    return {
      title: content ? `${content.slice(0, 60)} | Fondpeace` : 'Fondpeace',
      description: content ? content.slice(0, 150) : 'Fondpeace latest post.',
      keywords: "Anupamaa written update, Anupamaa full episode, Ghum Hai Kisikey Pyaar Meiin update, Ghum Hai Kisikey Pyaar Meiin full episode, Yeh Rishta Kya Kehlata Hai update, Yeh Rishta Kya Kehlata Hai full episode, Mangal Lakshmi update, Mangal Lakshmi full episode, Ram Bhavan update, Ram Bhavan full episode, Veer Hanuman update, Veer Hanuman full episode, Mannat Har Khushi Paane Ki update, Mannat Har Khushi Paane Ki full episode, Shiv Shakti Tap Tyaag Tandav update, Shiv Shakti Tap Tyaag Tandav full episode, Pavithram update, Pavithram full episode, Ilakkiya update, Ilakkiya full episode, Heart Beat season 2 update, Heart Beat season 2 full episode, Devika and Danny update, Devika and Danny full episode, Sivarapalli update, Sivarapalli full episode, Sammelanam update, Sammelanam full episode, Taarak Mehta Ka Ooltah Chashmah update, Taarak Mehta Ka Ooltah Chashmah full episode, Wagle Ki Duniya update, Wagle Ki Duniya full episode, Jagriti update, Jagriti full episode, Bheema Andhkaar Se Adhikaar Tak update, Bheema Andhkaar Se Adhikaar Tak full episode, Kaise Mujhe Tum Mil Gaye update, Kaise Mujhe Tum Mil Gaye full episode, Parineeti update, Parineeti full episode, Jamai No.1 update, Jamai No.1 full episode, Megha Barsenge update, Megha Barsenge full episode, Jaadu Teri Nazar update, Jaadu Teri Nazar full episode, Zyada Mat Udd update, Zyada Mat Udd full episode, Meri Bhavya Life update, Meri Bhavya Life full episode, Udne Ki Aasha update, Udne Ki Aasha full episode, Advocate Anjali Awasthi update, Advocate Anjali Awasthi full episode, Bhagya Lakshmi update, Bhagya Lakshmi full episode, Kumkum Bhagya update, Kumkum Bhagya full episode, Pushpa Impossible update, Pushpa Impossible full episode, Shirdi Wale Sai Baba update, Shirdi Wale Sai Baba full episode, Shrimad Ramayan update, Shrimad Ramayan full episode, Tenali Rama update, Tenali Rama full episode, Vasudha update, Vasudha full episode, Indian TV serials 2025, Hindi serials 2025, latest TV serials India, TV serial written updates, watch full episodes online, Desi TV serials, Indian drama series, TV serial gossip, serial news 2025, trending TV shows India, top Indian serials 2025, daily soap updates, serial episode recap, watch serial online, streaming Indian serials, TV serial highlights, serial episode summary, Indian television updates, Star Plus serials, Zee TV serials, Colors TV serials, Sony TV serials, JioCinema serials, Hotstar serials, Netflix India series, Amazon Prime Video India series, Disney+ Hotstar India series, ETV Win series, Asianet serials, Tamil serials 2025, Telugu serials 2025, Malayalam serials 2025, Kannada serials 2025, Bengali serials 2025, Marathi serials 2025, Gujarati serials 2025, Punjabi serials 2025, Odia serials 2025, Assamese serials 2025, best Indian TV shows 2025, top TRP shows India 2025, new Indian serials May 2025, upcoming Indian TV shows 2025, Indian TV serial schedules 2025, Indian TV serial timings 2025, Indian TV serial cast 2025, Indian TV serial storylines 2025, Indian TV serial spoilers 2025, Indian TV serial reviews 2025, Indian TV serial ratings 2025, Indian TV serial episodes 2025, Indian TV serial trailers 2025, Indian TV serial promos 2025, Indian TV serial behind the scenes 2025, Indian TV serial interviews 2025, Indian TV serial news 2025, Indian TV serial updates 2025, Indian TV serial fan theories 2025, Indian TV serial discussions 2025, Indian TV serial forums 2025, Indian TV serial blogs 2025, Indian TV serial recaps 2025, Indian TV serial summaries 2025, Indian TV serial analyses 2025, Indian TV serial critiques 2025, Indian TV serial commentaries 2025, Indian TV serial insights 2025, Indian TV serial breakdowns 2025, Indian TV serial explanations 2025, Indian TV serial interpretations 2025, Indian TV serial perspectives 2025, Indian TV serial opinions 2025, Indian TV serial thoughts 2025, Indian TV serial reactions 2025, Indian TV serial impressions 2025, Indian TV serial feedback 2025, Indian TV serial responses 2025, Indian TV serial observations 2025, Indian TV serial notes 2025, Indian TV serial annotations 2025, Indian TV serial remarks 2025, Indian TV serial statements 2025, Indian TV serial declarations 2025, Indian TV serial announcements 2025, Indian TV serial proclamations 2025, Indian TV serial communications 2025, Indian TV serial messages 2025, Indian TV serial bulletins 2025, Indian TV serial reports 2025, Indian TV serial articles 2025, Indian TV serial features 2025, Indian TV serial stories 2025, Indian TV serial narratives 2025, Indian TV serial accounts 2025, Indian TV serial chronicles 2025, Indian TV serial tales 2025, Indian TV serial yarns 2025, Indian TV serial sagas 2025, Indian TV serial epics 2025, Indian TV serial legends 2025, Indian TV serial myths 2025, Indian TV serial fables 2025, Indian TV serial parables 2025, Indian TV serial allegories 2025, Indian TV serial anecdotes 2025, Indian TV serial memoirs 2025, Indian TV serial biographies 2025, Indian TV serial autobiographies 2025, Indian TV serial diaries 2025, Indian TV serial journals 2025, Indian TV serial logs 2025, Indian TV serial records 2025, Indian TV serial archives 2025, Indian TV serial documents 2025, Indian TV serial files 2025, Indian TV serial data 2025, Indian TV serial information 2025, Indian TV serial intelligence 2025, Indian TV serial knowledge 2025, Indian TV serial wisdom 2025, Indian TV serial understanding 2025, Indian TV serial comprehension 2025, Indian TV serial awareness 2025, Indian TV serial perception 2025, Indian TV serial insight 2025, Indian TV serial acumen 2025, Indian TV serial discernment 2025, Indian TV serial sagacity 2025, Indian TV serial prudence 2025, Indian TV serial foresight 2025, Indian TV serial prescience 2025, Indian TV serial clairvoyance 2025, Indian TV serial intuition 2025, Indian TV serial instinct 2025, Indian TV serial hunch 2025, Indian TV serial gut feeling 2025, Indian TV serial sixth sense 2025, Indian TV serial extrasensory perception 2025, Indian TV serial telepathy 2025, Indian TV serial mind reading 2025, Indian TV serial thought transference 2025, Indian TV serial mentalism 2025, Indian TV serial psychism 2025, Indian TV serial spiritualism 2025, Indian TV serial mysticism 2025, Indian TV serial occultism 2025, Indian TV serial esotericism 2025, Indian TV serial arcane knowledge 2025, Indian TV serial hidden wisdom 2025, Indian TV serial secret teachings 2025, Indian TV serial ancient knowledge 2025, Indian TV serial sacred texts 2025, Indian TV serial scriptures 2025, Indian TV serial holy books 2025, Indian TV serial religious writings 2025, Indian TV serial spiritual literature 2025, Indian TV serial devotional texts 2025, Indian TV serial theological works 2025, Indian TV serial doctrinal treatises 2025, Indian TV serial catechisms 2025, Indian TV serial creeds 2025, Indian TV serial confessions of faith 2025, Indian TV serial religious doctrines 2025, Indian TV serial belief systems 2025, Indian TV serial faith traditions 2025, Indian TV serial religious practices 2025, Indian TV serial rituals 2025, Indian TV serial ceremonies 2025, Indian TV serial worship services 2025, Indian TV serial liturgies 2025, Indian TV serial sacraments 2025, Indian TV serial religious observances 2025, Indian TV serial holy days 2025, Indian TV serial festivals 2025, Indian TV serial religious holidays 2025, Indian TV serial sacred times 2025, Indian TV serial spiritual seasons 2025, Indian TV serial liturgical calendars 2025, Indian TV serial ecclesiastical years 2025, Indian TV serial church calendars 2025, Indian TV serial religious schedules 2025, Indian TV serial devotional routines 2025, Indian TV serial prayer times 2025, Indian TV serial meditation sessions 2025, Indian TV serial spiritual exercises 2025, Indian TV serial religious disciplines 2025, Indian TV serial ascetic practices 2025, Indian TV serial monastic rules 2025, Indian TV serial religious vows 2025, Indian TV serial sacred commitments 2025, Indian TV serial spiritual pledges 2025, Indian TV serial holy oaths 2025, Indian TV serial religious promises 2025, Indian TV serial faith-based resolutions 2025, Indian TV serial spiritual determinations 2025, Indian TV serial religious intentions 2025, Indian TV serial devotional aspirations 2025, Indian TV serial sacred goals 2025, Indian TV serial spiritual objectives 2025, Indian TV serial religious missions 2025, Indian TV serial faith-driven purposes 2025, Indian TV serial divine callings 2025, Indian TV serial holy vocations 2025, Indian TV serial spiritual careers 2025, Indian TV serial religious professions 2025, Indian TV serial ministerial roles 2025, Indian TV serial clerical positions,tellyupdates, telly updates, written update, bhagya lakshmi, yrkkh, ghkkpm, brazzer, xhamster, blacked.com, brazzer.com, jav.guru, trump, mia khalifa, alyx star, angela white, SexVid, XNXX, XVideos, xHamster, YouPorn, Porn, Porn 300, MegaTube, PornHub,PicHunter, HotPornPhotos, Vjav, Zenra, HentaiHaven, Hentaigasm, Fakku, Porcore, CartoonPorno, GayMaleTube, ManPorn, YouPornGay, GayFuror, JustUsBoys, MyPornGay, XXXFollow, TikPorn, Onlyfans, OnlyFans, Lesbian8, GirlsWay, MilfPorn, Nutaku, PornGamesHub, 69Games, GamCore, SexEmulator, Brazzers, Reality Kings, Digital Playground, FapHouse, BangBros, NewSensations, ElegantAngel, Jav HD, NaughtyAmerica, AdultTime, Mofos, Twistys, TeamSkeet, Private, VideoZ, TeenMegaWorld, All Japanese Pass, 18Videoz, DorcelClub, ClubTug, BestPayPornSites, BangStars, RichMen, SexMessenger, AdultFriendFinder, FindAFuckBuddy, Bellesa, Cheex, AVN, Maxim, MensHealth, NakedNews, Forum.AdultDVDTalk, OneNight Friend, Motherless, Fansteek, Porntube, OnlyFaps, Eporner, Omegle, Flingster, Javhd, PrincessCum, BigTitCreampie, Cum4K, CreampieHer, FarEastPornhub, Cat3Korean, Korea1818, Koreaporn.Net, Sexbj, KoreanInHD, Reddit Nsfw, Reddit Gonewild, Reddit Porn, Reddit Hentai, Reddit Ass, Reddit Pussy, Reddit Blowjobs, Reddit Cumsluts, Desipapa, Sunnyleone, Indiangfvideos, Indianbabeshanaya, Indianhiddencams, Fuckmyindiangf, Delhisexchat, Theiindianporn, Jabcomix, Crazyxx3dworld, Welcomix, Orgymania, Savitabhabhi, Tastyblacks, Nudeafrica, Ghettotube, Shegotass, Hoodamateurs, NudoStar, ThotHub, PornTN, DirtyShip, TheLeaksBay, SexyEgirls, BitchesGirls, OnlyFansLeaks.TV, Roundandbrown, Blackvalleygirls, Blackpatrol,Brownbunnies, Blackgfs, Javhihi, Javmost, Javfinder, Javfor, Vjav, Javseen, Javguru, Javout, Javqd, Popjav, Javwhoes, Whatchjavaonline, Kissjav, Xkorean, Javjack, Sextop, Javfun, Javleak, Javbraze, Javfhd, Javdeal, Tushy, Assparade, Holed, Asstraffic, Analized, Teensloveanal, Letstryanal, pornhub, xvideos, xhamster, rutube.ru, yandex, xnxx.tv, Patreon.com, Cityheaven.net, AllBlackX, Hulu, Punishworld.com, xhamster.desi, Dark porn, PornBoss, PornHat, gotporn, Redtube",
      openGraph: {
        title: post.content ? post.content : 'Fondpeace Post',
        description: post.content ? post.content.slice(0, 150) : 'Fondpeace post content',
        images: [
          {
            url: post.imageURL || 'https://www.fondpeace.com/og-image.jpg',
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
        images: [post.imageURL || 'https://www.fondpeace.com/og-image.jpg'],
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
            url: 'https://www.fondpeace.com/og-image.jpg',
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
        images: ['https://www.fondpeace.com/og-image.jpg'],
      },
    };
  }
}

export default async function PostPage({ params }) {
  const { id } = params;
  try {
    const response = await axios.get(`https://backend-k.vercel.app/content/post/${id}`);
    const post = response.data.post;
    const relatedPosts = response.data.relatedPosts; // 👈 add this line

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
               <h2 className="text-xl font-bold mb-4">Related Posts</h2>
               {relatedPosts && relatedPosts.length > 0 ? (
                 relatedPosts.map((relatedPost) => (
                   <div key={relatedPost._id} className="mb-6 p-4 border border-gray-200 rounded-md">
                     
                     {/* RELATED POST HEADER */}
                     <div className="flex gap-2 mb-4">
                       <img
                         src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360"
                         alt=""
                         className="w-10 h-10 rounded-full border-2"
                       />
                       <strong className="pt-2">Human Cant</strong> {/* You can replace with relatedPost.user if you have */}
                       <p className="text-sm text-gray-400">{formatPostTime(relatedPost.timestamp)}</p>
             
                       <div className="font-bold text-2xl ml-auto">...</div>
                     </div>
             
                     {/* RELATED POST CONTENT */}
                     <p className="cursor-pointer mb-4">{relatedPost.content}</p>
             
                     {/* RELATED POST IMAGE */}
                     {relatedPost.imageURL && (
                       <div className="flex justify-center mb-4">
                         <SafeImage
                           src={relatedPost.imageURL}
                           alt="Related post"
                           className="w-auto h-auto border-1 border-gray-900 rounded-2xl"
                         />
                       </div>
                     )}
             
                     {/* RELATED POST ACTIONS */}
                     <div className="flex gap-2 justify-around p-2 border-1 border-gray-300">
                       <p className="cursor-pointer border-2 p-2 px-4 rounded-xl">like</p>
                       <p className="cursor-pointer border-2 p-2 rounded-xl px-4">comment</p>
                       <p className="cursor-pointer border-2 rounded-xl p-2 px-4">share</p>
                       <p className="cursor-pointer border-2 rounded-xl p-2 px-4">Save</p>
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


//                             <button className='font-bold text-lg p-1 border-2 rounded-xl'>Profile</button>

                            
//                         </div> 

//                         <div className='flex  gap-10 mb-6  '>
//                             <div className='flex gap-2'>
//                             <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />

//                             <strong className='pt-2 truncate  '>Human Cant</strong>
//                             </div>


//                             <button className='font-bold text-lg p-1 border-2 rounded-xl'>Profile</button>

                            
//                         </div> 

//                         <div className='flex  gap-10 mb-6  '>
//                             <div className='flex gap-2'>
//                             <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />

//                             <strong className='pt-2 truncate  '>Human Cant</strong>
//                             </div>


//                             <button className='font-bold text-lg p-1 border-2 rounded-xl'>Profile</button>

                            
//                         </div> 

//                         <div className='flex  gap-10 mb-6  '>
//                             <div className='flex gap-2'>
//                             <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />

//                             <strong className='pt-2 truncate  '>Human Cant</strong>
//                             </div>


//                             <button className='font-bold text-lg p-1 border-2 rounded-xl'>Profile</button>

                            
//                         </div> 

//                         <div className='flex  gap-10 mb-6  '>
//                             <div className='flex gap-2'>
//                             <img src="https://images.news18.com/ibnlive/uploads/2024/10/apple-iphone-16-pro-review-2024-10-b233e14934d84136a958a7037a4011aa-16x9.jpg?impolicy=website&width=640&height=360" alt="" className='w-10 h-10 rounded-full border-2' />

//                             <strong className='pt-2 truncate  '>Human Cant</strong>
//                             </div>


//                             <button className='font-bold text-lg p-1 border-2 rounded-xl'>Profile</button>

                            
//                         </div> 
//                 </div>

//                 </div>
            

//             </div>
//         </>
//     )

// }

// export default Single;
