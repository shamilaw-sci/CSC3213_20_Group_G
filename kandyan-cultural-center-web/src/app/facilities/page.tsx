'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Helper function to guarantee we only compare YYYY-MM-DD
const normalizeDate = (dateString: string) => {
  if (!dateString) return '';
  return dateString.split('T')[0]; 
};

export default function FacilitiesPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [unavailableDates, setUnavailableDates] = useState<{date: string, reason: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State specifically for the date input error
  const [dateError, setDateError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    contact_name: '',
    contact_phone: '',
    booking_date: '',
    event_name: '',
    event_details: '',
    max_invitees: ''
  });

  useEffect(() => {
    const initPage = async () => {
      // 1. Get Auth User
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', currentUser.id)
          .single();
          
        if (profile) {
          setFormData(prev => ({
            ...prev,
            contact_name: profile.full_name || '',
            contact_phone: profile.phone || ''
          }));
        }
      }

      // 2. Fetch Admin Holidays/Poya Days
      const { data: holidays } = await supabase.from('blocked_dates').select('blocked_date, reason');
      
      // 3. Fetch Existing Bookings (Pending & Approved)
      const { data: bookings } = await supabase.from('hall_bookings').select('booking_date, status').neq('status', 'rejected');

      // 4. Combine & Normalize Dates
      const blocked: {date: string, reason: string}[] = [];
      
      if (holidays) {
        holidays.forEach(h => blocked.push({ 
          date: normalizeDate(h.blocked_date), 
          reason: h.reason 
        }));
      }
      
      if (bookings) {
        bookings.forEach(b => blocked.push({ 
          date: normalizeDate(b.booking_date), 
          reason: b.status === 'pending' ? 'Date is currently pending approval for another user' : 'Date is already booked' 
        }));
      }

      setUnavailableDates(blocked);
      setIsLoading(false);
    };

    initPage();
  }, []);

  // DATE VALIDATION LOGIC
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value; // Always YYYY-MM-DD from HTML input
    setFormData({ ...formData, booking_date: selectedDate });
    
    // Check for conflict using normalized dates
    const conflict = unavailableDates.find(d => d.date === selectedDate);
    
    if (conflict) {
      setDateError(`Unavailable: ${conflict.reason}`);
    } else {
      setDateError(''); // Clear error if it's a valid date
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Final security check
    if (dateError) return; 

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    const { error } = await supabase.from('hall_bookings').insert({
      user_id: user.id,
      contact_name: formData.contact_name,
      contact_phone: formData.contact_phone,
      booking_date: formData.booking_date,
      event_name: formData.event_name,
      event_details: formData.event_details,
      max_invitees: parseInt(formData.max_invitees, 10),
      status: 'pending'
    });

    setIsSubmitting(false);

    if (error) {
      if (error.code === '23505') {
        setMessage({ type: 'error', text: 'Someone just booked this exact date! Please refresh and choose another.' });
      } else {
        setMessage({ type: 'error', text: error.message });
      }
    } else {
      setMessage({ type: 'success', text: 'Your request has been successfully submitted! Check your dashboard for updates.' });
      setFormData(prev => ({ ...prev, booking_date: '', event_name: '', event_details: '', max_invitees: '' }));
      
      // Instantly block the date locally so they can't double-click submit
      setUnavailableDates([...unavailableDates, { date: normalizeDate(formData.booking_date), reason: 'Pending approval' }]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-kandyan-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  // Helper boolean to lock the button
  const isFormLocked = isSubmitting || !formData.booking_date || dateError.length > 0;

  return (

    <main className="min-h-screen bg-kandyan-bg">
        {/* Shop Hero Header */}
            <section className="bg-slate-950 py-20 relative overflow-hidden">
                {/* Soft maroon glow instead of generic rose */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-kandyan-maroon/20 rounded-full blur-[100px]"></div>
                <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <h2 className="text-kandyan-gold font-bold tracking-widest uppercase text-sm mb-4 flex items-center gap-3">
                    <span className="w-8 h-px bg-kandyan-gold"></span> Premium Facilities
                </h2>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                    The <span className="text-kandyan-maroon">Grand Heritage Hall</span>
                </h1>
                <p className="text-slate-400 mt-4 max-w-2xl text-lg font-light">
                    Host your cultural events, workshops, and exhibitions in our state-of-the-art facility designed with traditional Kandyan architecture.
                </p>
                </div>
            </section>
            
            <div className="bg-stone-50 min-h-screen py-12 lg:py-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* LEFT COLUMN: Photos, Facilities & Rules */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 relative h-[300px] sm:h-[400px] rounded-[2rem] overflow-hidden shadow-md bg-slate-200 group">
                            <Image src="/hallmain.png" alt="Grand Heritage Hall" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div className="relative h-48 rounded-[1.5rem] overflow-hidden shadow-sm bg-slate-200 group">
                            <Image src="/hall1.png" alt="Hall Interior" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        <div className="relative h-48 rounded-[1.5rem] overflow-hidden shadow-sm bg-slate-200 group">
                            <Image src="/hall2.png" alt="Hall Exterior" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-kandyan-gold">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                            </span>
                            Included Facilities
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-slate-600 font-medium">
                            <div className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Seating for up to 200 guests</div>
                            <div className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Traditional Stage Setup</div>
                            <div className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Advanced Sound System (PA)</div>
                            <div className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Air Conditioning</div>
                        </div>
                        </div>

                        <div className="bg-rose-50/50 rounded-[2rem] p-8 border border-rose-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-kandyan-maroon shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </span>
                            Rules & Guidelines
                        </h3>
                        <ul className="space-y-4 text-slate-600 font-medium">
                            <li className="flex gap-3"><span className="text-kandyan-maroon font-black">•</span> <strong>Time Slot:</strong> The hall is strictly available from 9:00 AM to 2:00 PM only.</li>
                            <li className="flex gap-3"><span className="text-kandyan-maroon font-black">•</span> <strong>Availability:</strong> The hall cannot be booked on full moon Poya days or designated public holidays.</li>
                        </ul>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Booking Form */}
                    <div className="lg:col-span-5 lg:sticky lg:top-28">
                        <div className="bg-slate-950 text-white rounded-[2rem] p-8 shadow-2xl shadow-slate-900/20 border border-slate-800">
                        
                        <h2 className="text-2xl font-bold mb-2">Request to Book</h2>
                        <p className="text-slate-400 text-sm mb-8">Submit your details. Our administration team will review and contact you for approval.</p>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-start gap-3 ${
                            message.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                            {message.text}
                            </div>
                        )}

                        {message.type === 'success' ? (
                            <div className="py-8 text-center space-y-6">
                            <Link href="/profile" className="inline-block bg-kandyan-gold text-slate-950 font-bold px-8 py-3 rounded-xl hover:-translate-y-1 transition-all">
                                View in Dashboard
                            </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Name *</label>
                                <input type="text" required value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-all" />
                                </div>
                                <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone *</label>
                                <input type="tel" required value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-all" />
                                </div>
                            </div>

                            {/* DATE INPUT WITH INLINE ERROR */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Date *</label>
                                <input 
                                type="date" 
                                required 
                                min={minDateString} 
                                value={formData.booking_date} 
                                onChange={handleDateChange} 
                                className={`w-full bg-slate-900/50 border rounded-xl px-4 py-3.5 text-white focus:outline-none transition-all [color-scheme:dark] ${
                                    dateError ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-700 focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold'
                                }`} 
                                />
                                {dateError && (
                                <p className="text-rose-400 text-xs font-bold mt-1.5 flex items-center gap-1 animate-in slide-in-from-top-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {dateError}
                                </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Event Name *</label>
                                <input type="text" required placeholder="e.g. Traditional Dance Exhibition" value={formData.event_name} onChange={(e) => setFormData({...formData, event_name: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-all" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expected Invitees *</label>
                                <input type="number" required min="1" max="200" placeholder="Maximum 200" value={formData.max_invitees} onChange={(e) => setFormData({...formData, max_invitees: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-all" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Event Description *</label>
                                <textarea required placeholder="Please describe the purpose of the event..." value={formData.event_details} onChange={(e) => setFormData({...formData, event_details: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-all resize-none h-24" />
                            </div>

                            <button 
                                disabled={isFormLocked} 
                                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4 ${
                                isFormLocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-kandyan-gold hover:bg-amber-400 text-slate-950 shadow-lg hover:-translate-y-1'
                                }`}
                            >
                                {isSubmitting ? 'Submitting Request...' : 'Submit Booking Request'}
                            </button>

                            {!user && (
                                <p className="text-center text-xs text-rose-400 mt-2 font-medium">
                                You will be asked to log in before submitting.
                                </p>
                            )}
                            </form>
                        )}
                        </div>
                    </div>

                    </div>
                </div>
            </div>

    </main>
    
  );
}