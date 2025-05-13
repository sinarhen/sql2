import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatComponent from "../components/chat/ChatComponent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LMS Analytics",
  description: "Analytics system for Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ChatComponent />
      </body>
    </html>
  );
} 