'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UserMenu from './UserMenu';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount, setIsDrawerOpen } = useCart();
  const [showWelcome, setShowWelcome] = useState(false);

  // --- WELCOME BACK DIALOG LOGIC ---
  useEffect(() => {
    // 1. Check if they have already seen the popup during this browser session
    const hasSeen = sessionStorage.getItem('kcc_welcome_seen');
    
    // 2. If they haven't seen it, AND they have items in their cart...
    if (!hasSeen && cartCount > 0) {
      // 3. Wait 1.2 seconds for the page to load, then show the popup
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1200);

      // 4. Mark it as "seen" immediately so it doesn't pop up again if they navigate away
      sessionStorage.setItem('kcc_welcome_seen', 'true');
      
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  // --- REUSABLE POP-UP COMPONENT ---
  // We make this a constant so we can easily render it for both Desktop and Mobile cart icons
  const WelcomePopup = () => (
    <div className="absolute top-full right-0 mt-5 w-72 bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-slate-100 p-5 z-[100] animate-in slide-in-from-top-2 fade-in duration-500 cursor-default text-left">
      {/* Small arrow pointing up to the cart */}
      <div className="absolute -top-2 right-3.5 w-4 h-4 bg-white rotate-45 border-l border-t border-slate-100 rounded-sm"></div>
      
      <div className="relative z-10 flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-kandyan-gold shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        
        {/* Content */}
        <div className="flex-grow">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowWelcome(false); }}
            className="absolute -top-1 -right-1 p-1 text-slate-400 hover:text-rose-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <h4 className="text-slate-900 font-bold text-sm mb-1">Welcome back!</h4>
          <p className="text-slate-500 text-xs mb-3 leading-relaxed">
            You left {cartCount} item{cartCount > 1 ? 's' : ''} in your cart. Ready to complete your order?
          </p>
          
          <div className="flex gap-2">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowWelcome(false); 
                setIsDrawerOpen(true); 
              }}
              className="bg-slate-950 hover:bg-kandyan-maroon text-white text-[11px] font-bold px-3 py-2 rounded-lg transition-colors w-full shadow-sm"
            >
              View Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-white/10 text-white sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 max-w-7xl h-20 flex items-center justify-between relative z-50">
        
        {/* Modern Logo Section */}
        <Link href="/" onClick={closeMenu} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all duration-300">
            K
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-widest uppercase leading-none group-hover:text-amber-400 transition-colors">
              Kandyan
            </span>
            <span className="text-[10px] font-medium tracking-[0.2em] text-slate-400 uppercase leading-none mt-1">
              Art Association
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8 font-medium text-sm tracking-wide">
          <Link href="/" className="text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Home</Link>
          <Link href="/about" className="text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Our Story</Link>
          <Link href="/shop" className="text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Crafts Shop</Link>
          <Link href="/workshops" className="text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Shows & Workshops</Link>
          <Link href="/facilities" className="text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Venues</Link>
        </nav>

        {/* Desktop CTA Button & cart */}
        <div className="hidden lg:flex items-center gap-6">
          
          {/* Cart Button (Wrapped in a relative div for the popup) */}
          <div className="relative">
            <button 
              onClick={() => setIsDrawerOpen(true)} 
              className="relative p-2 text-slate-300 hover:text-amber-400 transition-colors group cursor-pointer border-none bg-transparent"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-kandyan-maroon text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-950">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* Desktop Welcome Popup */}
            {showWelcome && <WelcomePopup />}
          </div>

          <Link 
            href="/#contact" 
            className="bg-rose-700 hover:bg-rose-600 text-white px-6 py-2.5 rounded-lg font-bold transition-all duration-300 shadow-[0_0_15px_rgba(190,18,60,0.3)] hover:shadow-[0_0_25px_rgba(190,18,60,0.6)] border border-rose-500/50"
          >
            Contact Us
          </Link>
          
          {/* User Menu */}
          <UserMenu />
        </div>

        {/* Mobile Menu Toggle & Cart */}
        <div className="flex lg:hidden items-center gap-4">
          
          {/* Mobile Cart Button */}
          <div className="relative">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 text-slate-300 cursor-pointer border-none bg-transparent"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Welcome Popup */}
            {showWelcome && <WelcomePopup />}
          </div>

          <button 
            className="text-slate-300 hover:text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Animated) */}
      <div 
        className={`lg:hidden absolute top-20 left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-0 invisible'
        }`}
      >
        <nav className="flex flex-col px-6 py-8 space-y-6 text-center">
          <Link href="/" onClick={closeMenu} className="text-lg font-medium text-slate-300 hover:text-white">Home</Link>
          <Link href="/about" onClick={closeMenu} className="text-lg font-bold text-amber-400 hover:text-amber-300">Our Story</Link>
          <Link href="/shop" onClick={closeMenu} className="text-lg font-medium text-slate-300 hover:text-white">Crafts Shop</Link>
          <Link href="/workshops" onClick={closeMenu} className="text-lg font-medium text-slate-300 hover:text-white">Shows & Workshops</Link>
          <Link href="/facilities" onClick={closeMenu} className="text-lg font-medium text-slate-300 hover:text-white">Venues</Link>
          <button onClick={() => { closeMenu(); setIsDrawerOpen(true); }} className="text-lg font-medium text-slate-300 text-center w-full">My Cart</button>
          
          <div className="pt-6 border-t border-white/10">
            <Link 
              href="/#contact" 
              onClick={closeMenu}
              className="inline-block w-full bg-rose-700 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(190,18,60,0.3)] mb-4"
            >
              Contact Us
            </Link>
            <div className="flex justify-center">
              <UserMenu />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}