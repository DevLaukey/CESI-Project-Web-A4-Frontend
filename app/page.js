import Header from "../components/layout/Header";
import Hero from "../components/layout/Hero";
import HomeMenu from "../components/layout/HomeMenu";
import SectionHeaders from "../components/layout/SectionHeaders";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      
      
      {/* Main content with proper z-index */}
      <div className="relative z-10">
      <Hero />
      <HomeMenu />
      {/* Testimonial Section */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full transform translate-x-32 translate-y-32"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Testimonial
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              What they saying
            </h2>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-xl relative">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-yellow-400 rounded-full p-1">
                  <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-2xl">👨</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  "Thank you for your food. We is fresh and delicious and it takes the order and delicious so good for this food when it comes to looking. Awesome foods is AWESOME! You have a customer for life!"
                </p>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Salah Jubair</p>
                  <p className="text-gray-500 text-sm">Dhaka</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      </div> 
    </div>
  );
}