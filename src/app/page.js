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
          setData(response.data);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchData();
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-2xl w-full p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Explore The Web</h2>
        <div className="flex items-center border border-gray-300 rounded-lg p-2">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            className="w-full p-2 outline-none"
            placeholder="Search anything..."
          />
        </div>
        <button
          onClick={handleSearch}
          className="w-full mt-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
        >
          Search Now
        </button>
      </div>

      <ul className="mt-6 w-full max-w-2xl">
        {data.map((item, index) => (
          <li key={index} className="p-4 bg-white rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-semibold text-blue-600">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.title}
              </a>
            </h2>
            <p className="text-gray-700 mt-2">{item.snippet}</p>
            <a 
              href={item.url} 
              className="inline-block mt-2 text-blue-500 hover:text-blue-700"
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
