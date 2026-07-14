'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

// --- INTERFACES ---
interface OrderItem {
  quantity: number;
  selling_price_at_sale: number;
  artifact_variants: {
    color_name: string;
    image_url: string;
    artifacts: {
      name: string;
    };
  };
}

interface Order {
  id: string;
  created_at: string;
  status: string; 
  total_amount: number;
  shipping_address: string;
  order_items: OrderItem[];
}

interface Booking {
  id: string;
  created_at: string;
  booking_date: string;
  event_name: string;
  expected_guests: number;
  special_requirements: string;
  status: string; 
}

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setIsLoading(false);
        return;
      }

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();
      setProfile(profileData);

      // Fetch Orders WITH nested items and artifact details
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            selling_price_at_sale,
            artifact_variants (
              color_name,
              image_url,
              artifacts ( name )
            )
          )
        `)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (ordersData) setOrders(ordersData as any);

      // Fetch Hall Bookings
      const { data: bookingsData } = await supabase
        .from('hall_bookings')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (bookingsData) setBookings(bookingsData);

      setIsLoading(false);
    };

    load();
  }, []);

  // Determine logical stage for Order Tracker
  const getOrderStep = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'pending') return 1; 
    if (s === 'completed' || s === 'paid') return 2; 
    if (s === 'shipped') return 3; 
    if (s === 'delivered') return 4; 
    return 0; 
  };

  // Determine Hall Booking Status
  const getBookingDisplayStatus = (booking: Booking) => {
    const isPast = new Date(booking.booking_date) < new Date();
    const s = booking.status.toLowerCase();

    if (s === 'approved' && isPast) return { label: 'Completed', color: 'bg-emerald-50/80 text-emerald-700 border-emerald-200' };
    if (s === 'approved') return { label: 'Approved', color: 'bg-emerald-50/80 text-emerald-700 border-emerald-200' };
    if (s === 'rejected') return { label: 'Rejected', color: 'bg-rose-50/80 text-rose-700 border-rose-200' };
    return { label: 'Pending Review', color: 'bg-amber-50/80 text-amber-700 border-amber-200' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500 font-bold bg-[#F8F9FA]">
        Please log in to view this page.
      </div>
    );
  }

  const hasValidAvatar = profile.avatar_url && !imgError;

  return (
    <main className="relative min-h-screen pt-32 md:pt-40 pb-24 px-4 sm:px-8 bg-[#F8F9FA]">
      
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-12">

        {/* --- PROFILE HEADER CARD --- */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] border border-white/80 overflow-hidden relative mt-12 sm:mt-16">
          <div className="px-6 sm:px-10 pb-10 relative">
            {hasValidAvatar ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-28 h-28 sm:w-32 sm:h-32 rounded-[1.5rem] border-4 border-white/80 shadow-md absolute -top-14 sm:-top-16 left-6 sm:left-10 object-cover bg-white" onError={() => setImgError(true)} />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[1.5rem] border-4 border-white/80 shadow-md absolute -top-14 sm:-top-16 left-6 sm:left-10 bg-amber-100 flex items-center justify-center text-amber-600">
                <span className="text-4xl font-black">{profile.full_name?.charAt(0) || 'U'}</span>
              </div>
            )}
            <div className="absolute right-6 sm:right-10 top-6 sm:top-8">
              <Link href="/edit-profile" className="inline-flex items-center gap-2 bg-white/50 hover:bg-white text-slate-700 hover:text-amber-600 border border-white/80 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm text-sm">
                Edit Profile
              </Link>
            </div>
            <div className="mt-20 sm:mt-24 sm:ml-40">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{profile.full_name || 'Anonymous User'}</h2>
              <p className="text-slate-500 font-medium mt-1">{profile.email}</p>
              <p className="text-xs text-slate-400 mt-3 font-bold uppercase tracking-widest">Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* --- ORDERS SECTION --- */}
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4">
            <span className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm border border-amber-200/50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </span>
            Artifact Orders
          </h3>

          {orders.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-10 border border-white/80 shadow-sm text-center">
              <p className="text-slate-500 font-medium mb-4">You haven't placed any orders yet.</p>
              <Link href="/shop" className="text-amber-600 font-bold hover:underline">Explore the Shop →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {orders.map((order) => {
                const step = getOrderStep(order.status);
                const isFailed = order.status.toLowerCase() === 'cancelled' || order.status.toLowerCase() === 'failed';
                
                return (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/80 hover:shadow-[0_10px_30px_rgba(31,38,135,0.05)] hover:border-amber-300 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xl font-black text-slate-900">LKR {order.total_amount?.toLocaleString()}</p>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${
                        isFailed ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        step === 4 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        step >= 2 ? 'bg-amber-100 text-amber-700 border-amber-300' :
                        'bg-white text-slate-600 border-slate-200'
                      }`}>
                        {order.status === 'completed' ? 'Paid / Processing' : order.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/60">
                      <p className="text-sm font-medium text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                      <span className="text-xs font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        View Details <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- HALL BOOKINGS SECTION --- */}
        <div className="pt-6">
          <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4">
            <span className="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-sm border border-slate-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </span>
            Hall Bookings
          </h3>

          {bookings.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-10 border border-white/80 shadow-sm text-center">
              <p className="text-slate-500 font-medium mb-4">You have no hall booking requests.</p>
              <Link href="/facilities" className="text-amber-600 font-bold hover:underline">Book the Grand Heritage Hall →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {bookings.map((booking) => {
                const display = getBookingDisplayStatus(booking);
                return (
                  <div 
                    key={booking.id} 
                    onClick={() => setSelectedBooking(booking)}
                    className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/80 shadow-sm hover:shadow-[0_10px_30px_rgba(31,38,135,0.05)] hover:border-amber-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-l-[6px] border-l-amber-500 group"
                  >
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Event Date: {new Date(booking.booking_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">{booking.event_name}</p>
                      <p className="text-sm font-medium text-slate-500 mt-2">Requested on {new Date(booking.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      <span className={`inline-flex items-center px-4 py-2 font-bold rounded-xl text-sm border shadow-sm backdrop-blur-md ${display.color}`}>
                        {display.label}
                      </span>
                      <svg className="w-5 h-5 text-slate-300 group-hover:text-amber-600 transition-colors hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* MODAL: ORDER DETAILS                        */}
      {/* ========================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/60 flex justify-between items-center bg-white/40">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Order #{selectedOrder.id.slice(0, 8)}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2.5 bg-white/60 hover:bg-white rounded-full text-slate-500 hover:text-rose-600 transition-colors shadow-sm border border-white/80">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8 no-scrollbar">
              
              {/* STATUS TRACKER */}
              <div className="bg-white/60 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-white/80 shadow-sm">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-6">Delivery Status</h4>
                {selectedOrder.status.toLowerCase() === 'cancelled' || selectedOrder.status.toLowerCase() === 'failed' ? (
                  <div className="text-rose-700 font-bold bg-rose-50/80 p-4 rounded-2xl border border-rose-200 text-center">
                    This order was {selectedOrder.status}.
                  </div>
                ) : (
                  <div className="relative flex justify-between items-center px-2">
                    <div className="absolute top-1/2 left-0 w-full h-1.5 bg-white -translate-y-1/2 rounded-full z-0 shadow-inner"></div>
                    <div className="absolute top-1/2 left-0 h-1.5 bg-amber-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                         style={{ width: `${(getOrderStep(selectedOrder.status) - 1) * 33.33}%` }}></div>
                    
                    {['Pending', 'Processing', 'Shipped', 'Delivered'].map((stepName, i) => {
                      const stepNum = i + 1;
                      const active = getOrderStep(selectedOrder.status) >= stepNum;
                      return (
                        <div key={stepName} className="relative z-10 flex flex-col items-center gap-2.5">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-colors ${active ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'bg-slate-100 border-white text-slate-400 shadow-inner'}`}>
                            {active ? <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> : stepNum}
                          </div>
                          <span className={`text-[9px] sm:text-[11px] font-black uppercase tracking-widest ${active ? 'text-slate-900' : 'text-slate-400'}`}>{stepName}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ADDRESS & SUMMARY */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/80 shadow-sm">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Shipping Address</h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {selectedOrder.shipping_address || "No address provided."}
                  </p>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/80 shadow-sm flex flex-col justify-center">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Order Total</h4>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">LKR {selectedOrder.total_amount?.toLocaleString()}</span>
                </div>
              </div>

              {/* ITEMS LIST */}
              <div>
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Purchased Items</h4>
                <div className="space-y-4">
                  {selectedOrder.order_items?.length > 0 ? (
                    selectedOrder.order_items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-[1.5rem] border border-white/80 bg-white/60 backdrop-blur-sm shadow-sm hover:bg-white transition-colors">
                        <div className="w-20 h-20 rounded-2xl bg-slate-50 overflow-hidden relative shrink-0 border border-slate-100 shadow-inner">
                          {item.artifact_variants?.image_url ? (
                            <Image src={item.artifact_variants.image_url} alt="Item" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">📦</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-extrabold text-slate-900 text-base">{item.artifact_variants?.artifacts?.name || 'Unknown Artifact'}</p>
                          <p className="text-xs font-bold text-slate-500 mt-1">Color: {item.artifact_variants?.color_name || 'Standard'} • Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-lg">LKR {(item.selling_price_at_sale * item.quantity).toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">LKR {item.selling_price_at_sale.toLocaleString()} each</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">Item details unavailable for this order.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL: HALL BOOKING DETAILS                 */}
      {/* ========================================= */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[2.5rem] w-full max-w-lg overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/60 flex justify-between items-center bg-white/40">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Hall Booking</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Ref #{selectedBooking.id.slice(0, 8)}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2.5 bg-white/60 hover:bg-white rounded-full text-slate-500 hover:text-rose-600 transition-colors shadow-sm border border-white/80">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/80 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Current Status</span>
                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border shadow-sm ${getBookingDisplayStatus(selectedBooking).color}`}>
                  {getBookingDisplayStatus(selectedBooking).label}
                </span>
              </div>

              <div className="space-y-5">
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/80 shadow-sm">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Event Type</label>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{selectedBooking.event_name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/80 shadow-sm">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Reserved Date</label>
                    <p className="text-lg font-black text-slate-900">{new Date(selectedBooking.booking_date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/80 shadow-sm">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Expected Guests</label>
                    <p className="text-lg font-black text-slate-900">{selectedBooking.expected_guests} People</p>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/80 shadow-sm">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Special Requirements</label>
                  <div className="text-sm font-medium text-slate-700 min-h-[4rem] leading-relaxed">
                    {selectedBooking.special_requirements || <span className="italic text-slate-400">None provided.</span>}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button onClick={() => setSelectedBooking(null)} className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-bold rounded-2xl transition-all shadow-sm">
                  Close Window
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}