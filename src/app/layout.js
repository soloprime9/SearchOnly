// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import StatusBar from '@/components/StatusBar';
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VTZGD645EG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VTZGD645EG');
          `}
        </Script>


          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5007774826517640"
     crossorigin="anonymous"></script>
      </head>
      <body className={inter.variable}>
        <header className="md:m-2 flex justify-evenly">
          <div>
            <h1 className="font-bold md:block hidden">
              <strong>
                <a href="https://www.fondpeace.com/">Fondpeace</a>
              </strong>
            </h1>
          </div>
        </header>
        {children}

      <StatusBar />
      </body>
    </html>
  );
}







// // app/layout.js
// import { Inter } from "next/font/google";
// import "./globals.css";
// import Head from 'next/head';

// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
// });
  
// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//     <Head>
      
//         <script async src="https://www.googletagmanager.com/gtag/js?id=G-VTZGD645EG"></script>
//         <script>
//           window.dataLayer = window.dataLayer || [];
//           function gtag(){dataLayer.push(arguments);}
//           gtag('js', new Date());
        
//           gtag('config', 'G-VTZGD645EG');
//         </script>
//     </Head>
//     <header className=" m-2 flex justify-evenly">
//       <div>
//       <h1 className="font-bold"><strong><a href="https://www.fondpeace.com/">Fondpeace</a></strong></h1>
//       </div>
//     </header>
//       <body className={inter.variable}>{children}</body>
//     </html>
//   );
// }
