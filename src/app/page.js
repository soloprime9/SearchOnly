'use client';

import axios from "axios";
import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [explain, setexplain] = useState('');
  const [image, setimage]  = useState([]);
  const [Youtube, setYoutube] = useState([]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    
    setSearch(query);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (search) {
        try {
          const response = await axios.get(`https://sokara.vercel.app/search?q=${search}`);
          const result = await response.data[0];
          const sumarize = await response.data[1];
          const images = await response.data[2];
          const youtube_detail = await response.data[3]
          // setimage(images);
          console.log("Images",images);
          setimage(images)
          console.log(response)
          setexplain(sumarize);
          setData(result);
          setYoutube(youtube_detail);
          console.log( result,sumarize)
        } catch (error) {
          console.error(error);``
        }
      }
    };
    fetchData();
  }, [search]);



  //  Function to formate text with headings,lists,paragraph and code blocks

  const FormateText = (text) => {
    if (!text) return null;
  
    // Replace Markdown-style headings
    text = text.replace(/^###\s(.+)/gm, "<h3 class='text-lg'>$1</h3>");
    text = text.replace(/^####\s(.+)/gm, "<h4 class='text-md'>$1</h4>");
    text = text.replace(/^##\s(.+)/gm, "<h2 class='text-lg'>$1</h2>");
    text = text.replace(/^#\s(.+)/gm, "<h1 class='text-xl font-bold'>$1</h1>");
  
    // Replace Markdown-style bullet points (- item or * item)
    text = text.replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>");
    text = text.replace(/^\* (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>");
    text = text.replace(/(<li.+<\/li>)/g, "<ul>$1</ul>"); // Wrap list items in <ul>
  
    // Replace triple backticks for code blocks
    text = text.replace(
      /```([\s\S]+?)```/g,
      "<pre class='bg-gray-200 text-black text-md mb-2 p-2 rounded-md overflow-x-auto'><code>$1</code></pre>"
    );
  
    // Replace inline code using backticks (`code`)
    text = text.replace(/`([^`]+)`/g, "<code class='bg-gray-200 px-1 py-0.5 rounded'>$1</code>");
  
    // Bold and Italic
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong class='font-bold'>$1</strong>"); // **bold**
    text = text.replace(/\*(.+?)\*/g, "<em class='italic'>$1</em>"); // *italic*
  
    // Convert Markdown tables to HTML tables
    text = text.replace(
      /\|(.+?)\|\n\|[-:\s|]+\|\n((?:\|.+?\|\n?)+)/g,
      (match, headers, rows) => {
        const headerCells = headers
          .split("|")
          .map((h) => h.trim())
          .filter((h) => h.length > 0)
          .map((h) => `<th class='border p-2 bg-gray-200'>${h}</th>`)
          .join("");
  
        const rowCells = rows
          .trim()
          .split("\n")
          .filter((row) => row.trim().length > 0)
          .map((row) => {
            const columns = row
              .split("|")
              .map((col) => col.trim())
              .filter((col) => col.length > 0)
              .map((col) => `<td class='border p-2'>${col}</td>`)
              .join("");
            return `<tr>${columns}</tr>`;
          })
          .join("");
  
        return `<table class='border-collapse border border-gray-300 w-full my-4'>
                  <thead><tr>${headerCells}</tr></thead>
                  <tbody>${rowCells}</tbody>
                </table>`;
      }
    );
  
    // Convert double newlines to paragraphs
    text = text.replace(/\n{2,}/g, "</p><p class='mb-4'>");
  
    // Wrap everything in <p> tags
    return `<p class='mb-4'>${text}</p>`;
  };
  
  const ExplainText = ({ text }) => {
    return text ? (
      <div
        className="border-blue-500 bg-white font-normal text-black w-full"
        dangerouslySetInnerHTML={{ __html: FormateText(text) }}
      />
    ) : null;
  };


  return (
    <div className="m-1 mb-10"> 
    <div className="m-4">
      <h2 className="text-2xl font-bold text-center">Search Only Not Open</h2>
    </div>
    <div className="m-10 p-5 border-2 rounded-md">
      <input type="text" value={query} onChange={handleChange} className="border-2 rounded-md w-full p-2 text-lg"/>
      <button onClick={handleSearch} className="cursor-pointer w-full text-xl font-bold border-2 rounded-md mt-4 p-2 bg-blue-400 text-white">Search</button>
      </div>
      {explain ? (
      <div className=" border-2 rounded-md border-black md:p-6 p-2  ">
            <ExplainText text={explain}/>
      </div>) : ( <div></div>)
      
      }

      {/* <div className="">
        {Youtube.map((index) =>(
          <div key={index.id} className="border-2 rounded-md w-full mt-2 p-2">
            <img src={index.thumbnail} alt="" className="w-full py-2" />
          </div>
        ))}
      </div> */}

      <div className="grid grid-cols-4 gap-4 items-center">
        {image?.length > 0 ? (
          image.map((photo, index) => (
            <div key={index} className="border-2 rounded-md w-60 h-40 flex justify-center items-center mt-2 p-2">
              <img src={photo} alt="img" className="w-full h-full object-cover rounded-md " />
            </div>
          ))
        ) : (
          <p className="col-span-4 text-center">No images found</p>
        )}
      </div>


      
        {/* <div className="videos">
        {Youtube.map((video) => (
          <div key={video.id} className="video-card">
            <a href={video.url} target="_blank" rel="noopener noreferrer">
              <img src={video.thumbnail} alt={video.title} className="thumbnail" />
            </a>
            <h3>{video.title}</h3>
            <p>Channel: {video.channel}</p>
            <p>Views: {video.views}</p>
            <p>Likes: {video.likes}</p>
          </div>
        ))}
        </div> */}


      <ul >
        {data.map((item, index) => (
          <li key={index} className="mt-4 border-2 rounded-md p-1">
            <h2 className="text-lg text-blue-600 ">{item.title}</h2>
            <p>{item.snippet}</p>
            <a href={item.url} className="text-blue-500 font-bold">Read more</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
