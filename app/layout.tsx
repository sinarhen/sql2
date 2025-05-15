import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learning Analytics Platform",
  description: "Gain insights into student performance and learning patterns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div 
          className="min-h-screen flex flex-col relative grainy"
        >
          <div className="fixed w-screen h-screen inset-0 -z-10 bg-linear-60 animate-pulse from-primary/10 to-background animate-gradient-slow"></div>
          
          <div className="absolute inset-0 -z-10 opacity-40 bg-[url('/grid-pattern.svg')]"></div>
          
          <Navbar />
          <main className="flex-1 min-h-[calc(100vh-57px)] px-24 max-w-screen-xl mx-auto relative z-10">
              {children}
          </main>
        </div>
      </body>
    </html>
  );
} 