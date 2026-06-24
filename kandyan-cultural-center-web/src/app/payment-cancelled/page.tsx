'use client';

import Link from 'next/link';

export default function CancelledPage() {
  return (
    <div className="min-h-[80vh] bg-stone-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center border border-slate-100">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Payment Incomplete</h1>
        <p className="text-slate-500 mb-8">
          Your transaction was cancelled or declined. No charges were made to your account. Your items are still safely saved in your cart.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/checkout" 
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-md"
          >
            Try Payment Again
          </Link>
          <Link 
            href="/shop" 
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}