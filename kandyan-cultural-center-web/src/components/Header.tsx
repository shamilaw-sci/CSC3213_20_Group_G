'use client';

import { useState } from 'react';
import Link from 'next/link';
import UserMenu from './UserMenu';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-white/10 text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black font-bold">
            K
          </div>
          <span className="font-bold text-lg">Kandyan</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-8">
          <Link href="/">Home</Link>
          <Link href="/about">Our Story</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/workshops">Workshops</Link>
          <Link href="/facilities">Venues</Link>
        </nav>

        {/* Right Section */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/#contact"
            className="bg-rose-700 px-5 py-2 rounded-lg font-bold"
          >
            Contact Us
          </Link>

          {/* ✅ USER MENU HERE */}
          <UserMenu />
        </div>

        {/* Mobile Button */}
        <button
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 p-6 space-y-4">
          <Link href="/" onClick={closeMenu}>Home</Link>
          <Link href="/about" onClick={closeMenu}>About</Link>
          <Link href="/shop" onClick={closeMenu}>Shop</Link>
          <Link href="/workshops" onClick={closeMenu}>Workshops</Link>
          <Link href="/facilities" onClick={closeMenu}>Venues</Link>

          <UserMenu />
        </div>
      )}
    </header>
  );
}