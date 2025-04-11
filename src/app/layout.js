import { Inter } from "next/font/google";
import "./globals.css";
import Head from 'next/head';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-8WL1Z0DS60"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-8WL1Z0DS60');
          `}
        </script>
      </Head>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
