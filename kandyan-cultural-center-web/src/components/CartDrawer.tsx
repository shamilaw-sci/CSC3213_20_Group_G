'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext'; 
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CartDrawer() {
  const router = useRouter();
  const { cart, isDrawerOpen, setIsDrawerOpen, removeFromCart, cartCount, updateQuantity } = useCart();
  const { formatPrice } = useCurrency();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isDrawerOpen) return null;

  // Use discounted_price if available, otherwise regular price
  const total = cart.reduce((sum, item) => {
    const activePrice = item.discounted_price || item.price;
    return sum + activePrice * item.quantity;
  }, 0);

  const handleCheckoutClick = async () => {
    setIsCheckingOut(true);
    
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    setIsCheckingOut(false);
    setIsDrawerOpen(false);

    if (!user) {
      router.push('/login');
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="fixed top-20 inset-x-0 bottom-0 z-[100] flex justify-end items-start sm:pr-6 md:pr-8">
      
      {/* Backdrop - Softened the dark overlay for a more elegant glass feel */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsDrawerOpen(false)}
        aria-label="Close cart" 
      />
      
      {/* Drawer Panel - Upgraded to Light Glassmorphism */}
      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-2xl shadow-[-20px_0_50px_rgba(31,38,135,0.05)] flex flex-col animate-in slide-in-from-right duration-300 rounded-b-3xl sm:rounded-2xl sm:mt-4 overflow-hidden min-h-[50vh] max-h-[80vh] border border-white/80">
        
        {/* Header - Light & Airy */}
        <div className="px-6 py-5 border-b border-white/60 flex justify-between items-center bg-white/40">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm border border-amber-200/50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            Your Cart <span className="text-amber-600">({cartCount})</span>
          </h2>
          <button 
            onClick={() => setIsDrawerOpen(false)} 
            className="p-2 text-slate-400 hover:text-rose-600 bg-white/50 hover:bg-white rounded-full transition-all cursor-pointer shadow-sm border border-transparent hover:border-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-12">
              <div className="w-24 h-24 bg-white/60 border border-white rounded-full flex items-center justify-center text-slate-300 shadow-[0_10px_30px_rgba(31,38,135,0.05)]">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <div>
                <p className="text-slate-900 font-bold text-lg">Your cart is empty.</p>
                <p className="text-slate-500 font-medium text-sm mt-1 mb-4">Looks like you haven't added anything yet.</p>
                <Link 
                  href="/shop" 
                  onClick={() => setIsDrawerOpen(false)} 
                  className="inline-block bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(217,119,6,0.3)] transition-all transform hover:-translate-y-0.5"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 group relative bg-white/50 backdrop-blur-md border border-white/80 p-3 rounded-2xl shadow-sm hover:shadow-md transition-all">
                
                {/* Product Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[1rem] overflow-hidden border border-white bg-slate-50 shrink-0">
                  <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                
                {/* Product Info & Quantity Controls */}
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div className="pr-6">
                    <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors text-sm md:text-base">{item.name}</h3>
                    <p className="font-black text-slate-900 text-sm mt-1">
                      {item.discounted_price ? formatPrice(item.discounted_price) : formatPrice(item.price)}
                    </p>
                  </div>
                  
                  {/* Quantity Selector - Glassmorphism style */}
                  <div className="flex items-center mt-2 border border-white/80 rounded-xl w-fit bg-white/60 overflow-hidden shadow-sm backdrop-blur-sm">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-3 py-1.5 text-slate-500 hover:bg-white hover:text-amber-600 transition-colors cursor-pointer font-bold"
                    >
                      −
                    </button>
                    <span className="px-2 py-1.5 text-xs font-black text-slate-900 min-w-[2.5rem] text-center border-x border-white/60">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.stock !== undefined && item.quantity >= item.stock}
                      className={`px-3 py-1.5 font-bold transition-colors ${
                        item.stock !== undefined && item.quantity >= item.stock 
                          ? 'text-slate-300 cursor-not-allowed bg-slate-50' 
                          : 'text-slate-500 hover:bg-white hover:text-amber-600 cursor-pointer'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="absolute top-2 right-2 text-slate-300 hover:text-rose-600 transition-colors p-1.5 bg-white/50 hover:bg-white rounded-full cursor-pointer shadow-sm border border-transparent hover:border-white"
                  aria-label="Remove item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/60 bg-white/40 space-y-5 backdrop-blur-md">
            <div className="flex justify-between items-end px-2">
              <span className="text-slate-500 text-xs font-extrabold uppercase tracking-widest">Subtotal</span>
              <span className="text-2xl font-black text-slate-900">{formatPrice(total)}</span>
            </div>
            
            <button 
              onClick={handleCheckoutClick}
              disabled={isCheckingOut}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white text-center py-4 rounded-[1rem] text-sm font-bold transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {isCheckingOut ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Securing Checkout...
                </>
              ) : (
                <>
                  Secure Checkout
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}