import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-24 bg-[#F8F9FA]">
      
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      <div className="relative z-10 bg-white/60 backdrop-blur-xl border border-white/80 p-10 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] text-center max-w-lg w-full flex flex-col items-center">
        
        {/* Decorative 404 Graphic */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center group cursor-default">
          <div className="absolute inset-0 bg-amber-100 rounded-[2rem] rotate-12 scale-105 border border-amber-200/50 transition-transform duration-500 group-hover:rotate-6"></div>
          <div className="absolute inset-0 bg-white rounded-[2rem] shadow-sm border border-white flex items-center justify-center -rotate-3 transition-transform duration-500 group-hover:rotate-0">
             <span className="text-5xl font-black text-amber-600 tracking-tighter">404</span>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Lost in the Archives</h1>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium">
          It looks like the artifact or page you are searching for has been moved, removed, or never existed in our collection.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
          <Link 
            href="/" 
            className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-1"
          >
            Return Home
          </Link>
          <Link 
            href="/shop" 
            className="w-full sm:w-auto px-8 py-4 bg-white/60 backdrop-blur-md border border-white/80 hover:bg-white hover:border-amber-300 text-slate-700 hover:text-amber-600 font-bold rounded-2xl transition-all shadow-sm transform hover:-translate-y-1"
          >
            Explore Shop
          </Link>
        </div>

      </div>
    </main>
  );
}