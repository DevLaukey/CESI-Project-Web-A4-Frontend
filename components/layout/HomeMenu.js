"use client";
import SectionHeaders from "@/components/layout/SectionHeaders";
import MenuItem from "@/components/menu/MenuItem";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import RestaurantsAndFeatures from "./RestuarantsAndFeatures";

export default function HomeMenu() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* <RestaurantsAndFeatures /> */}

      {/* Registration CTAs Section */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Whether you want to earn money or grow your business, we have the
              perfect opportunity for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 shadow-xl border border-gray-200">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl overflow-hidden mx-auto mb-6 shadow-lg">
                <Image
                  src="/lucian-alexe-afDu-GuxjjM-unsplash.jpg"
                  alt="Delivery Driver"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Become a Driver
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Enjoy flexibility, freedom and competitive earnings by
                delivering through ST PIZZA. Set your own schedule and earn on
                your terms.
              </p>
              <div className="space-y-4">
                <Link
                  href="/register?type=driver"
                  className="block w-full bg-primary-dark text-white font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <span className="text-white">Start Driving Today</span>
                </Link>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                    Weekly payouts
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                    Flexible hours
                  </span>
                </div>
              </div>
            </div>

            {/* Become a partner */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 shadow-xl border border-gray-200">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl overflow-hidden mx-auto mb-6 shadow-lg">
                <Image
                  src="/alex-jiang-tgp5RtxfHIQ-unsplash.jpg"
                  alt="Restaurant Partner"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Become a Partner
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Grow with ST PIZZA! Our technology and user base can help you
                boost sales and unlock new opportunities for your restaurant.
              </p>
              <div className="space-y-4">
                <Link
                  href="/register?type=restaurant"
                  className="block w-full bg-primary-dark text-white font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <span className="text-white">Partner With Us</span>
                </Link>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                    Low commission
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                    Marketing support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
