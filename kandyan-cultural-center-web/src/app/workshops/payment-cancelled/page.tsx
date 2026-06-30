'use client';

import Link from 'next/link';

export default function WorkshopCancelledPage() {
  return (
    <div className="min-h-[80vh] bg-slate-50 flex flex-col items-center justify-center p-6 py-20">
      <div className="bg-white rounded-[20px] shadow-sm p-8 sm:p-10 max-w-lg w-full text-center border border-slate-200">
        
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100 shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-[#072146] mb-4">Booking Incomplete</h1>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          Your transaction was cancelled or declined, so your workshop spot has <span className="font-bold text-slate-700">not</span> been reserved. No charges were made to your account.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/workshops" 
            className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-all shadow-md flex-1"
          >
            Return to Workshops
          </Link>
          <Link 
            href="/profile" 
            className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex-1"
          >
            Go to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}