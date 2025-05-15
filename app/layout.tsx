import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/navbar";
import { Providers } from './providers';
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learning Analytics Platform",
  description: "A comprehensive learning management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen text-xs flex flex-col">                    
            <div className="fixed inset-0 -z-10 opacity-50 bg-[url('/grid-pattern.svg')]"></div>
            <Navbar />
            <main className="relative">{children}</main>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
} 