'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useCurrency, CurrencyCode } from '@/context/CurrencyContext';
import { supabase } from '@/lib/supabase';

export default function Header() {
  // --- STATE ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount, setIsDrawerOpen } = useCart();
  const [showWelcome, setShowWelcome] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const [scrolled, setScrolled] = useState(false);
  
  // User State
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---
  // 1. Fetch User Data
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    loadUser();
  }, []);

  // 2. Shrink/Adjust header on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Welcome Back Dialog Logic
  useEffect(() => {
    const hasSeen = sessionStorage.getItem('kcc_welcome_seen');
    if (!hasSeen && cartCount > 0) {
      const timer = setTimeout(() => setShowWelcome(true), 1200);
      sessionStorage.setItem('kcc_welcome_seen', 'true');
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // 4. Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // 5. Click outside handler for Desktop User Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  // --- HANDLERS ---
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const hasValidAvatar = user?.user_metadata?.avatar_url && !imgError;

  // --- REUSABLE COMPONENTS ---
  const CurrencySelector = () => (
    <div className="relative flex items-center">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        className="appearance-none bg-white/40 backdrop-blur-md border border-white/60 text-slate-700 text-xs sm:text-sm font-bold rounded-xl pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer hover:bg-white/80 transition-colors shadow-sm"
      >
        {(['LKR', 'USD', 'EUR', 'GBP', 'AUD'] as CurrencyCode[]).map((code) => (
          <option key={code} value={code} className="bg-white text-slate-900 font-medium">
            {code}
          </option>
        ))}
      </select>
      <svg className="w-3 h-3 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>
  );

  const WelcomePopup = () => (
    <div className="absolute top-full right-0 md:-right-4 mt-5 w-72 bg-white/80 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_40px_rgba(31,38,135,0.1)] border border-white/80 p-5 z-[100] animate-in slide-in-from-top-4 fade-in duration-500 cursor-default text-left">
      <div className="absolute -top-2 right-6 md:right-8 w-4 h-4 bg-white/80 backdrop-blur-xl rotate-45 border-l border-t border-white/80 rounded-sm"></div>
      
      <div className="relative z-10 flex items-start gap-4">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0 shadow-inner border border-amber-200/50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        
        <div className="flex-grow">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowWelcome(false); }}
            className="absolute -top-1 -right-1 p-1 text-slate-400 hover:text-rose-600 transition-colors bg-white/50 rounded-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <h4 className="text-slate-900 font-extrabold text-sm mb-1">Welcome back!</h4>
          <p className="text-slate-500 text-xs mb-4 leading-relaxed font-medium">
            You left {cartCount} item{cartCount > 1 ? 's' : ''} in your cart. Ready to complete your order?
          </p>
          
          <div className="flex gap-2">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowWelcome(false); 
                setIsDrawerOpen(true); 
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-all shadow-[0_4px_10px_rgba(217,119,6,0.2)] w-full"
            >
              View Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/60 backdrop-blur-2xl border-b border-white/50 shadow-sm py-2' : 'bg-transparent py-4'
      }`}>
        <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" onClick={closeMenu} className="flex items-center space-x-3 group shrink-0">
            <div className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-110">
              <Image 
                src="/logo.png" 
                alt="KCC Logo" 
                fill
                className="object-contain drop-shadow-md"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-widest uppercase leading-none text-slate-900 group-hover:text-amber-600 transition-colors">
                Kandyan
              </span>
              <span className="text-[10px] font-medium tracking-[0.2em] text-slate-500 uppercase leading-none mt-1">
                Cultural Center
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 font-bold text-sm tracking-wide">
            <Link href="/" className="text-slate-600 hover:text-amber-600 transition-colors">Home</Link>
            <Link href="/about" className="text-slate-600 hover:text-amber-600 transition-colors">Our Story</Link>
            <Link href="/shop" className="text-slate-600 hover:text-amber-600 transition-colors">Crafts Shop</Link>
            <Link href="/workshops" className="text-slate-600 hover:text-amber-600 transition-colors">Workshops</Link>
            <Link href="/facilities" className="text-slate-600 hover:text-amber-600 transition-colors">Book Hall</Link>
            <Link href="/#contact" className="text-slate-600 hover:text-amber-600 transition-colors">Contact</Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-5">
            <CurrencySelector />
            
            <div className="relative">
              <button 
                onClick={() => setIsDrawerOpen(true)} 
                className="relative p-2 text-slate-700 hover:text-amber-600 transition-colors group cursor-pointer border-none bg-transparent"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {showWelcome && <WelcomePopup />}
            </div>
            
            {/* DESKTOP USER MENU (Modern Integrated) */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-white/40 transition outline-none border border-transparent hover:border-white/80 shadow-sm"
                  >
                    {hasValidAvatar ? (
                      <Image
                        src={user.user_metadata.avatar_url}
                        width={36}
                        height={36}
                        alt="User avatar"
                        className="rounded-full object-cover w-9 h-9 border-2 border-white"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-400 shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Desktop Dropdown Panel */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_rgba(31,38,135,0.1)] border border-white/80 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-5 py-4 border-b border-slate-100/50 bg-white/50">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-0.5">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50/80 hover:text-amber-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                          Dashboard
                        </Link>
                      </div>
                      <div className="border-t border-slate-100/50 py-2 bg-white/50">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 text-left px-5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-[0_4px_10px_rgba(217,119,6,0.2)] hover:shadow-[0_8px_15px_rgba(217,119,6,0.3)] transition-all whitespace-nowrap text-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Actions & Hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            <CurrencySelector />
            
            <div className="relative">
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-2 text-slate-700 cursor-pointer border-none bg-transparent"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
              {showWelcome && <WelcomePopup />}
            </div>

            <button 
              className="text-slate-800 hover:text-amber-600 p-1.5 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* MODERN FULL-PAGE MOBILE MENU OVERLAY */}
      <div 
        className={`lg:hidden fixed inset-0 z-[100] bg-white/90 backdrop-blur-3xl transition-all duration-500 ease-in-out flex flex-col ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-8'
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="container mx-auto px-6 h-20 flex items-center justify-between flex-shrink-0 border-b border-slate-100">
          <Link href="/" onClick={closeMenu} className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image src="/android-chrome-512x512.png" alt="KCC Logo" fill className="object-contain" />
            </div>
          </Link>
          <button 
            className="p-2 text-slate-800 hover:text-rose-600 bg-white/50 rounded-full border border-white/60 shadow-sm transition-colors"
            onClick={closeMenu}
            aria-label="Close Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Links */}
        <div className="flex-grow overflow-y-auto">
          <nav className="flex flex-col items-center justify-center min-h-full py-10 space-y-6">
            
            <Link href="/" onClick={closeMenu} className="text-3xl font-black text-slate-900 hover:text-amber-600 transition-colors">Home</Link>
            <Link href="/about" onClick={closeMenu} className="text-3xl font-black text-slate-900 hover:text-amber-600 transition-colors">Our Story</Link>
            <Link href="/shop" onClick={closeMenu} className="text-3xl font-black text-slate-900 hover:text-amber-600 transition-colors">Crafts Shop</Link>
            <Link href="/workshops" onClick={closeMenu} className="text-3xl font-black text-slate-900 hover:text-amber-600 transition-colors">Workshops</Link>
            <Link href="/facilities" onClick={closeMenu} className="text-3xl font-black text-slate-900 hover:text-amber-600 transition-colors">Book Hall</Link>
            <Link href="/#contact" onClick={closeMenu} className="text-3xl font-black text-slate-900 hover:text-amber-600 transition-colors">Contact Us</Link>
            
            {/* View Cart Button */}
            <button 
              onClick={() => { closeMenu(); setIsDrawerOpen(true); }} 
              className="text-lg font-extrabold text-amber-600 flex items-center gap-2 mt-4 bg-amber-50 px-8 py-3.5 rounded-full border border-amber-200 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              View My Cart {cartCount > 0 && `(${cartCount})`}
            </button>

            {/* Subtle Divider */}
            <div className="w-16 h-px bg-slate-300 my-4"></div>

            {/* INTEGRATED MOBILE USER SECTION */}
            {user ? (
              <div className="flex flex-col items-center gap-5 w-full px-6">
                
                {/* Profile Card Summary */}
                <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] w-full max-w-sm">
                  {hasValidAvatar ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      width={48}
                      height={48}
                      alt="User avatar"
                      className="rounded-full object-cover w-12 h-12 border-2 border-white shadow-sm"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mb-1">Welcome</span>
                    <span className="text-base font-black text-slate-900 truncate w-full">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                  </div>
                </div>

                {/* Dashboard Link */}
                <Link 
                  href="/profile" 
                  onClick={closeMenu} 
                  className="text-xl font-black text-slate-700 hover:text-amber-600 transition-colors flex items-center gap-2"
                >
                  Dashboard
                </Link>

                {/* Sign Out Button */}
                <button 
                  onClick={handleLogout} 
                  className="text-xl font-black text-rose-600 hover:text-rose-500 transition-colors"
                >
                  Sign Out
                </button>
                
              </div>
            ) : (
              <Link 
                href="/login" 
                onClick={closeMenu} 
                className="text-lg font-extrabold text-white bg-amber-600 px-10 py-3.5 rounded-full shadow-[0_8px_20px_rgba(217,119,6,0.25)] transition-all active:scale-95 mt-2"
              >
                Sign In / Sign Up
              </Link>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}