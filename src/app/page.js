'use client';

import axios from "axios";
import React, { useState, useEffect } from 'react';
import { FaSearch } from "react-icons/fa";

function App() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');

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
          const data = await response.data;
          setData(data);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchData();
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 p-6">
      {/* Glassmorphic Card */}
      <div className="max-w-3xl w-full p-6 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg">
        {/* Heading */}
        <h2 className="text-4xl font-bold text-white text-center mb-6">
          Explore The Web 🌍
        </h2>

        {/* Search Box */}
        <div className="flex items-center bg-white bg-opacity-20 p-3 rounded-lg shadow-md backdrop-blur-md">
          <FaSearch className="text-white text-xl mx-3" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            className="w-full bg-transparent text-white placeholder-gray-300 outline-none text-lg"
            placeholder="Search anything..."
          />
        </div>
        <button
          onClick={handleSearch}
          className="w-full mt-5 py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold text-xl rounded-lg shadow-md hover:scale-105 transition-all duration-300"
        >
          Search Now
        </button>
      </div>

      {/* Search Results */}
      <ul className="mt-8 w-full max-w-3xl space-y-6">
        {data.map((item, index) => (
          <li key={index} className="p-6 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-lg transition-all hover:scale-105">
            <h2 className="text-2xl font-semibold text-blue-300">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.title}
              </a>
            </h2>
            <p className="text-white mt-3">{item.snippet}</p>
            <a 
              href={item.url} 
              className="inline-block mt-4 text-white font-semibold hover:text-blue-200 transition-all"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Read More →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
