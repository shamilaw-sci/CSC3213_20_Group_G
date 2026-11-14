'use client';

import Link from 'next/link';

export default function CancelledPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-24 bg-[#F8F9FA]">
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 bg-white/60 backdrop-blur-xl border border-white/80 p-10 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] text-center max-w-lg w-full flex flex-col items-center">
        
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm border border-rose-200/50">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Payment Incomplete</h1>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium">
          Your transaction was cancelled or declined. No charges were made to your account. Your items are still safely saved in your cart.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
          <Link 
            href="/checkout" 
            className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-1"
          >
            Try Payment Again
          </Link>
          <Link 
            href="/shop" 
            className="w-full sm:w-auto px-8 py-4 bg-white/60 backdrop-blur-md border border-white/80 hover:bg-white hover:border-amber-300 text-slate-700 hover:text-amber-600 font-bold rounded-2xl transition-all shadow-sm transform hover:-translate-y-1"
          >
            Return to Shop
          </Link>
        </div>

      </div>
    </main>
  );
}