'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function formatTimeForDisplay(timeStr: string) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export default function WorkshopSuccessPage() {
  const [bookingInfo, setBookingInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      const params = new URLSearchParams(window.location.search);
      const bookingId = params.get('booking');
      
      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('workshop_bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (data) {
          setBookingInfo(data);
        }
      } catch (e) {
        console.warn('Failed to fetch booking details', e);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, []);

  return (
    <div className="min-h-[80vh] bg-slate-50 flex flex-col items-center justify-center p-6 py-20">
      <div className="bg-white rounded-[20px] shadow-sm p-8 sm:p-10 max-w-lg w-full text-center border border-slate-200">
        
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-[#072146] mb-4">Booking Confirmed!</h1>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
          </div>
        ) : bookingInfo ? (
          <div className="text-left mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-slate-700 mb-3">
              Thank you, <span className="font-bold">{bookingInfo.customer_name}</span>! Your spot is secured.
            </p>
            
            <div className="space-y-2 text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between">
                <span className="font-medium">Workshop:</span>
                <span className="font-bold text-slate-900 text-right">{bookingInfo.workshop_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span className="font-bold text-slate-900 text-right">
                  {new Date(bookingInfo.booked_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time:</span>
                <span className="font-bold text-slate-900 text-right">{formatTimeForDisplay(bookingInfo.booked_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Guests:</span>
                <span className="font-bold text-slate-900 text-right">{bookingInfo.guests}</span>
              </div>
            </div>

            <p className="text-slate-500 mt-4 text-xs text-center">
              Booking Ref: <span className="font-mono text-slate-700">{bookingInfo.id}</span>
            </p>
          </div>
        ) : (
          <p className="text-slate-500 mb-8">
            Thank you — your payment was successful. We've sent a confirmation email to your registered address.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/profile" 
            className="px-6 py-3.5 bg-[#072146] hover:bg-[#031426] text-white font-semibold rounded-xl transition-all shadow-md flex-1"
          >
            View Dashboard
          </Link>
          <Link 
            href="/workshops" 
            className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-all shadow-md flex-1"
          >
            Browse Workshops
          </Link>
        </div>

      </div>
    </div>
  );
}