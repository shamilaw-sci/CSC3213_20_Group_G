'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CartDrawer() {
  const router = useRouter();
  const { cart, isDrawerOpen, setIsDrawerOpen, removeFromCart, cartCount, updateQuantity } = useCart();
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
    <div className="fixed top-20 inset-x-0 bottom-0 z-[40] flex justify-end items-start pr-4 sm:pr-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsDrawerOpen(false)}
        aria-label="Close cart" 
      />
      
      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 rounded-b-3xl sm:rounded-2xl sm:mt-4 overflow-hidden min-h-[50vh] max-h-[75vh] border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-950 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <svg className="w-5 h-5 text-kandyan-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            Your Cart ({cartCount})
          </h2>
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-10">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 shadow-inner">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <p className="text-slate-500 font-medium">Your cart is currently empty.</p>
              <Link href="/shop" onClick={() => setIsDrawerOpen(false)} className="text-kandyan-maroon font-bold hover:underline">Continue Shopping</Link>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 group relative">
                
                {/* Product Image */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                </div>
                
                {/* Product Info & Quantity Controls */}
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div className="pr-6">
                    <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-kandyan-maroon transition-colors text-sm">{item.name}</h3>
                    <p className="font-black text-kandyan-gold text-sm mt-1">
                      LKR {item.discounted_price ? item.discounted_price.toLocaleString() : item.price.toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center mt-2 border border-slate-200 rounded-lg w-fit bg-white overflow-hidden shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-3 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer font-bold"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-xs font-black text-slate-900 min-w-[2.5rem] text-center border-x border-slate-100">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="absolute top-1 right-0 text-slate-300 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                  aria-label="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">Subtotal</span>
              <span className="text-2xl font-black text-slate-900">LKR {total.toLocaleString()}</span>
            </div>
            
            <button 
              onClick={handleCheckoutClick}
              disabled={isCheckingOut}
              className="w-full bg-slate-950 hover:bg-kandyan-maroon text-white text-center py-4 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Securing Checkout...
                </>
              ) : (
                <>
                  Secure Checkout
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}