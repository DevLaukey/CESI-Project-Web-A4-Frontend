import React from "react";

function Footer() {
  return (
    <div className="w-screen bg-primary-dark text-white">
      <footer className="bg-primary-dark text-white">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">
                <span className="text-white">ST PIZZA</span>
              </h3>
              <p className="text-sm leading-relaxed">
                <span className="text-white">
                  Food delivery and more. Whatever you order, in minutes!
                </span>
              </p>
            </div>

            {/* Navigation Links */}
            <div className="space-y-4">
              <h4 className="font-semibold">
                <span className="text-white">Explore</span>
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/menu"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    <span className="text-white">Menu</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#restaurants"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    <span className="text-white">Top Restaurants</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#delivery"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    <span className="text-white">Fast Delivery</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    <span className="text-white">About Us</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    <span className="text-white">Contact</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Join Us */}
            <div className="space-y-4">
              <h4 className="font-semibold">
                <span className="text-white">Join Us</span>
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/register?type=restaurant"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    <span className="text-white">Become a Partner</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/register?type=driver"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    <span className="text-white">Become a Driver</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="font-semibold">
                <span className="text-white">Support</span>
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/help"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    <span className="text-white">Help Center</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/faq"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    <span className="text-white">FAQ</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/order-tracking"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    <span className="text-white">Track Order</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/feedback"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    <span className="text-white">Feedback</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-yellow-400/20">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm mb-4 md:mb-0">
                <span className="text-white">
                  © 2025 ST PIZZA. All rights reserved.
                </span>
              </div>
              <div className="flex space-x-6 text-sm">
                <a
                  href="/privacy"
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <span className="text-white">Privacy Policy</span>
                </a>
                <a
                  href="/terms"
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <span className="text-white">Terms of Service</span>
                </a>
                <a
                  href="/cookies"
                  className="text-white hover:text-yellow-400 transition-colors"
                >
                  <span className="text-white">Cookie Policy</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
