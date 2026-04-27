'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Empty the cart as soon as this page loads!
    clearCart();
    
    // We only want this to run once when the page mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-xl mx-auto p-8 text-center min-h-[60vh] flex flex-col justify-center items-center">
      <div className="text-6xl mb-6 bg-green-50 w-24 h-24 rounded-full flex items-center justify-center border-4 border-green-100 shadow-sm">
        🎉
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Payment Successful!</h1>
      <p className="text-slate-600 mb-8 text-lg">
        Thank you for your order! Your authentic Kandyan artifacts are being prepared and will be on their way shortly.
      </p>
      <Link 
        href="/shop" 
        className="bg-slate-950 hover:bg-kandyan-maroon text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
      >
        Continue Shopping
      </Link>
    </div>
  );
}