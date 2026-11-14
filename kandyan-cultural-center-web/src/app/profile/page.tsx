'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

// interfaces for type safety
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

interface HallBooking {
  id: string;
  created_at: string;
  booking_date: string;
  event_name: string;
  expected_guests: number;
  special_requirements: string;
  status: string; 
}

interface WorkshopBooking {
  id: string;
  created_at: string;
  booked_date: string;
  booked_time: string;
  workshop_title: string;
  craftsman: string;
  customer_name: string;
  customer_email: string;
  guests: number;
  notes?: string;
  status: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hallBookings, setHallBookings] = useState<HallBooking[]>([]);
  const [workshopBookings, setWorkshopBookings] = useState<WorkshopBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  // Pagination Toggles
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAllUpcomingWorkshops, setShowAllUpcomingWorkshops] = useState(false);
  const [showAllPastWorkshops, setShowAllPastWorkshops] = useState(false);
  const [showAllHallBookings, setShowAllHallBookings] = useState(false);

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedHallBooking, setSelectedHallBooking] = useState<HallBooking | null>(null);
  const [selectedWorkshopBooking, setSelectedWorkshopBooking] = useState<WorkshopBooking | null>(null);

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

      // Fetch Orders with nested items
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

      // Fetch Workshop Bookings
      const { data: wsBookingsData } = await supabase
        .from('workshop_bookings')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('booked_date', { ascending: false });

      if (wsBookingsData) setWorkshopBookings(wsBookingsData as any);

      // Fetch Hall Bookings
      const { data: bookingsData } = await supabase
        .from('hall_bookings')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (bookingsData) setHallBookings(bookingsData);

      setIsLoading(false);
    };

    load();
  }, []);

  const getOrderBadgeInfo = (status: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pending': return { label: 'Pending Payment', color: 'bg-white/60 text-slate-700 border-white/80' };
      case 'processing': return { label: 'Processing', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'completed': return { label: 'Order Placed', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
      case 'reviewed': return { label: 'Reviewed', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' };
      case 'handed to courier': return { label: 'Handed to Courier', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'delivered': return { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'cancelled': return { label: 'Cancelled', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'failed': return { label: 'Failed', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      default: return { label: status, color: 'bg-white text-slate-600 border-slate-200' };
    }
  };

  const getOrderStep = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return 1; 
    if (s === 'processing') return 2; 
    if (s === 'reviewed') return 3; 
    if (s === 'handed to courier') return 4; 
    if (s === 'delivered') return 5; 
    return 0; // Covers 'pending', 'failed', 'cancelled'
  };

  const getHallBookingDisplayStatus = (booking: HallBooking) => {
    const isPast = new Date(booking.booking_date) < new Date();
    const s = booking.status.toLowerCase();

    if (s === 'approved' && isPast) return { label: 'Completed', color: 'bg-emerald-50/80 text-emerald-700 border-emerald-200' };
    if (s === 'approved') return { label: 'Approved', color: 'bg-emerald-50/80 text-emerald-700 border-emerald-200' };
    if (s === 'rejected') return { label: 'Rejected', color: 'bg-rose-50/80 text-rose-700 border-rose-200' };
    return { label: 'Pending Review', color: 'bg-amber-50/80 text-amber-700 border-amber-200' };
  };

  const getWorkshopBookingBadge = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'confirmed') return { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (s === 'failed' || s === 'cancelled') return { label: 'Failed', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    return { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' };
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

  // Split workshop bookings into Upcoming and Past
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingWorkshops = workshopBookings.filter((b) => b.booked_date >= todayStr);
  const pastWorkshops = workshopBookings.filter((b) => b.booked_date < todayStr);

  return (
    <main className="relative min-h-screen pt-32 md:pt-40 pb-24 px-4 sm:px-8 bg-[#F8F9FA]">
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-12">

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

        {/* artifacts orders */}
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(showAllOrders ? orders : orders.slice(0, 5)).map((order) => {
                  const badge = getOrderBadgeInfo(order.status);
                  
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
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${badge.color}`}>
                          {badge.label}
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

              {orders.length > 5 && (
                <div className="text-center mt-6">
                  <button 
                    onClick={() => setShowAllOrders(!showAllOrders)}
                    className="px-6 py-2.5 bg-white/70 hover:bg-white text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl border border-white/80 shadow-sm transition-all"
                  >
                    {showAllOrders ? 'Show Less ↑' : `Show More (${orders.length - 5} more) ↓`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* upcomming workshops */}
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4">
            <span className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm border border-amber-200/50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </span>
            Upcoming Workshop Bookings
          </h3>

          {upcomingWorkshops.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/80 shadow-sm text-center">
              <p className="text-slate-500 font-medium mb-3">No upcoming workshop sessions booked.</p>
              <Link href="/workshops" className="text-amber-600 font-bold hover:underline">Browse Craft Workshops →</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {(showAllUpcomingWorkshops ? upcomingWorkshops : upcomingWorkshops.slice(0, 5)).map((wb) => {
                  const badge = getWorkshopBookingBadge(wb.status);
                  return (
                    <div
                      key={wb.id}
                      onClick={() => setSelectedWorkshopBooking(wb)}
                      className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-7 border border-white/80 hover:shadow-[0_10px_30px_rgba(31,38,135,0.05)] hover:border-amber-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-[6px] border-l-amber-500 group"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/50 uppercase tracking-widest">
                            {wb.booked_date} at {wb.booked_time}
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900">{wb.workshop_title || 'Craft Workshop'}</h4>
                        <p className="text-xs text-slate-500 mt-1">Instructor: {wb.craftsman || 'Master Artisan'} • {wb.guests} Guest(s)</p>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <span className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border shadow-sm ${badge.color}`}>
                          {badge.label}
                        </span>
                        <svg className="w-5 h-5 text-slate-300 group-hover:text-amber-600 transition-colors hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                      </div>
                    </div>
                  );
                })}
              </div>

              {upcomingWorkshops.length > 5 && (
                <div className="text-center mt-5">
                  <button
                    onClick={() => setShowAllUpcomingWorkshops(!showAllUpcomingWorkshops)}
                    className="px-6 py-2.5 bg-white/70 hover:bg-white text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl border border-white/80 shadow-sm transition-all"
                  >
                    {showAllUpcomingWorkshops ? 'Show Less ↑' : `Show More (${upcomingWorkshops.length - 5} more) ↓`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* past workshops */}
        {pastWorkshops.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-slate-500 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Past Workshop History
            </h3>

            <div className="grid grid-cols-1 gap-3 opacity-75">
              {(showAllPastWorkshops ? pastWorkshops : pastWorkshops.slice(0, 5)).map((wb) => (
                <div
                  key={wb.id}
                  onClick={() => setSelectedWorkshopBooking(wb)}
                  className="bg-white/50 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/70 hover:bg-white/70 transition-all cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-bold text-slate-700">{wb.workshop_title}</h4>
                    <p className="text-xs text-slate-400 font-mono">{wb.booked_date} at {wb.booked_time} • {wb.guests} Guest(s)</p>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
                    Completed
                  </span>
                </div>
              ))}
            </div>

            {pastWorkshops.length > 5 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setShowAllPastWorkshops(!showAllPastWorkshops)}
                  className="px-5 py-2 bg-white/50 hover:bg-white text-slate-600 font-bold text-xs uppercase tracking-widest rounded-xl border border-white/80 shadow-sm transition-all"
                >
                  {showAllPastWorkshops ? 'Show Less ↑' : `Show More (${pastWorkshops.length - 5} more) ↓`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* hall booking */}
        <div className="pt-4">
          <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4">
            <span className="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-sm border border-slate-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </span>
            Hall Bookings
          </h3>

          {hallBookings.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-10 border border-white/80 shadow-sm text-center">
              <p className="text-slate-500 font-medium mb-4">You have no hall booking requests.</p>
              <Link href="/facilities" className="text-amber-600 font-bold hover:underline">Book the Grand Heritage Hall →</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5">
                {(showAllHallBookings ? hallBookings : hallBookings.slice(0, 5)).map((booking) => {
                  const display = getHallBookingDisplayStatus(booking);
                  return (
                    <div 
                      key={booking.id} 
                      onClick={() => setSelectedHallBooking(booking)}
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

              {hallBookings.length > 5 && (
                <div className="text-center mt-6">
                  <button 
                    onClick={() => setShowAllHallBookings(!showAllHallBookings)}
                    className="px-6 py-2.5 bg-white/70 hover:bg-white text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl border border-white/80 shadow-sm transition-all"
                  >
                    {showAllHallBookings ? 'Show Less ↑' : `Show More (${hallBookings.length - 5} more) ↓`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* order details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8 border-b border-white/60 flex justify-between items-center bg-white/40">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Order #{selectedOrder.id.slice(0, 8)}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2.5 bg-white/60 hover:bg-white rounded-full text-slate-500 hover:text-rose-600 transition-colors shadow-sm border border-white/80">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8 no-scrollbar">
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
                         style={{ width: `${Math.max(0, getOrderStep(selectedOrder.status) - 1) * 25}%` }}></div>
                    
                    {['Placed', 'Processing', 'Reviewed', 'Courier', 'Delivered'].map((stepName, i) => {
                      const stepNum = i + 1;
                      const active = getOrderStep(selectedOrder.status) >= stepNum;
                      return (
                        <div key={stepName} className="relative z-10 flex flex-col items-center gap-2.5">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-colors ${active ? 'bg-amber-500 border-amber-500 text-white shadow-md' : 'bg-slate-100 border-white text-slate-400 shadow-inner'}`}>
                            {active ? <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> : stepNum}
                          </div>
                          <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${active ? 'text-slate-900' : 'text-slate-400'} text-center w-14`}>{stepName}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

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

      {/* workshop booking details */}
      {selectedWorkshopBooking && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[2.5rem] w-full max-w-lg overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8 border-b border-white/60 flex justify-between items-center bg-white/40">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Workshop Session</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Ref #{selectedWorkshopBooking.id.slice(0, 8)}</p>
              </div>
              <button onClick={() => setSelectedWorkshopBooking(null)} className="p-2.5 bg-white/60 hover:bg-white rounded-full text-slate-500 hover:text-rose-600 transition-colors shadow-sm border border-white/80">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/80 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Booking Status</span>
                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border shadow-sm ${getWorkshopBookingBadge(selectedWorkshopBooking.status).color}`}>
                  {getWorkshopBookingBadge(selectedWorkshopBooking.status).label}
                </span>
              </div>

              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/80 shadow-sm">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Craft Workshop</label>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{selectedWorkshopBooking.workshop_title}</p>
                <p className="text-xs text-amber-600 font-bold mt-1">Instructor: {selectedWorkshopBooking.craftsman || 'Master Artisan'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/80 shadow-sm">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Date & Time</label>
                  <p className="text-base font-black text-slate-900">{selectedWorkshopBooking.booked_date}</p>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">{selectedWorkshopBooking.booked_time}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/80 shadow-sm">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Reserved Spots</label>
                  <p className="text-lg font-black text-slate-900">{selectedWorkshopBooking.guests} Person(s)</p>
                </div>
              </div>

              {selectedWorkshopBooking.notes && (
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/80 shadow-sm">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Customer Notes</label>
                  <p className="text-sm font-medium text-slate-700">{selectedWorkshopBooking.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 pt-2 flex justify-end">
              <button onClick={() => setSelectedWorkshopBooking(null)} className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-bold rounded-2xl transition-all shadow-sm">
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* hall booking details */}
      {selectedHallBooking && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-3xl border border-white rounded-[2.5rem] w-full max-w-lg overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8 border-b border-white/60 flex justify-between items-center bg-white/40">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Hall Booking</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Ref #{selectedHallBooking.id.slice(0, 8)}</p>
              </div>
              <button onClick={() => setSelectedHallBooking(null)} className="p-2.5 bg-white/60 hover:bg-white rounded-full text-slate-500 hover:text-rose-600 transition-colors shadow-sm border border-white/80">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/80 shadow-sm">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Current Status</span>
                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border shadow-sm ${getHallBookingDisplayStatus(selectedHallBooking).color}`}>
                  {getHallBookingDisplayStatus(selectedHallBooking).label}
                </span>
              </div>

              <div className="space-y-5">
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/80 shadow-sm">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Event Type</label>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{selectedHallBooking.event_name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/80 shadow-sm">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Reserved Date</label>
                    <p className="text-lg font-black text-slate-900">{new Date(selectedHallBooking.booking_date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/80 shadow-sm">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Expected Guests</label>
                    <p className="text-lg font-black text-slate-900">{selectedHallBooking.expected_guests} People</p>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[1.5rem] border border-white/80 shadow-sm">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Special Requirements</label>
                  <div className="text-sm font-medium text-slate-700 min-h-[4rem] leading-relaxed">
                    {selectedHallBooking.special_requirements || <span className="italic text-slate-400">None provided.</span>}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button onClick={() => setSelectedHallBooking(null)} className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 font-bold rounded-2xl transition-all shadow-sm">
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