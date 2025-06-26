"use client";

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

function page() {
  const router = useRouter();
    useEffect(() => {
        //   route to browse-restaurants
        router.push('/browse-restaurants');
    }, []); // Empty dependency array means this effect runs once
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Redirecting to Restaurants...</h1>

      {/* loader */}
      <div className="loader mt-4">
        <div className="spinner"></div>
        <style jsx>{`
          .loader {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3; /* Light grey */
            border-top: 5px solid #3498db; /* Blue */
            border-radius: 50%;
            animation: spin 2s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default page