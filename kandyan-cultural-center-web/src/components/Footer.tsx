import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-white/5 relative overflow-hidden">
      
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
      
      {/* Subtle Background Watermark */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-amber-500">
          <path d="M50 0C50 27.6 27.6 50 0 50C27.6 50 50 72.4 50 100C50 72.4 72.4 50 100 50C72.4 50 50 27.6 50 0Z" />
        </svg>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 border-b border-slate-800/50 pb-12">
          
          {/* Brand & Address (Spans 5 columns) */}
          <div className="md:col-span-12 lg:col-span-5 space-y-6">
            <div className="flex items-center space-x-3">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.3)]">K</div>
               <div>
                 <h2 className="text-xl font-extrabold text-white tracking-widest uppercase leading-none">KCC</h2>
                 <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Est. 1882</span>
               </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-md">
              Preserving and promoting the rich heritage of Kandyan Arts and Crafts for future generations.
            </p>
            <div className="text-sm font-medium text-slate-300 border-l-2 border-rose-800 pl-4 py-1">
              Kandyan Cultural Center,<br />
              72 Sangharaja Mawatha,<br />
              Kandy, Sri Lanka.
            </div>
          </div>

          {/* Quick Links (Spans 3 columns) */}
          <div className="md:col-span-6 lg:col-span-3">
            <h4 className="text-sm font-bold text-white mb-6 tracking-widest uppercase border-b border-slate-800 pb-3 inline-block">Digital Services</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/shop" className="hover:text-amber-400 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-rose-800 group-hover:bg-amber-400 transition-colors"></span> Crafts Shop</Link></li>
              <li><Link href="/workshops" className="hover:text-amber-400 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-rose-800 group-hover:bg-amber-400 transition-colors"></span> Book a Show</Link></li>
              <li><Link href="/facilities" className="hover:text-amber-400 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-rose-800 group-hover:bg-amber-400 transition-colors"></span> Rent a Facility</Link></li>
            </ul>
          </div>

          {/* Discover & Contact (Spans 4 columns) */}
          <div className="md:col-span-6 lg:col-span-4">
            <h4 className="text-sm font-bold text-white mb-6 tracking-widest uppercase border-b border-slate-800 pb-3 inline-block">Discover</h4>
            <ul className="space-y-4 text-sm font-medium mb-8">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-rose-800 group-hover:bg-amber-400 transition-colors"></span> Our Legacy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-rose-800 group-hover:bg-amber-400 transition-colors"></span> Terms and Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-rose-800 group-hover:bg-amber-400 transition-colors"></span> Privacy Policy</Link></li>
            </ul>

            {/* Compact Contact Info */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 inline-block w-full">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                +94 81 222 3100
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 mt-2">
                <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                inquiries@kandyanculture.lk
              </div>
            </div>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Kandyan Art Association. All rights reserved.
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
            Designed & Engineered by{' '}
            <a 
              href="https://noveira.site" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 font-bold bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 hover:bg-slate-800 hover:text-amber-400 hover:border-amber-500/30 transition-all duration-300"
            >
              Noveira Technologies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}