'use client';
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://backend-k.vercel.app/autoai/result?q=${query}`);
      const SearchResults = response.data.ScrapedData[0];
      setResults(SearchResults.results || []);
      setImages(SearchResults.images || []);
      // setImages(SearchResults.images || []);

      console.log("Results:", SearchResults.results);
      console.log("Images:", SearchResults.images);
    } catch (err) {
      setError("Error fetching results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex  items-center justify-center">
      <div className=" w-full px-2 py-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">Search Engine</h1>

        <form onSubmit={handleSearch} className="flex mb-6">
          <input
            type="text"
            className="p-3 w-full border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="p-3 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 focus:outline-none"
          >
            Search
          </button>
        </form>

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* General Images Section */}
        {images.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">Top Images</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Image ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-md"
                />
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="space-y-2">
          {results.length > 0 ? (
            results.map((result, index) => (
              <div key={index} className="border-b pb-2">
                <h2 className="text-xl font-semibold text-indigo-700">
                <a
                  href={result.link}
                  className="text-blue-600 hover:text-blue-800 mt-2 block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {result.title}
                </a>
                  </h2>
                <div className="flex gap-2">
                <p className="text-gray-700 mt-2 ">{result.snippet}</p>
                  <img src={result.thumbnail} className="h-28 w-auto object-cover rounded-md ml-auto md:block hidden" />
                </div>
                {result.images && result.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {result.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`Result Image ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            !loading && <p className="text-center text-gray-500">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;









// 'use client';

// import axios from "axios";
// import React, { useState, useEffect } from 'react';
// import Head from 'next/head';

// function App() {
//   const [data, setData] = useState([]);
//   const [query, setQuery] = useState('');
//   const [search, setSearch] = useState('');
//   const [explain, setexplain] = useState('');
//   const [image, setimage]  = useState([]);
//   const [Youtube, setYoutube] = useState([]);
//   const [loading, setloading] = useState(false);

//   const handleChange = (e) => {
//     setQuery(e.target.value);
//   };

//   const handleSearch = () => {
    
//     setSearch(query);
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       if (search) {
//         setloading(true);
//         try {
//           const response = await axios.get(`https://backendk-z915.onrender.com/autoai/search?q=${search}`);
//           const result = await response.data[0];
//           const sumarize = await response.data[1];
//           const images = await response.data[2];
//           const youtube_detail = await response.data[3]
//           // setimage(images);
//           console.log("Images",images);
//           setimage(images)
//           console.log(response)
//           // setexplain(sumarize);
//           setData(result);
//           setYoutube(youtube_detail);
//           console.log( result,sumarize)
//         } catch (error) {
//           console.error(error);``
//         }
//         finally{
//           setloading(false);
//         }
//       }
//     };
//     fetchData();
//   }, [search]);



//   //  Function to formate text with headings,lists,paragraph and code blocks 

//   const FormateText = (text) => {
//     if (!text) return null;
  
//     // Replace Markdown-style headings
//     text = text.replace(/^###\s(.+)/gm, "<h3 class='text-lg'>$1</h3>");
//     text = text.replace(/^####\s(.+)/gm, "<h4 class='text-md'>$1</h4>");
//     text = text.replace(/^##\s(.+)/gm, "<h2 class='text-lg'>$1</h2>");
//     text = text.replace(/^#\s(.+)/gm, "<h1 class='text-xl font-bold'>$1</h1>");
  
//     // Replace Markdown-style bullet points (- item or * item)
//     text = text.replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>");
//     text = text.replace(/^\* (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>");
//     text = text.replace(/(<li.+<\/li>)/g, "<ul>$1</ul>"); // Wrap list items in <ul>
  
//     // Replace triple backticks for code blocks
//     text = text.replace(
//       /```([\s\S]+?)```/g,
//       "<pre class='bg-gray-200 text-black text-md mb-2 p-2 rounded-md overflow-x-auto'><code>$1</code></pre>"
//     );
  
//     // Replace inline code using backticks (`code`)
//     text = text.replace(/`([^`]+)`/g, "<code class='bg-gray-200 px-1 py-0.5 rounded'>$1</code>");
  
//     // Bold and Italic
//     text = text.replace(/\*\*(.+?)\*\*/g, "<strong class='font-bold'>$1</strong>"); // **bold**
//     text = text.replace(/\*(.+?)\*/g, "<em class='italic'>$1</em>"); // *italic*
  
//     // Convert Markdown tables to HTML tables
//     text = text.replace(
//       /\|(.+?)\|\n\|[-:\s|]+\|\n((?:\|.+?\|\n?)+)/g,
//       (match, headers, rows) => {
//         const headerCells = headers
//           .split("|")
//           .map((h) => h.trim())
//           .filter((h) => h.length > 0)
//           .map((h) => `<th class='border p-2 bg-gray-200'>${h}</th>`)
//           .join("");
  
//         const rowCells = rows
//           .trim()
//           .split("\n")
//           .filter((row) => row.trim().length > 0)
//           .map((row) => {
//             const columns = row
//               .split("|")
//               .map((col) => col.trim())
//               .filter((col) => col.length > 0)
//               .map((col) => `<td class='border p-2'>${col}</td>`)
//               .join("");
//             return `<tr>${columns}</tr>`;
//           })
//           .join("");
  
//         return `<table class='border-collapse border border-gray-300 w-full my-4'>
//                   <thead><tr>${headerCells}</tr></thead>
//                   <tbody>${rowCells}</tbody>
//                 </table>`;
//       }
//     );
  
//     // Convert double newlines to paragraphs
//     text = text.replace(/\n{2,}/g, "</p><p class='mb-4'>");
  
//     // Wrap everything in <p> tags
//     return `<p class='mb-4'>${text}</p>`;
//   };
  
//   const ExplainText = ({ text }) => {
//     return text ? (
//       <div
//         className="border-blue-500 bg-white font-normal text-black w-full"
//         dangerouslySetInnerHTML={{ __html: FormateText(text) }}
//       />
//     ) : null;
//   };

// if(loading){
//   return ( <div className ="text-4xl font-bold inline-block align-middle">Loading Data...</div> );
// }
//   return (
//     <div className="m-1 mb-10"> 

//    <Head>
//         <title>Fond Peace AI Social Media Platform</title>
//         <meta name="description" content="Unlock the limitless potential of AI with Fond Peace AI. Experience cutting-edge AI-powered search, automation, content generation, and assistance tools—all for free. This is a platform where you can search anything like Google, Bing, and the web." />
//         <meta name="keywords" content="Fond Peace AI, free AI tools, AI search engine, AI assistant, AI automation, AI content generator, AI-powered search, AI chatbot, AI-driven solutions, AI-powered research, AI discovery, AI-powered learning, AI innovation, AI productivity, AI-powered applications, AI-powered insights, AI-powered recommendations, AI for everyone, next-gen AI, best free AI tools, AI-powered knowledge base, AI-driven search engine, AI-powered decision-making, AI-powered problem-solving, AI assistant for work and study, AI-powered writing tools, AI-powered creative solutions, chatgpt, openai, Claude AI, Grok AI, Elon Musk AI, search engine alternatives, written updates, Telly updates, Anupama, YRKKH, Bhagya Lakshmi, Dhruv Rathee, MacRumors, 9to5Mac, Apple Insider, Apple rumors, iPhone news, AI SEO optimization, 2025 Google SEO, AI-powered blogging, real-time AI answers, best AI tools 2025, AI automation for business, SEO AI tools, AI-driven marketing, Google core update 2025, AI-enhanced productivity, AI-generated content, machine learning trends 2025, AI-powered analytics, AI for digital marketing, AI SEO ranking strategies, how to rank on Google with AI, best AI-powered research tools" />
//         <meta name="robots" content="index, follow" />
//         <meta name="author" content="Fond Peace AI Team" />
//         <meta name="theme-color" content="#000000" />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <link rel="canonical" href="https://www.fondpeace.com/" />
        



//         {/* Open Graph Meta Tags */}
//         <meta property="og:type" content="website" />
//         <meta property="og:title" content="Fond Peace AI - Your Ultimate Free AI Assistant for Everything" />
//         <meta property="og:description" content="Experience the future of AI today! Search, create, and automate effortlessly with Fond Peace AI. Free AI-powered solutions for search, writing, automation, and more!" />
//         <meta property="og:url" content="https://www.fondpeace.com/" />
//         <meta property="og:image" content="https://www.fondpeace.com/og-image.jpg" />
//         <meta property="og:image:width" content="1200" />
//         <meta property="og:image:height" content="630" />
//         <meta property="og:site_name" content="Fond Peace AI" />
//         <meta property="og:locale" content="en_US" />

//         {/* Twitter Meta Tags */}
//         <meta name="twitter:card" content="summary_large_image" />
//         <meta name="twitter:title" content="Fond Peace AI - Explore Advanced AI Tools for Free" />
//         <meta name="twitter:description" content="Experience the future of AI today! Search, create, and automate effortlessly with Fond Peace AI. Free AI-powered solutions for search, writing, automation, and more!" />
//         <meta name="twitter:image" content="https://www.fondpeace.com/twitter-image.jpg" />
//         <meta name="twitter:site" content="@FondPeaceAI" />
//         <meta name="twitter:creator" content="@FondPeaceAI" />

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
   
//     <div className="m-4">
//       <h2 className="text-2xl font-bold text-center">Search Only Not Open</h2>
//     </div>
//     <div className="m-10 p-5 border-2 rounded-md">
//       <input type="text" value={query} onChange={handleChange} className="border-2 rounded-md w-full p-2 text-lg"/>
//       <button onClick={handleSearch} className="cursor-pointer w-full text-xl font-bold border-2 rounded-md mt-4 p-2 bg-blue-400 text-white">Search</button>
//       </div>
// {/*       {explain ? (
//       <div className=" border-2 rounded-md border-black md:p-6 p-2  ">
//             <ExplainText text={explain}/> 
//       </div>) : ( <div></div>)
      
//       } */}

//        <div className="">
//         {Youtube.map((index) =>(
//           <div key={index.id} className="border-2 rounded-md w-full mt-2 p-2">
//             <img src={index.thumbnail} alt="" className="w-full py-2" />
//           </div>
//         ))}
//       </div> 

//       <div className="grid grid-cols-4 gap-4 items-center">
//         {image?.length > 0 ? (
//           image.map((photo, index) => (
//             <div key={index} className="border-2 rounded-md w-60 h-40 flex justify-center items-center mt-2 p-2">
//               <img src={photo} alt="img" className="w-full h-full object-cover rounded-md " />
//             </div>
//           ))
//         ) : (
//           <p className="col-span-4 text-center">No images found</p>
//         )}
//       </div>


      
//         {/* <div className="videos">
//         {Youtube.map((video) => (
//           <div key={video.id} className="video-card">
//             <a href={video.url} target="_blank" rel="noopener noreferrer">
//               <img src={video.thumbnail} alt={video.title} className="thumbnail" />
//             </a>
//             <h3>{video.title}</h3>
//             <p>Channel: {video.channel}</p>
//             <p>Views: {video.views}</p>
//             <p>Likes: {video.likes}</p>
//           </div>
//         ))}
//         </div> */}


//       <ul >
//         {data.map((item, index) => (
//           <li key={index} className="mt-4 border-2 rounded-md p-1">
//             <h2 className="text-lg text-blue-600 "><a href={item.url} target="_blank">{item.title}</a></h2>
//             <p>{item.snippet}</p>
//             <a href={item.url} target="_blank" className="text-blue-500 font-bold">Read more</a>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default App;
