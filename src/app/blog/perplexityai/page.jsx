"use client";
  
import React, { useState } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer"; 

export default function Home() {
  const [markdown, setMarkdown] = useState(`# Inspired by perplexity, I built an AI search engine



Hello friends Your welcome on my new blog, where we are going to plan to build an AI Search Engine Like as _**Perplexity AI**_, which will be work same like as. 



So firstly want to know that what is Perplexity AI, how it's built and how work, in this blog will be going to know in details and make our own AI Search Engine with Advance Feature like as Perplexity. 



I think that you have full knowledge about the Perplexity AI, where is placed, who founded it, when it was published and more thing, without wasting time we are going to know below about how Perplexity AI work



Perplexity AI is working like as Search Engine, but it is totally different from traditional search engines. Here are more Traditional search engines available in the Tech market like as Google, Microsoft Bing, Brave and more. But all of these are traditional search engines. But Perplexity AI is not like as them. 



Perplexity AI using another types of logics and methods search and give the all type of information according to query. When the User is going to search some query on Perplexity Homepage. Perplexity AI break the query in many parts to like to tokenize the words and sentence, in the requirement its remove the stop words from query for easy understand. After understand the query, it's search in their database and on web for latest content for the query.



If the data for query is available in database, then its give easily answer to user's query. But when the query's answer is not available in database then it's search on web and at this time Perplexity AI uses Search Engines API for the search results. Perplexity uses Google Search, Microsoft Bing, DuckDuckGo search results API.



After getting the search results, Perplexity AI collect the content from the content via website using some methods like as scraping, website APIs with following robots.txt file rules of the website. But when some website not allow it then Perplexity is going to use some other methods like as Proxies, Selenium, Beautiful Soup, Puppeteer and more for collecting data from the websites.



When the Perplexity finds the data, then it's using some logics methods to clean up the collected data. It's write some code to remove like as stop words, special characters, links, advertising ads, emails, numbers and more depend on needs.



After cleaning data, it stores data and sends their using AI Models to understand it and give the correct answer to the user's query. Here perplexity AI uses many trained Models like as ChatGPT, Google AI, DeepSeek AI and more. 



Perplexity set the command to all the AI models to summarize, explain, accurate, latest and more like as command prompts to give correct and perfect query's answer. 



### What is difference between Traditional and AI Search Engine



Traditional and AI Search Engines are both, all of them are different to each other. In Traditional Search Engines, users want to search and then want to click and visit on the website to take the information. But in AI Search Engine, it is not taking too much time to get the answer of query. When the user enters query and click to get answer then user find answer in some second. 



So AI search engine is more than faster than the Traditional Search Engine. If we go to know more difference in Traditional and AI Search Engine, so it will take more time, but we don't have time to know about all. Now we are going to next step to make Perplexity AI lie as AI Search Engine with advance features.



#### Now we are going to make AI Search Engine like as Perplexity AI



First thing here is this that you are planning to make AI Search Engine with using of free or paid service. Like as for making this You need APIs for Search Results, AI trained models (ChatGPT, Google Gemini, DeepSeek AI), paid proxies for scraping or website APIs and mores.



If you are able to buy this all services then you can go to make best and fast and more advance AI search Engine like as Perplexity AI or with more Advance Features. 



If you are planing to make a free Perplexity AI like AI search Engine, then you can follow me. If you have plan to upgrade your project to paid, then you can follow me. If you have not more traffic than you can start for free, and after you upgrade it. 



First we require a free search results API so we can use DuckDuckGo API for it, because it is free, and it has not restricted or tracking or storing data, so you can use it for free in beginning. After Duckduckgo, we need to create an input box for entering query and a button to get search results. 



All the code we will be writing in python. Python is easy, and we can maintain it easily. If you are planning to make UI based AI search Engine then you want to choose a frontend language like as HTML, react JS and more are available, which u want to use them easy with python.



Here we want to decide Flask in python for creating API to connect with backend and for the frontend we are planing to use React JSX with tailwind CSS. Flask Python for backend and React JSX with tailwind CSS for frontend will be the best combo. 



If you are not known about the Python, Flask, React JSX and Tailwind CSS so you can learn all of them via online, or you can use YouTube, because I am also learned from online and YouTube of them



For doing all of them, we want to first want to set up the backend and frontend, dear friend. We are using Visual Studio Code Editor to run both file.



For python, want to download via python official website, and we want to install some library:-



<pre><code class="has-line-data" data-line-start="49" data-line-end="57" class="language-sh">pip install Flask
pip install DuckDuckGoSearch
pip install requests
pip install beautifulsoup4
pip install selenium
pip install re
pip install urllib3
</code></pre>
<p class="has-line-data" data-line-start="58" data-line-end="59">For the frontend, to set up a Next.js project with React JSX and install necessary libraries, use the following commands:</p>
<pre><code class="has-line-data" data-line-start="61" data-line-end="67" class="language-sh">npx create-next-app project-frontend
<span class="hljs-built_in">cd</span> project-frontend
npm install axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
</code></pre>

Now for both the frontend and backend code we have downloaded all things



Now we are going to write the full code dear friend below. 

You can connect with us for more info about it and mores <a href="https://www.fondpeace.com" target="_blank" rel="oopener noreferrer" >Click Now</a>
`);

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <MarkdownRenderer content={markdown} />
    </div>
  );
}
