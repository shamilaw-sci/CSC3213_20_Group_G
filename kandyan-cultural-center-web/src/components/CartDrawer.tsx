'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';

export default function CartDrawer() {
  const { cart, isDrawerOpen, setIsDrawerOpen, removeFromCart, cartCount } = useCart();

  if (!isDrawerOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white min-h-120 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-6 py-5.5 border-b border-slate-100 flex justify-between items-center bg-slate-950 text-white">
          <h2 className="text-lg font-bold">Your Cart ({cartCount})</h2>
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <p className="text-slate-500 font-medium">Your cart is currently empty.</p>
              <Link href="/shop" onClick={() => setIsDrawerOpen(false)} className="text-kandyan-maroon font-bold hover:underline">Continue Shopping</Link>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-kandyan-maroon transition-colors">{item.name}</h3>
                  <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                  <p className="font-bold text-kandyan-gold">LKR {(item.price * item.quantity).toLocaleString()}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-md font-medium">Subtotal</span>
              <span className="text-xl font-black text-slate-900">LKR {total.toLocaleString()}</span>
            </div>
            <Link 
              href="/cart" 
              onClick={() => setIsDrawerOpen(false)}
              className="block w-full bg-slate-950 hover:bg-kandyan-maroon text-white text-center py-3 rounded-lg text-sm font-bold transition-all shadow-md"
            >
              View Full Cart & Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}