'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const images = [
  '/hero1.png',
  '/hero2.png',
  '/hero3.png'
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // React hook to handle the 5-second interval timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    
    // Cleanup the timer when the component unmounts
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        {images.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url('${img}')` }}
          ></div>
        ))}
        
        {/* Dark Gradient Overlay for text readability (Adapted from your layout) */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-transparent"></div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 text-left px-6 md:px-12 w-full max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-semibold tracking-widest uppercase mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Kandyan Art Association
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Preserving Heritage. <br />
            <span className="text-amber-500">Embracing the Future.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl font-light">
            Experience the authentic artistry of Sri Lanka. Book cultural shows, rent historic facilities, and support local craftsmen through our modern digital portal.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/shop" 
              className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:shadow-[0_0_30px_rgba(217,119,6,0.6)] text-lg text-center"
            >
              Explore Crafts Shop
            </Link>
            <Link 
              href="/workshops" 
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/20 transition-all shadow-lg text-lg backdrop-blur-md text-center"
            >
              Book Tickets
            </Link>
          </div>
          
          {/* Slider Indicators (Dots) */}
          <div className="flex gap-2 mt-12">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-amber-500 w-8' : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}