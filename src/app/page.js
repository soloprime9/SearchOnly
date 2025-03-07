'use client';

import axios from "axios";
import React, { useState, useEffect } from 'react';

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
    <div className="m-4 mb-10 max-w-2xl mx-auto">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Search Results</h2>
      </div>

      {/* Search Box */}
      <div className="mt-6 p-5 border border-gray-300 rounded-lg shadow-md">
        <input 
          type="text" 
          value={query} 
          onChange={handleChange} 
          className="border w-full p-3 text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter your search term..."
        />
        <button 
          onClick={handleSearch} 
          className="w-full text-lg font-semibold border rounded-md mt-4 py-3 bg-blue-500 text-white hover:bg-blue-600 transition-all"
        >
          Search
        </button>
      </div>

      {/* Search Results */}
      <ul className="mt-6 space-y-4">
        {data.map((item, index) => (
          <li key={index} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
            <h2 className="text-xl font-semibold text-blue-600">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.title}
              </a>
            </h2>
            <p className="text-gray-600 mt-2">{item.snippet}</p>
            <a 
              href={item.url} 
              className="inline-block mt-3 text-blue-500 font-medium hover:text-blue-700 transition-colors"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Read more →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
