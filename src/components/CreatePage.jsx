"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";


function Creation (){

    const [prompt, Setprompt] = useState("");
    const [data, setData] = useState([]);
    

    
        const GetContent =  async(e)=> {
            e.preventDefault();
            
            
            try {

                

                const response = await axios.get(`https://backendk-z915.onrender.com/content/search?q=${prompt}`)

                console.log(response)
                setData(response.data);
            }
            catch(error){
                console.log(error);
            }

         
            

        };

        const CopyContent = (text) => {
            navigator.clipboard.writeText(text);
            alert("Text Successfully Copied");
        }
        

    return (
        <div >
            <div className="m-2">

            
        
        <form onSubmit={GetContent} className="p-2 m-10 border-2 rounded-sm border-blue-600 text-lg text-center">
            <input type="text" value={prompt} onChange={(e) => Setprompt(e.target.value)} className="text-2xl p-3 mb-2 w-full border-2 rounded-md border-blue-200 text-center" />

            <button type="submit" className="border-2 mb-2 border-blue-800 bg-gray-300 rounded-md font-bold text-blue-900 text-2xl p-3 justify-center cursor-pointer">Click Now</button>
        </form>

        
            <div className="grid grid-cols-3 gap-4 px-2 pb-20 ">
                {data.length > 0 ? (
                    data.map((post, index) => (
                    <div key={index} className="m-2 p-2 border-1 rounded-2xl w-full  object-cover bg-blue-800 text-white font-bold hover:shadow-xl/40 shadow-blue-900 ring-2 border-orange-200 relative pb-10   hover:shadow-[0px_0px_12px_9px_#742a2a]">
                        
                        
                        <p> {post.content}</p>
                        
                        <div className=" pt-2 ">
                        <button onClick={() => CopyContent(post)} className=" px-6 py-2 bg-black text-white rounded-lg font-bold transform hover:-translate-y-1 transition duration-400">Copy</button>
                    </div>
                        
                    </div>
                    ))
                ) : (
                    <div className="">
                    <p className="font-bold "></p>
                    </div>
                    )}
            </div> 
            <div>
                <h1></h1>
            </div>
        
        </div>
                        </div>
                    )

}

export default Creation;
