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

interface ProfileStats {
  totalOrders: number;
  totalSpent: number;
  memberSince: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
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

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (!ordersError && ordersData) {
        setOrders(ordersData);

        const totalOrders = ordersData.length;
        const totalSpent = ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const memberSince = profileData?.created_at
          ? new Date(profileData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
          : 'Recently';

        setStats({
          totalOrders,
          totalSpent,
          memberSince
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

  // Determine if we should show the actual image or the fallback SVG
  const hasValidAvatar = profile.avatar_url && !imgError;

  return (
    <div className="min-h-screen bg-[var(--color-kandyan-bg)] py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* --- PROFILE HEADER CARD --- */}
        <div className="bg-white rounded-3xl shadow-[var(--shadow-kandyan-soft)] overflow-hidden relative">

          {/* CONTENT */}
          <div className="px-6 sm:px-8 pb-10 relative">

            {/* 🔶 AVATAR WITH FALLBACK LOGIC */}
            {hasValidAvatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.avatar_url}
                alt="Profile Avatar"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md absolute -top-12 sm:-top-14 left-6 sm:left-8 object-cover bg-white"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md absolute -top-12 sm:-top-14 left-6 sm:left-8 bg-slate-800 flex items-center justify-center text-slate-400">
                <svg className="w-12 h-12 sm:w-14 sm:h-14" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
              </div>
            )}

            {/* EDIT BUTTON */}
            <div className="absolute right-6 sm:right-8 top-6">
              <Link href="/edit-profile" className="inline-flex items-center gap-2 bg-[var(--color-kandyan-maroon)] hover:bg-[var(--color-kandyan-maroon-dark)] text-white px-5 py-2.5 rounded-xl font-bold shadow-[var(--shadow-kandyan-button)] transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </Link>
            </div>

            {/* NAME + EMAIL */}
            <div className="mt-16 sm:mt-20 sm:ml-36">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {profile.full_name || 'Anonymous User'}
              </h2>
              <p className="text-slate-500 font-medium">{profile.email}</p>
            </div>

            {/* INFO SECTION */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                <p className="text-lg font-bold text-slate-900">
                  {profile.phone || 'Not provided'}
                </p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Country</p>
                <p className="text-lg font-bold text-slate-900">{profile.country || 'Not provided'}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-lg font-bold text-slate-900">{stats.memberSince}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- STATISTICS SECTION --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Total Orders</p>
                <p className="text-3xl font-extrabold text-slate-900">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-300 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042L5.960 9.387a3 3 0 006.080 0l1.423-5.123.01-.042L16.78 3H19a1 1 0 000-2H3zM3 15a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6 border border-rose-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">Total Spent</p>
                <p className="text-3xl font-extrabold text-slate-900">LKR {stats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-300 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Account Status</p>
                <p className="text-lg font-bold text-emerald-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Active
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-300 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* --- QUICK ACTIONS --- */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-kandyan-soft)] p-6 sm:p-8">
          <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 5a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm10-1h.01v.01h-.01V4z" clipRule="evenodd"></path>
              </svg>
            </span>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/shop" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-[var(--color-kandyan-gold)] transition-all">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-[var(--color-kandyan-gold)] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042L5.960 9.387a3 3 0 006.080 0l1.423-5.123.01-.042L16.78 3H19a1 1 0 000-2H3zM3 15a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4z"></path>
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-900">Browse Shop</p>
                <p className="text-xs text-slate-500">Explore artifacts</p>
              </div>
            </Link>

            <button
              onClick={() => {
                const element = document.getElementById('orders-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-[var(--color-kandyan-maroon)] transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-[var(--color-kandyan-maroon)] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm11 4H5v2h9V8z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-900">View Orders</p>
                <p className="text-xs text-slate-500">Order history</p>
              </div>
            </button>

            <Link href="/profile" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-green-500 transition-all">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-900">Contact Us</p>
                <p className="text-xs text-slate-500">Get support</p>
              </div>
            </Link>
          </div>
        </div>

        {/* --- PENDING DELIVERIES SECTION --- */}
        <div id="orders-section">
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

        {/* --- PAST ORDERS SECTION --- */}
        <div className="pt-8">
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

      </div>
    </div>
  );
}