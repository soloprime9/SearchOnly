"use client";
import Head from 'next/head';
  
import React, { useState } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer"; 

export default function Home() {
  const [markdown, setMarkdown] = useState(`# Yeh Rishta Kya Kehlata Hai 7 April 2025 Written Update: Arman and Vidya in trauma

This show is famous in India for its twist, romance, and interesting story of all the characters, this show is played daily on Jiohostar where you can see all of the episodes of Yeh Rishta Kya Kehlata Hai. 

In Today's episode, we see Arman (Rohit Purohit) and Abhira (samadhi Shukla) talking to Ruhi to keep their child in her womb. here Arman thinks about Rohit and feels sad. Here Arman and his family are so sad to know about the death of Rohit, and now Ruhi's life is ruined. Ruhi is so sad at this time. Arman thinks about Rohit and he takes Arman's beliefs to take care of Ruhi and Daksh. now here is some distance in Arman and Abhira's relationship. 
 
## Arman feels guilty

Now we are seeing the next episode where Ruhi and Daksha are with their family. Ruhi said that Rohit wasn't going to leave them. where all of the shock to listen to Ruhi. Abhira calls Ruhi to go with her together. Now we see that Arman going to fight with doctors to see Rohit but the doctor stops Arman to see Rohit. Arman going to the mortuary.  Abhira goes to Arman and she sees Rohit's dead body to Arman. 

## Arman and Vidya in Trauma

Later, we see that Arman and his family are sad about Rohit's death. Arman expresses his grief. Now Arman calls Abhira to say wake up to Shivani, but when thinks about true. he starts weeping. Now Arman says that he wants to die with Rohit and Shivani. Kaveri said to Vidyaa to see the face of Rohit and Shivani before the doctor came to take the dead bodies. Vidya in trauma, kajal and manisha handle vidya.

## Ruhi missing News

Later, we see that Arman and his family maum the death of Rohit and Shivani. at last, Vidya says that she wants to see the faces of Rohit and Shivani, whereas Kavery says Manisha to handle Vidyaa. Here Arman completes the last rites of Rohit and Shivani. All of the rites are complete of Shivani and Rohit. Arman and his family listen to updates that Ruhi is going to be missing, all afraid. 

In the upcoming, we will see that Arman and Abhira are going to search for Ruhi and they are afraid. 

This blog source from <a href="https://www.hotstar.com/in">Jiohotstar</a> and <a href="https://www.iwmbuzz.com/television/written-updates/anupamaa-written-update-5-april-2025-rahi-suspects-mohits-intentions-doubts-if-he-is-framing-prem/2025/04/04"> iwmbuzz</a>

**<a href="https://www.fondpeace.com/blog/Anupama 5 April 2025 written update" target="_blank">Anupama 5 April Written Update</a>**

`);

  return (
   <div className="min-h-screen bg-gray-100 p-5">

      <Head>
  
  <title>Yeh Rishta Kya Kehlata Hai 6 April 2025 Written Update: Arman and Vidya in trauma</title>

</Head>
    <div>
      
      <MarkdownRenderer content={markdown} />
    </div>
    </div>
  );
}
