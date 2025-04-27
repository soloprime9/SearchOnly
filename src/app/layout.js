// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
  
export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <header className=" m-2 flex justify-evenly">
      <div>
      <h1>Fondpeace.com</h1>
      </div>
    </header>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
