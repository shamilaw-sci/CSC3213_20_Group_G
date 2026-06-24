'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function SuccessPage() {
  const { clearCart } = useCart();

useEffect(() => {
    // Automatically wipe the cart when the user lands on the success page
    clearCart();
    
    // Using an empty dependency array ensures this runs exactly ONCE when the page loads, 
    // preventing the infinite re-render loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[80vh] bg-stone-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center border border-slate-100">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Payment Successful!</h1>
        <p className="text-slate-500 mb-8">
          Thank you for your purchase. Your payment has been securely processed and your authentic Kandyan artifacts will be prepared for shipping.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/profile" 
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md"
          >
            View Dashboard
          </Link>
          <Link 
            href="/shop" 
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-md"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}