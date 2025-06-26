import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AppContextProvider } from "@/data/AppContext";

// Importing fonts from Google Fonts
// Geist Sans and Geist Mono are custom fonts provided by Next.js
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata for the application
// This metadata is used for SEO and social sharing
export const metadata = {
  title: "Next.js Food Delivery App",
  keywords: "Next.js, Food Delivery, React, Web Development",
  description: "A modern food delivery application built with Next.js, showcasing the power of React and server-side rendering.",
  authors: [
    {
      name: "Abigail Theuri",
      url: ""
    },
    {
      name: "Victor Mburu",
      url: ""
    },
    {
      name: "Larry Mutoni",
      url: ""
    },
    {
      name: "LPG",
      url: ""
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <AuthProvider>
          <AppContextProvider>
            <Header />
            {children}
            <Footer />
          </AppContextProvider>
          </AuthProvider>
      </body>
    </html>
  );
}
