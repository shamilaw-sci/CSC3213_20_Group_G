import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white/30 backdrop-blur-xl text-slate-600 pt-16 pb-8 border-t border-white/60 relative overflow-hidden mt-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
      
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"></div>
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 border-b border-slate-200/60 pb-12">
          
          {/* Brand & Address (Spans 5 columns) */}
          <div className="md:col-span-12 lg:col-span-5 space-y-6">
            <div className="flex items-center space-x-3">
               <div className="relative w-12 h-12">
                 <Image src="/logo.png" alt="KCC Logo" fill className="object-contain" />
               </div>
               <div>
                 <h2 className="text-xl font-extrabold text-slate-900 tracking-widest uppercase leading-none">Kandyan Cultural Center</h2>
                 <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Est. 1882</span>
               </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 max-w-md">
              Preserving and promoting the rich heritage of Kandyan Arts and Crafts for future generations.
            </p>
            <div className="text-sm font-medium text-slate-700 border-l-2 border-amber-500 pl-4 py-1">
              Kandyan Cultural Center,<br />
              72 Sangharaja Mawatha,<br />
              Kandy, Sri Lanka.
            </div>
          </div>

          {/* Quick Links (Spans 3 columns) */}
          <div className="md:col-span-6 lg:col-span-3">
            <h4 className="text-sm font-bold text-slate-900 mb-6 tracking-widest uppercase border-b border-white/60 pb-3 inline-block">Digital Services</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-600">
              <li><Link href="/shop" className="hover:text-amber-600 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-500 transition-colors"></span> Crafts Shop</Link></li>
              <li><Link href="/workshops" className="hover:text-amber-600 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-500 transition-colors"></span> Book a Show</Link></li>
              <li><Link href="/facilities" className="hover:text-amber-600 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-500 transition-colors"></span> Rent a Facility</Link></li>
            </ul>
          </div>

          {/* Discover & Contact (Spans 4 columns) */}
          <div className="md:col-span-6 lg:col-span-4">
            <h4 className="text-sm font-bold text-slate-900 mb-6 tracking-widest uppercase border-b border-white/60 pb-3 inline-block">Discover</h4>
            <ul className="space-y-4 text-sm font-medium mb-8 text-slate-600">
              <li><Link href="/about" className="hover:text-amber-600 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-500 transition-colors"></span> Our Legacy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-600 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-500 transition-colors"></span> Terms and Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-amber-600 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-500 transition-colors"></span> Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-amber-600 transition-colors flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-amber-500 transition-colors"></span> Refund Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} Kandyan Art Association. All rights reserved.
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 font-medium">
            Designed & Engineered by{' '}
            <a 
              href="https://noveira.site" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-700 font-bold bg-white/60 px-2.5 py-1 rounded-md border border-white hover:bg-white hover:text-amber-600 transition-all duration-300 shadow-sm"
            >
              Noveira Technologies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}