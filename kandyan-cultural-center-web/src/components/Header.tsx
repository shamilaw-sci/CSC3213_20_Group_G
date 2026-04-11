import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-white/10 text-white sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 max-w-7xl h-20 flex items-center justify-between">
        
        {/* Modern Logo Section */}
        <Link href="/" className="flex items-center space-x-3 group">
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

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8 font-medium text-sm tracking-wide">
          <Link href="/" className="text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Home</Link>
          <Link href="/about" className="text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Our Story</Link>
          <Link href="/shop" className="text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Crafts Shop</Link>
          <Link href="/workshops" className="text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Shows & Workshops</Link>
          <Link href="/facilities" className="text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">Venues</Link>
        </nav>

        {/* CTA Button */}
        <div className="hidden lg:block">
          <Link 
            href="/#contact" 
            className="bg-rose-700 hover:bg-rose-600 text-white px-6 py-2.5 rounded-lg font-bold transition-all duration-300 shadow-[0_0_15px_rgba(190,18,60,0.3)] hover:shadow-[0_0_25px_rgba(190,18,60,0.6)] border border-rose-500/50"
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile Menu Placeholder (Hamburger icon) */}
        <button className="lg:hidden text-slate-300 hover:text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}