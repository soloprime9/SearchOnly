'use client';

import axios from "axios";
import React, { useEffect, useState } from "react";

const Home = ()=> {


  const [query, setquery] = useState('');
  const [data, setdata] = useState([])
  const [search, setsearch] = useState("");

  useEffect(() => {
    const fetchData = async() =>{

    try{
     const response = await axios.get(`http://127.0.0.1:5000/search?q=${search}`)

     const data = await response.data;
     setdata(data);
    

    }

    catch(error){
        console.log(error)

    }

  };
  fetchData();

    },[search])

  

  return (
    <div>
          
            <input type="text" value={query} onChange={(e) =>setquery(e.target.value)} />
            <button onClick={(e) => {e.preventDefault(); setsearch(query)}}>Button</button>
          

          <div>
            {data.map((info, index) => (
              <li key={index}>
                <h2>{info.title}</h2>
                <p>{info.snippet}</p>
                <a href={info.url}></a>

              </li>
            ))}
          </div>
    </div>
  );
}

export default Home;