'use client';

// import axios from "axios";
// import React, { useState, useEffect } from 'react';

// function App() {
//   const [data, setData] = useState([]);
//   const [query, setQuery] = useState('');
//   const [search, setSearch] = useState('');

//   const handleChange = (e) => {
//     setQuery(e.target.value);
//   };

//   const handleSearch = () => {
//     setSearch(query);
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       if (search) {
//         try {
//           const response = await axios.get(`https://sokara.vercel.app/search?q=${search}`);
//           const data = await response.data;
//           setData(data);
//         } catch (error) {
//           console.error(error);
//         }
//       }
//     };
//     fetchData();
//   }, [search]);

//   return (
//     <div className="m-4 mb-10 max-w-2xl mx-auto">
//       {/* Heading */}
//       <div className="text-center">
//         <h2 className="text-3xl font-bold text-gray-800">Search Results</h2>
//       </div>

//       {/* Search Box */}
//       <div className="mt-6 p-5 border border-gray-300 rounded-lg shadow-md">
//         <input 
//           type="text" 
//           value={query} 
//           onChange={handleChange} 
//           className="border w-full p-3 text-lg rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
//           placeholder="Enter your search term..."
//         />
//         <button 
//           onClick={handleSearch} 
//           className="w-full text-lg font-semibold border rounded-md mt-4 py-3 bg-blue-500 text-white hover:bg-blue-600 transition-all"
//         >
//           Search
//         </button>
//       </div>

//       {/* Search Results */}
//       <ul className="mt-6 space-y-4">
//         {data.map((item, index) => (
//           <li key={index} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
//             <h2 className="text-xl font-semibold text-blue-600">
//               <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
//                 {item.title}
//               </a>
//             </h2>
//             <p className="text-gray-600 mt-2">{item.snippet}</p>
//             <a 
//               href={item.url} 
//               className="inline-block mt-3 text-blue-500 font-medium hover:text-blue-700 transition-colors"
//               target="_blank" 
//               rel="noopener noreferrer"
//             >
//               Read more →
//             </a>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default App;




import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ArrowRight, Loader2 } from 'lucide-react';

const Index = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasFocused, setHasFocused] = useState(false);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    if (query.trim()) {
      setSearch(query);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (search) {
        setIsLoading(true);
        try {
          const response = await axios.get(`https://sokara.vercel.app/search?q=${search}`);
          const data = await response.data;
          setData(data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-16 px-6 md:px-4">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block px-3 py-1 mb-4 rounded-full bg-primary/5 text-primary text-sm font-medium">
            Find what you need
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-accent">
            Search Results
          </h1>
          <p className="mt-4 text-muted-foreground text-balance max-w-lg mx-auto">
            Enter your query below to find exactly what you're looking for.
          </p>
        </div>

        {/* Search Box */}
        <div className={`relative mb-16 transition-all duration-500 ${hasFocused ? 'scale-105' : 'scale-100'}`}>
          <div className="glass rounded-2xl overflow-hidden shadow-lg transition-all-ease">
            <div className="relative">
              <input 
                type="text" 
                value={query} 
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setHasFocused(true)}
                onBlur={() => setHasFocused(false)}
                className="w-full px-6 py-5 pr-16 text-lg bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/70"
                placeholder="Enter your search term..."
              />
              <button 
                onClick={handleSearch}
                disabled={isLoading || !query.trim()} 
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full 
                  ${query.trim() 
                    ? 'bg-primary text-white hover:bg-primary/90' 
                    : 'bg-secondary text-muted-foreground cursor-not-allowed'}
                  transition-all duration-300 ease-out`}
                aria-label="Search"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">Searching for results...</p>
          </div>
        ) : data.length > 0 ? (
          <ul className="space-y-5">
            {data.map((item, index) => (
              <li 
                key={index} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block glass p-6 rounded-xl hover:shadow-lg transition-all-ease hover:translate-y-[-2px]"
                >
                  <h2 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-muted-foreground line-clamp-2">{item.snippet}</p>
                  <div className="mt-4 flex items-center text-primary font-medium">
                    <span className="mr-2">Read more</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : search && (
          <div className="text-center py-10 animate-fade-in">
            <p className="text-muted-foreground">No results found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

