'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
}

interface Booking {
  id: string;
  booking_date: string;
  event_name: string;
  status: string;
}

interface ProfileStats {
  totalOrders: number;
  totalSpent: number;
  memberSince: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    totalOrders: 0,
    totalSpent: 0,
    memberSince: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setIsLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();
      setProfile(profileData);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      const { data: bookingsData } = await supabase
        .from('hall_bookings')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (bookingsData) setBookings(bookingsData);

      if (ordersData) {
        setOrders(ordersData);
        setStats({
          totalOrders: ordersData.length,
          totalSpent: ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0),
          memberSince: profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Recently'
        });
      }

      setIsLoading(false);
    };

    load();
  }, []);

  if (isLoading) return <div className="h-screen flex items-center justify-center text-slate-500 font-bold">Loading profile...</div>;
  if (!profile) return <div className="h-screen flex items-center justify-center text-rose-600 font-bold">Please log in to view this page.</div>;

  const pendingOrders = orders.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status || 'Pending'));
  const pastOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));
  const hasValidAvatar = profile.avatar_url && !imgError;

  return (
    <div className="min-h-screen bg-[var(--color-kandyan-bg)] py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* --- PROFILE HEADER CARD --- */}
        <div className="bg-white rounded-3xl shadow-[var(--shadow-kandyan-soft)] overflow-hidden relative">
          <div className="px-6 sm:px-8 pb-10 relative">
            {hasValidAvatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md absolute -top-12 sm:-top-14 left-6 sm:left-8 object-cover bg-white" onError={() => setImgError(true)} />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md absolute -top-12 sm:-top-14 left-6 sm:left-8 bg-slate-800 flex items-center justify-center text-slate-400">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
              </div>
            )}
            <div className="absolute right-6 sm:right-8 top-6">
              <Link href="/edit-profile" className="inline-flex items-center gap-2 bg-[var(--color-kandyan-maroon)] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
                Edit Profile
              </Link>
            </div>
            <div className="mt-16 sm:mt-20 sm:ml-36">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{profile.full_name || 'Anonymous User'}</h2>
              <p className="text-slate-500 font-medium">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* --- QUICK ACTIONS --- */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-kandyan-soft)] p-6 sm:p-8">
          <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={() => document.getElementById('orders-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-left">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">📦</div>
              <div><p className="font-bold text-slate-900">View Orders</p><p className="text-xs text-slate-500">Order history</p></div>
            </button>
            <button onClick={() => document.getElementById('bookings-section')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-left">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">🏛️</div>
              <div><p className="font-bold text-slate-900">Hall Bookings</p><p className="text-xs text-slate-500">Manage requests</p></div>
            </button>
            <Link href="/shop" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-left">
               <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">🛍️</div>
               <div><p className="font-bold text-slate-900">Browse Shop</p><p className="text-xs text-slate-500">Explore artifacts</p></div>
            </Link>
          </div>
        </div>

        {/* --- PAST ORDERS SECTION (RESTORED) --- */}
        <div id="orders-section" className="pt-8">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            </span>
            Order History
          </h3>

          {pastOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
              <p className="text-slate-500 font-medium mb-4">You haven't completed any orders yet.</p>
              <Link href="/shop" className="text-[var(--color-kandyan-maroon)] font-bold hover:underline">
                Explore the Shop →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pastOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">#{order.id.slice(0, 8)}</p>
                      <p className="font-bold text-slate-900">LKR {order.total_amount?.toLocaleString()}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- PENDING DELIVERIES SECTION (RESTORED) --- */}
        <div id="delivery-section" className="pt-8">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-50 text-[var(--color-kandyan-gold)] flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
            </span>
            Pending Deliveries
          </h3>

          {pendingOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center">
              <p className="text-slate-500 font-medium">You have no pending deliveries.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[var(--shadow-kandyan-soft)] hover:shadow-[var(--shadow-kandyan-hover)] transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-lg font-bold text-slate-900">LKR {order.total_amount?.toLocaleString()}</p>
                    <p className="text-sm text-slate-500 mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="inline-flex items-center justify-center px-4 py-2 bg-amber-50 text-[var(--color-kandyan-gold)] font-bold rounded-lg text-sm border border-amber-100 self-start sm:self-auto">
                    {order.status || 'Processing'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- HALL BOOKINGS SECTION --- */}
        <div id="bookings-section" className="pt-8">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </span>
            Your Hall Bookings
          </h3>
          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm text-center flex flex-col items-center">
              <p className="text-slate-500 font-medium mb-4">You have no hall booking requests.</p>
              <Link href="/facilities" className="text-kandyan-maroon font-bold hover:underline">Book the Grand Heritage Hall →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-kandyan-gold">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Event Date: {new Date(booking.booking_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-lg font-bold text-slate-900">{booking.event_name}</p>
                  </div>
                  <span className={`inline-flex items-center px-4 py-2 font-bold rounded-lg text-sm border self-start sm:self-auto capitalize ${
                    booking.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    booking.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}