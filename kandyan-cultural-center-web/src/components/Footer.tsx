import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-white/5 relative overflow-hidden">
      
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>

      <div className="container mx-auto px-6 max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        
        {/* Brand & Address */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-black text-sm">K</div>
             <span className="text-xl font-extrabold text-white tracking-widest uppercase">KCC</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Preserving and promoting the rich heritage of Kandyan Arts and Crafts for future generations.
          </p>
          <div className="text-sm font-medium text-slate-300 border-l-2 border-rose-700 pl-3">
            Kandy Cultural Center,<br />
            Sangharaja Mawatha,<br />
            Kandy, Sri Lanka.
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-bold text-white mb-6 tracking-wide">Digital Services</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/shop" className="hover:text-amber-400 transition-colors flex items-center gap-2"><span className="text-rose-700">&rarr;</span> Crafts Shop</Link></li>
            <li><Link href="/workshops" className="hover:text-amber-400 transition-colors flex items-center gap-2"><span className="text-rose-700">&rarr;</span> Book a Workshop</Link></li>
            <li><Link href="/facilities" className="hover:text-amber-400 transition-colors flex items-center gap-2"><span className="text-rose-700">&rarr;</span> Rent a Facility</Link></li>
          </ul>
        </div>

        {/* Discover */}
        <div>
          <h4 className="text-lg font-bold text-white mb-6 tracking-wide">Discover</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/about" className="hover:text-amber-400 transition-colors flex items-center gap-2"><span className="text-rose-700">&rarr;</span> Our Story</Link></li>
            <li><Link href="/artisans" className="hover:text-amber-400 transition-colors flex items-center gap-2"><span className="text-rose-700">&rarr;</span> Meet the Craftmen</Link></li>
            <li><Link href="/gallery" className="hover:text-amber-400 transition-colors flex items-center gap-2"><span className="text-rose-700">&rarr;</span> Heritage Gallery</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-lg font-bold text-white mb-6 tracking-wide">Stay Connected</h4>
          <p className="text-sm mb-4 text-slate-400">Subscribe for updates on cultural shows and exclusive artifact releases.</p>
          <form className="flex flex-col space-y-3">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white outline-none transition-all placeholder:text-slate-600"
            />
            <button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500 text-white px-4 py-3 rounded-lg font-bold transition-all duration-300">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="container mx-auto px-6 max-w-7xl mt-16 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Kandyan Art Association. All rights reserved.
        </div>
        <div className="text-sm text-slate-500 flex items-center gap-2">
          Designed & Engineered by{' '}
          <a 
            href="https://noveira.site" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-300 font-bold bg-slate-800 px-2 py-1 rounded hover:bg-slate-700 hover:text-amber-400 transition-colors duration-300"
          >
            Noveira Technologies
          </a>
        </div>
      </div>
    </footer>
  );
}