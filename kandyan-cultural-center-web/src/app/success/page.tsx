'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function SuccessPage() {
  const [bookingInfo, setBookingInfo] = useState<any | null>(null);
  const [orderInfo, setOrderInfo] = useState<any | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('booking');
    const orderId = params.get('order');

    (async () => {
      try {
        if (bookingId) {
          const { data } = await supabase.from('workshop_bookings').select('*').eq('id', bookingId).single();
          if (data) setBookingInfo(data);
        } else if (orderId) {
          const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
          if (data) setOrderInfo(data);
        }
      } catch (e) {
        console.warn('Failed to fetch transaction details', e);
      }
    })();
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-24 bg-[#F8F9FA]">
      
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 bg-white/60 backdrop-blur-xl border border-white/80 p-10 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] text-center max-w-lg w-full flex flex-col items-center">
        
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-200/50">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">Payment Successful!</h1>

        {bookingInfo && (
          <div className="text-left mb-8 bg-white/50 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/80 shadow-sm w-full">
            <p className="text-slate-700 font-medium leading-relaxed">Thank you, <strong className="text-slate-900">{bookingInfo.customer_name}</strong>.</p>
            <p className="text-slate-700 font-medium leading-relaxed mt-1">Your booking for <strong className="text-amber-600">{bookingInfo.workshop_title}</strong> on <strong className="text-slate-900">{bookingInfo.booked_date}</strong> is confirmed.</p>
            <div className="mt-5 pt-5 border-t border-white/60">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Booking reference</p>
              <p className="font-mono font-bold text-slate-700 text-sm mt-1.5 bg-white/80 border border-white px-3 py-1.5 rounded-lg inline-block">{bookingInfo.id}</p>
            </div>
          </div>
        )}

        {orderInfo && (
          <div className="text-left mb-8 bg-white/50 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/80 shadow-sm w-full">
            <p className="text-slate-900 font-black mb-2 text-lg">Your Artifact Order is Confirmed.</p>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">We are preparing your items for shipment to: <br/><strong className="text-slate-800">{orderInfo.shipping_address}</strong></p>
            <div className="mt-5 pt-5 border-t border-white/60">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Order ID</p>
              <p className="font-mono font-bold text-slate-700 text-sm mt-1.5 bg-white/80 border border-white px-3 py-1.5 rounded-lg inline-block">{orderInfo.id}</p>
            </div>
          </div>
        )}

        {!bookingInfo && !orderInfo && (
          <p className="text-slate-500 mb-8 font-medium leading-relaxed bg-white/40 p-5 rounded-2xl border border-white/60">
            Thank you — your payment was successful. We are fetching your order details now.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
          <Link 
            href="/profile" 
            className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-1"
          >
            View Dashboard
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