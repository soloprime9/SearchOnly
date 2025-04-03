import { Inter } from "next/font/google";
 import "./globals.css";
 
 const inter = Inter({
   variable: "--font-inter",
   subsets: ["latin"],
 });
 
 export const metadata = {
   title: "Fond Peace AI - Free AI-Powered Search & Do Anything for Free",
   description:
     "Unlock the limitless potential of AI with Fond Peace AI. Experience cutting-edge AI-powered search, automation, content generation, and assistance tools—all for free. This is a plateform where you can search anything like as google, bing and web",
     "FondPeace AI is a free AI-powered answer engine that provides accurate, trusted, and real-time answers to any question and also experience cutting-edge AI-powered search, automation, content generation, and assistance tools—all for free. This is a plateform where you can search anything like as google, bing and web",
   keywords:
     "Fond Peace AI, free AI tools, AI search engine, AI assistant, AI automation, AI content generator, AI-powered search, AI chatbot, AI-driven solutions, AI-powered research, AI discovery, AI-powered learning, AI innovation, AI productivity, AI-powered applications, AI-powered insights, AI-powered recommendations, AI for everyone, next-gen AI, best free AI tools, AI-powered knowledge base, AI-driven search engine, AI-powered decision-making, AI-powered problem-solving, AI assistant for work and study, AI-powered writing tools, AI-powered creative solutions",
     "Fond Peace AI, free AI tools, AI search engine, AI assistant, AI automation, AI content generator, AI-powered search, AI chatbot, AI-driven solutions, AI-powered research, AI discovery, AI-powered learning, AI innovation, AI productivity, AI-powered applications, AI-powered insights, AI-powered recommendations, AI for everyone, next-gen AI, best free AI tools, AI-powered knowledge base, AI-driven search engine, AI-powered decision-making, AI-powered problem-solving, AI assistant for work and study, AI-powered writing tools, AI-powered creative solutions,ai chat,ai,chap gpt,chat gbt,chat gpt 3,chat gpt login,chat gpt website,chat gpt,chat gtp,chat openai,chat,chatai,chatbot gpt,chatg,chatgpt login,chatgpt,gpt chat,open ai,openai chat,openai chatgpt,openai,claude ai, lovable ai, downloader, youtube, google, twitter, x, instagram, ai tools, ai tool, alternatives, chat gpt alternative, search engine, written update, telly updates, today written update, anupama,ghkkpm,yrkkh,bhagya lakshmi, dhruv rathi, dhruv rathi new video, grok ai, grok, grok chatbot, elon musk, macrumors, 9to5mac, apple insider, apple rumors, apple, iphone, rumors,",
   openGraph: {
     title: "Fond Peace AI - Your Ultimate Free AI Assistant for Everything",
     description:
       "Experience the future of AI today! Search, create, and automate effortlessly with Fond Peace AI. Free AI-powered solutions for search, writing, automation, and more!",
     images: [
       {
         url: "https://www.fondpeace.com/og-image.jpg",
         width: 1200,
         height: 630,
       },
     ],
   },
   twitter: {
     card: "summary_large_image",
     title: "Fond Peace AI - Explore Advanced AI Tools for Free",
     images: ["https://www.fondpeace.com/twitter-image.jpg"],
   },
 };
 
 export default function RootLayout({ children }) {
   return (
     <html lang="en">
       <head>
         <link rel="canonical" href="https://www.fondpeace.com/" />
         <script type="application/ld+json">
           {JSON.stringify({
             "@context": "https://schema.org",
             "@type": "SoftwareApplication",
             name: "Fond Peace AI",
             operatingSystem: "Web",
             applicationCategory: "Artificial Intelligence",
             offers: {
               "@type": "Offer",
               price: "0",
             },
             aggregateRating: {
               "@type": "AggregateRating",
               ratingValue: "4.9",
               ratingCount: "2500",
             },
           })}
         </script>
       </head>
       <body className={`${inter.variable}`}>
 
         {children}
 
 
       </body>
     </html>
   );
 }
