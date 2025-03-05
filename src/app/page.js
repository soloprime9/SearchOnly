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
          const response = await axios.get(`http://localhost:5000/search?q=${search}`);
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
    <div className="m-1 mb-10"> 
    <div className="m-4">
      <h2 className="text-2xl font-bold text-center">Search Only Not Open</h2>
    </div>
    <div className="m-10 p-5 border-2 rounded-md">
      <input type="text" value={query} onChange={handleChange} className="border-2 rounded-md w-full p-2 text-lg"/>
      <button onClick={handleSearch} className="w-full text-xl font-bold border-2 rounded-md mt-6 bg-blue-400 text-white">Search</button>
      </div>
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