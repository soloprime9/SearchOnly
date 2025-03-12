'use client';

import axios from "axios";
import React, { useState, useEffect } from "react";

function App() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [explain, setExplain] = useState("");

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
          const result = response.data[0];
          const summarize = response.data[1];
          setExplain(summarize);
          setData(result);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchData();
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-3xl p-6 bg-white rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Explore The Web</h2>
        <div className="flex items-center border border-gray-300 rounded-lg p-2 shadow-sm bg-gray-100">
          <input
            type="text"
            value={query}
            onChange={handleChange}
            className="w-full p-3 outline-none bg-transparent text-gray-700"
            placeholder="Search anything..."
          />
        </div>
        <button
          onClick={handleSearch}
          className="w-full mt-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Search Now
        </button>
      </div>

      {explain && (
        <div className="mt-4 p-4 rounded-lg bg-blue-100 border-l-4 border-blue-500 text-blue-800 w-full max-w-3xl">
          <p>{explain}</p>
        </div>
      )}

      <ul className="mt-6 w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item, index) => (
          <li key={index} className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300">
            <h2 className="text-lg font-semibold text-blue-600">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.title}
              </a>
            </h2>
            <p className="text-gray-700 mt-2 text-sm">{item.snippet}</p>
            <a
              href={item.url}
              className="inline-block mt-2 text-blue-500 hover:text-blue-700 text-sm font-semibold"
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
