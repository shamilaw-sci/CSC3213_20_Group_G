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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
      
      {/* Background Slider with "Ken Burns" Slow Zoom Effect */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        {images.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-[5000ms] ease-linear ${
              index === currentSlide 
                ? 'opacity-100 scale-105' // Active slide slowly zooms in
                : 'opacity-0 scale-100'   // Inactive slides reset
            }`}
            style={{ backgroundImage: `url('${img}')` }}
          ></div>
        ))}
        
        {/* Richer Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent"></div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 text-left px-6 md:px-12 w-full max-w-7xl mx-auto">
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs md:text-sm font-bold tracking-widest uppercase mb-8 backdrop-blur-md shadow-lg">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            The Kandyan Art Association
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Preserving Heritage. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Embracing the Future.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl font-light">
            Experience the authentic artistry of Sri Lanka. Book cultural shows, rent historic facilities, and support local craftsmen through our modern digital portal.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/shop" 
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.6)] text-lg text-center transform hover:-translate-y-1"
            >
              Explore Crafts Shop
            </Link>
            <Link 
              href="/workshops" 
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 hover:border-white/30 transition-all shadow-lg text-lg backdrop-blur-md text-center transform hover:-translate-y-1"
            >
              Book Tickets
            </Link>
          </div>
          
          {/* Interactive Slider Indicators */}
          <div className="flex gap-3 mt-16 items-center">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  index === currentSlide ? 'bg-amber-500 w-10 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-white/30 hover:bg-white/60 w-2'
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