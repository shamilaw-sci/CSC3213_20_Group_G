import Link from 'next/link';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Kandyan Cultural Centre',
};

// Initialize Supabase for secure Server-Side data fetching
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function AdminDashboardPage() {
  // Fetch dynamic notification counts from the database in parallel
  const [
    { count: pendingOrders },
    { count: pendingBookings },
    { count: lowStock }
  ] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['pending', 'processing', 'completed']),
    supabase.from('hall_bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('artifact_variants').select('id', { count: 'exact', head: true }).lte('stock', 5)
  ]);

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full min-h-[80vh] flex flex-col">
      
      {/* Header Section */}
      <div className="mb-8 sm:mb-12 bg-white/60 backdrop-blur-xl border border-white/80 p-8 md:p-10 rounded-[2.5rem] shadow-sm">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Admin Portal</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Select a module below to manage center operations.</p>
      </div>

      {/* Navigation Cards Grid (Glassmorphism) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
        
        {/* Orders Card */}
        <Link href="/admin/orders" className="group bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/80 shadow-[0_10px_30px_rgba(31,38,135,0.03)] hover:shadow-[0_20px_40px_rgba(31,38,135,0.08)] hover:-translate-y-1 hover:border-amber-300 transition-all duration-300 flex flex-col items-start cursor-pointer h-full relative overflow-hidden">
          <div className="flex justify-between w-full items-start mb-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-amber-200/50">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            {pendingOrders ? (
              <span className="bg-rose-50/80 text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse border border-rose-200/50 shadow-sm">
                {pendingOrders} Pending
              </span>
            ) : null}
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Order Fulfillment</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-grow font-medium">
            Manage online deliveries, update courier statuses, and review in-store POS transactions.
          </p>
          <span className="text-amber-600 font-extrabold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform bg-white/60 px-4 py-2 rounded-xl border border-white">
            Manage Orders <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
        </Link>

        {/* Hall Bookings Card */}
        <Link href="/admin/hall-bookings" className="group bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/80 shadow-[0_10px_30px_rgba(31,38,135,0.03)] hover:shadow-[0_20px_40px_rgba(31,38,135,0.08)] hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 flex flex-col items-start cursor-pointer h-full relative overflow-hidden">
          <div className="flex justify-between w-full items-start mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-blue-200/50">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            {pendingBookings ? (
              <span className="bg-blue-50/80 text-blue-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse border border-blue-200/50 shadow-sm">
                {pendingBookings} Requests
              </span>
            ) : null}
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Hall Bookings</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-grow font-medium">
            Review incoming event requests for the Grand Heritage Hall. Approve, reject, or mark events as completed.
          </p>
          <span className="text-blue-600 font-extrabold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform bg-white/60 px-4 py-2 rounded-xl border border-white">
            Review Requests <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
        </Link>

        {/* Inventory Card */}
        <Link href="/admin/inventory" className="group bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/80 shadow-[0_10px_30px_rgba(31,38,135,0.03)] hover:shadow-[0_20px_40px_rgba(31,38,135,0.08)] hover:-translate-y-1 hover:border-emerald-300 transition-all duration-300 flex flex-col items-start cursor-pointer h-full relative overflow-hidden">
          <div className="flex justify-between w-full items-start mb-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-emerald-200/50">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            {lowStock ? (
              <span className="bg-amber-50/80 text-amber-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-200/50 shadow-sm">
                {lowStock} Low Stock
              </span>
            ) : null}
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Inventory Setup</h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-grow font-medium">
            Add new base artifacts, configure variant SKUs, manage stock levels, and set retail pricing.
          </p>
          <span className="text-emerald-600 font-extrabold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform bg-white/60 px-4 py-2 rounded-xl border border-white">
            Manage Stock <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </span>
        </Link>

      </div>

      {/* Admin Quick Guide Section (Light Glassmorphism) */}
      <div className="mt-auto bg-white/40 backdrop-blur-2xl rounded-[3rem] p-8 sm:p-12 border border-white/80 shadow-[0_20px_50px_rgba(31,38,135,0.05)] relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-400/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10 border-b border-white/60 pb-8">
            <div className="w-14 h-14 rounded-[1.25rem] bg-white border border-white/80 flex items-center justify-center text-amber-600 shadow-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Admin Quick Guide</h2>
              <p className="text-slate-500 font-medium mt-1">Step-by-step instructions for managing the portal.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            
            {/* Guide 1 */}
            <div className="bg-white/50 p-6 rounded-[2rem] border border-white/80 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-amber-600">
                <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-black border border-amber-200/50">1</span>
                <h3 className="font-extrabold uppercase tracking-widest text-xs">Fulfilling Orders</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                When an order shows as <strong className="text-slate-900">"Paid / Processing"</strong>, pack the requested artifacts safely. Once given to the delivery driver, change the status to <strong className="text-slate-900">"Handed to Courier"</strong>. This updates the user's dashboard tracking immediately.
              </p>
            </div>

            {/* Guide 2 */}
            <div className="bg-white/50 p-6 rounded-[2rem] border border-white/80 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-black border border-blue-200/50">2</span>
                <h3 className="font-extrabold uppercase tracking-widest text-xs">Handling Events</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Look for bookings marked as <strong className="text-slate-900">"Pending Review"</strong>. Click the request card to review the event purpose and capacity. Clicking <strong className="text-slate-900">"Approve"</strong> secures the date in the system, preventing double-bookings.
              </p>
            </div>

            {/* Guide 3 */}
            <div className="bg-white/50 p-6 rounded-[2rem] border border-white/80 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-emerald-600">
                <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-black border border-emerald-200/50">3</span>
                <h3 className="font-extrabold uppercase tracking-widest text-xs">Inventory Sync</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                To add a brand new item, click <strong className="text-slate-900">"Add Base Artifact"</strong> first. Then, click <strong className="text-slate-900">"Add Variant"</strong> to attach specific colors, sizes, and pricing to that base artifact. Keep an eye on "Low Stock" alerts!
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}