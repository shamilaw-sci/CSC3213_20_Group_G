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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('booking');
    if (!bookingId) return;

    (async () => {
      try {
        const { data } = await supabase
          .from('workshop_bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (data) setBookingInfo(data);
      } catch (e) {
        console.warn('Failed to fetch booking details', e);
      }
    })();
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

        {bookingInfo ? (
          <div className="text-left mb-6">
            <p className="text-slate-700">Thank you, <strong>{bookingInfo.customer_name}</strong>.</p>
            <p className="text-slate-700">Your booking for <strong>{bookingInfo.workshop_title}</strong> on <strong>{bookingInfo.booked_date}</strong> at <strong>{bookingInfo.booked_time}</strong> is confirmed.</p>
            <p className="text-slate-500 mt-3">Booking reference: <span className="font-mono">{bookingInfo.id}</span></p>
          </div>
        ) : (
          <p className="text-slate-500 mb-8">Thank you — your payment was successful. We are fetching your booking details now.</p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/profile" 
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md"
          >
            View Dashboard
          </Link>
          <Link 
            href="/workshops" 
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-md"
          >
            Browse Workshops
          </Link>
        </div>
      </div>
    </div>
  );
}