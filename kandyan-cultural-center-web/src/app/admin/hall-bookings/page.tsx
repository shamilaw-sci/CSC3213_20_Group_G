'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function HallBookingsAdminPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('hall_bookings')
      .select('*')
      .order('booking_date', { ascending: false });
      
    if (data) setBookings(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    if (selectedBooking?.id === id) setSelectedBooking({ ...selectedBooking, status: newStatus });

    const { error } = await supabase
      .from('hall_bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert(`Status update failed: ${error.message}`);
      fetchBookings(); 
    }
    
    setUpdatingId(null);
  };

  const getStatusBadge = (status: string, dateStr: string) => {
    const isPast = new Date(dateStr) < new Date();
    const s = status.toLowerCase();

    if (s === 'approved' && isPast) return <span className="bg-white/60 backdrop-blur-md border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">Completed</span>;
    if (s === 'approved') return <span className="bg-white/60 backdrop-blur-md border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">Approved</span>;
    if (s === 'rejected') return <span className="bg-white/60 backdrop-blur-md border border-rose-200 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">Rejected</span>;
    return <span className="bg-amber-100 border border-amber-200/50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider animate-pulse shadow-sm">Pending Review</span>;
  };

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full relative z-10">
      
      <div className="mb-8 sm:mb-10 bg-white/60 backdrop-blur-xl border border-white/80 p-6 md:p-8 rounded-[2rem] shadow-sm max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Hall Event Requests</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">Review event proposals, manage dates, and approve bookings.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div></div>
      ) : bookings.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] shadow-sm p-16 text-center text-slate-500">
          <p className="text-lg font-bold">No hall booking requests found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {bookings.map((booking) => (
            <div 
              key={booking.id} 
              onClick={() => setSelectedBooking(booking)}
              className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(31,38,135,0.03)] hover:shadow-[0_20px_40px_rgba(31,38,135,0.08)] hover:border-blue-300 hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full group"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="bg-white/80 border border-white shadow-sm rounded-2xl px-3 py-2 text-center shrink-0">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short' })}</p>
                  <p className="text-xl font-black text-slate-900 leading-none mt-1">{new Date(booking.booking_date).getDate()}</p>
                </div>
                {getStatusBadge(booking.status, booking.booking_date)}
              </div>
              
              <div className="mb-6 flex-grow">
                <h3 className="text-xl font-black text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{booking.event_name}</h3>
                <p className="text-sm font-bold text-slate-500 mt-3 flex items-center gap-2 bg-white/40 p-2 rounded-xl border border-white/60 w-max">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  {booking.contact_name}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/60 pt-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                <span>{booking.max_invitees} Guests</span>
                <span className="text-blue-600 group-hover:text-blue-500 flex items-center gap-1">View Request <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL DETAILS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-white/60 flex justify-between items-start bg-white/40">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1.5">Event Request</p>
                <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{selectedBooking.event_name}</h2>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2.5 bg-white/60 hover:bg-white rounded-full text-slate-500 hover:text-rose-600 transition-all shadow-sm border border-white/80">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 no-scrollbar">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/80 shadow-sm">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Requested Date</p>
                  <p className="font-bold text-slate-900">{new Date(selectedBooking.booking_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/80 shadow-sm">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Expected Capacity</p>
                  <p className="font-bold text-slate-900">{selectedBooking.max_invitees} People</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/80 shadow-sm">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Lead Contact</p>
                  <p className="font-bold text-slate-900">{selectedBooking.contact_name}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/80 shadow-sm">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</p>
                  <p className="font-bold text-slate-900">{selectedBooking.contact_phone}</p>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/80 shadow-sm">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Event Description / Purpose</p>
                <div className="text-sm text-slate-700 leading-relaxed font-medium min-h-[5rem] whitespace-pre-wrap">
                  {selectedBooking.event_details}
                </div>
              </div>

              <div className="border-t border-white/60 pt-8 mt-2">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 text-center">Administration Action</p>
                
                {updatingId === selectedBooking.id ? (
                  <div className="w-full py-4 rounded-[1.25rem] border border-white/80 bg-white/50 flex items-center justify-center gap-3 text-sm font-bold text-slate-600 shadow-sm">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-amber-600 rounded-full animate-spin"></div> Updating Database...
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleStatusChange(selectedBooking.id, 'approved')}
                      className={`flex-1 py-4 rounded-[1.25rem] font-bold transition-all shadow-sm border ${selectedBooking.status === 'approved' ? 'bg-emerald-50 border-emerald-400 text-emerald-700 cursor-default shadow-[0_4px_10px_rgba(16,185,129,0.15)]' : 'bg-emerald-600 hover:bg-emerald-500 border-transparent text-white shadow-[0_8px_20px_rgba(16,185,129,0.2)]'}`}
                    >
                      {selectedBooking.status === 'approved' ? '✓ Currently Approved' : 'Approve Request'}
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedBooking.id, 'rejected')}
                      className={`flex-1 py-4 rounded-[1.25rem] font-bold transition-all shadow-sm border ${selectedBooking.status === 'rejected' ? 'bg-rose-50 border-rose-400 text-rose-700 cursor-default shadow-[0_4px_10px_rgba(225,29,72,0.15)]' : 'bg-white hover:bg-rose-50 border-white/80 hover:border-rose-300 text-rose-600'}`}
                    >
                      {selectedBooking.status === 'rejected' ? '✗ Currently Rejected' : 'Reject Request'}
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-center text-slate-500 mt-4 font-bold uppercase tracking-widest">Status updates immediately reflect on the user's dashboard.</p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}