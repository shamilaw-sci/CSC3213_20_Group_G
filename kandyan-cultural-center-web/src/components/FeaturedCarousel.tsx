"use client";

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext'; // Import Cart Context

export default function FeaturedCarousel({ artifacts }: { artifacts: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addToCart, setIsDrawerOpen } = useCart(); // Hook into the cart

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // --- ACTION HANDLERS FOR THE CARD ---
  const handleCardClick = (id: string) => {
    router.push(`/shop/${id}`);
  };

  const handleAddToCart = (e: React.MouseEvent, artifact: any) => {
    e.stopPropagation(); // Prevents the card click from triggering
    if (addToCart) addToCart({ ...artifact, quantity: 1 });
    if (setIsDrawerOpen) setIsDrawerOpen(true);
  };

  const handleBuyNow = (e: React.MouseEvent, artifact: any) => {
    e.stopPropagation(); // Prevents the card click from triggering
    if (addToCart) addToCart({ ...artifact, quantity: 1 });
    router.push('/checkout'); 
  };

  if (!artifacts || artifacts.length === 0) return null;

  return (
    <div className="relative group">
      
      {/* Left Scroll Control */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm md:bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-kandyan-maroon md:hover:scale-110 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer disabled:opacity-0"
        aria-label="Scroll left"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      {/* Right Scroll Control */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm md:bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-slate-600 hover:text-kandyan-maroon md:hover:scale-110 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
        aria-label="Scroll right"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>

      {/* Scrolling Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 md:gap-8 pb-8 pt-4 snap-x snap-mandatory scroll-smooth px-4 md:px-2"
      >
        {artifacts.map((artifact) => (
          <div 
            key={artifact.id} 
            onClick={() => handleCardClick(artifact.id)}
            className="w-[260px] sm:w-[300px] flex-shrink-0 snap-center sm:snap-start bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col group/card cursor-pointer"
          >
            {/* Image Container & Badges */}
            <div className="aspect-[4/5] w-full relative overflow-hidden bg-slate-50">
              <Image
                src={artifact.image_url}
                alt={artifact.name}
                fill
                className="object-cover w-full h-full group-hover/card:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 sm:gap-2">
                {/* Stock Badges */}
                {artifact.stock === 0 ? (
                  <span className="bg-slate-900 text-white text-[9px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm">
                    Sold Out
                  </span>
                ) : artifact.stock < 5 ? (
                  <span className="bg-kandyan-gold text-white text-[9px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm">
                    Low Stock
                  </span>
                ) : null}
                
                {/* Sale Badge */}
                {artifact.discounted_price && artifact.discounted_price < artifact.price && (
                  <span className="bg-kandyan-maroon text-white text-[9px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm self-start">
                    Sale
                  </span>
                )}
              </div>
            </div>
            
            {/* Card Content */}
            <div className="p-4 sm:p-6 flex flex-col flex-grow">
              <span className="text-[9px] sm:text-[10px] font-bold text-kandyan-maroon uppercase tracking-widest mb-1 sm:mb-2 line-clamp-1">
                {artifact.category}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2 sm:mb-4 line-clamp-1 group-hover/card:text-kandyan-gold transition-colors">
                {artifact.name}
              </h3>
              
              {/* Pricing */}
              <div className="mt-auto flex flex-col gap-1 mb-3 sm:mb-4 border-b border-slate-50 pb-3">
                {artifact.discounted_price && artifact.discounted_price < artifact.price ? (
                  <div className="flex flex-col">
                    <span className="text-[10px] sm:text-sm font-medium text-slate-400 line-through">
                      Rs. {artifact.price.toLocaleString()}
                    </span>
                    <span className="text-base sm:text-xl font-black text-slate-900">
                      Rs. {artifact.discounted_price.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-base sm:text-xl font-black text-slate-900">
                    Rs. {artifact.price ? artifact.price.toLocaleString() : "N/A"}
                  </span>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleAddToCart(e, artifact)}
                    className="p-2 sm:px-4 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl hover:border-kandyan-gold hover:bg-amber-50 text-slate-600 hover:text-kandyan-gold flex items-center justify-center transition-all shadow-sm"
                    aria-label="Add to cart"
                  >
                    <svg className="w-4 h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    <span className="hidden sm:block text-xs font-bold">Cart</span>
                  </button>
                  
                  <button 
                    onClick={(e) => handleBuyNow(e, artifact)}
                    className="flex-1 bg-slate-900 hover:bg-kandyan-gold text-white text-xs sm:text-sm font-bold py-2 rounded-xl transition-colors shadow-sm"
                  >
                    Buy Now
                  </button>
                </div>

                {/* More Details */}
                <div className="mt-1 text-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 group-hover/card:text-kandyan-maroon transition-colors uppercase tracking-widest flex items-center justify-center gap-1">
                    More Details 
                    <svg className="w-3 h-3 group-hover/card:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}