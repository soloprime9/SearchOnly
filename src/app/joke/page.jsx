import React from "react";

function Reaction() {
    return (
        <div className="reaction-wrapper">
            <video
                src="https://xhamster19.com/search/indian+web+series"
                controls
                width="600"
                height="400"
                style={{ backgroundColor: "#000" }} // fallback background
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}

export default Reaction;


// 'use client';
// import axios from "axios";
// import { useEffect, useState } from "react";
// import PostIdDataWrapper from "@/components/PostIdDataWrapper";


// function Joke () {

//     const [joke, setjoke] = useState("")
//     const [answer, setanswer] = useState("")
//     const [message, setmessage] = useState("")
//     const [visible, setvisible] = useState(true)

//     useEffect(() => {
//         const fetchjokes = async()=> {
//             try{
//         const response = await axios.get("http://localhost:4000");
//         setjoke(response.data.setup);
//         setanswer(response.data.delivery)
//         console.log(response)
//         }
//         catch(error){
//             console.log(error)
//             setmessage(error)
//         }
//         };
//     fetchjokes();
    
//     },[] );

//     const NextJoke = () => {
//         window.location.reload();
//     }

//     return (
//         <div>
//             <div className="m-10 border-2 rounded-md p-10 text-center">
//             <h1 className="text-2xl font-bold mb-10">Minded Questions</h1>
//             <h1 className="text-xl font-bold mb-2">{joke}</h1>
//             <button onClick={() => setvisible(!visible)} className="bg-blue-600 font-bold w-full p-2 text-xl text-white rounded-md">{visible ? "Answer" :answer}</button>

//             <button onClick={NextJoke} className="cursor-pointer w-40 text-center bg-yellow-600 text-blue text-lg p-2 rounded-md mt-5">Next Questions</button>

//             <h2>{message}</h2>
//                 <PostIdDataWrapper />
//             </div>
//         </div>
//     )
    
           
// }
// export default Joke;


