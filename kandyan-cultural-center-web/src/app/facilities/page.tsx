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

      // 2. Fetch Existing Bookings ONLY (Pending & Approved).
      const { data: bookings } = await supabase.from('hall_bookings').select('booking_date, status').neq('status', 'rejected');

      // 3. Normalize Dates
      const blocked: {date: string, reason: string}[] = [];
      
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
    const selectedDate = e.target.value; 
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
    
    if (dateError) return; 

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    // 1. Save to Supabase
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

    if (error) {
      setIsSubmitting(false);
      if (error.code === '23505') {
        setMessage({ type: 'error', text: 'Someone just booked this exact date! Please refresh and choose another.' });
      } else {
        setMessage({ type: 'error', text: error.message });
      }
    } else {
      // 🚨 2. Trigger the "Request Received" Email via our new API
      if (user.email) {
        await fetch('/api/hall-bookings/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: formData.contact_name,
            date: formData.booking_date,
            status: 'received' // Triggers the "Received" email template
          })
        }).catch(err => console.error("Email API failed:", err));
      }

      setIsSubmitting(false);
      setMessage({ type: 'success', text: 'Your request has been successfully submitted! Check your email for confirmation.' });
      
      const bookedDateStr = formData.booking_date; // Capture before clearing form
      setFormData(prev => ({ ...prev, booking_date: '', event_name: '', event_details: '', max_invitees: '' }));
      
      setUnavailableDates([...unavailableDates, { date: normalizeDate(bookedDateStr), reason: 'Pending approval' }]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  // Helper boolean to lock the button
  const isFormLocked = isSubmitting || !formData.booking_date || dateError.length > 0;

  // Reusable styling for glass inputs
  const glassInputClass = "w-full bg-white/50 backdrop-blur-md border border-white/80 rounded-2xl px-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition-all shadow-sm placeholder:text-slate-400";

  return (
    <main className="relative min-h-screen w-full bg-[#F8F9FA] pb-24">
      
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      <div className="relative z-10 w-full">
        
        {/* Facilities Hero Header (Glassmorphism) */}
        <section className="pt-32 pb-16 px-4 md:px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-10 md:p-16 rounded-[3rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] w-full text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-400/20 blur-[50px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10">
                <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-4 flex items-center justify-center gap-3">
                  <span className="w-8 h-px bg-amber-600"></span> Premium Facilities <span className="w-8 h-px bg-amber-600"></span>
                </h2>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tight">
                  The <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">Cultural Center Hall</span>
                </h1>
                <p className="text-slate-600 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                  Host your cultural events, workshops, and exhibitions in our state-of-the-art facility designed with traditional Kandyan architecture.
                </p>
              </div>
            </div>
          </div>
        </section>
            
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
            {/* LEFT COLUMN: Photos, Facilities & Rules */}
            <div className="lg:col-span-7 space-y-10">
              
              {/* Photo Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 relative h-[300px] sm:h-[400px] rounded-[2.5rem] overflow-hidden shadow-[0_10px_30px_rgba(31,38,135,0.05)] bg-slate-100 group border border-white/60">
                  <Image src="/hall-wide.png" alt="Grand Heritage Hall" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="relative h-48 rounded-[2rem] overflow-hidden shadow-[0_10px_30px_rgba(31,38,135,0.05)] bg-slate-100 group border border-white/60">
                  <Image src="/hall1.png" alt="Hall Interior1" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="relative h-48 rounded-[2rem] overflow-hidden shadow-[0_10px_30px_rgba(31,38,135,0.05)] bg-slate-100 group border border-white/60">
                  <Image src="/hall2.png" alt="Hall Interior2" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              </div>

              {/* Facilities Specs (Glassmorphism) */}
              <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/80 shadow-[0_10px_40px_rgba(31,38,135,0.05)]">
                <h3 className="text-xl font-extrabold text-slate-900 mb-8 flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200/50 shadow-sm shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                  </span>
                  Included Facilities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-slate-700 font-medium text-sm sm:text-base">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 
                    <span><strong className="text-slate-900">Capacity:</strong> 900+ Chairs (Includes Balcony Seating)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 
                    <span><strong className="text-slate-900">Stage:</strong> 30' L × 24' W × 20' H</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 
                    <span>13 ft Projector Screen <br/><span className="text-xs text-slate-500 font-normal">(Projector not provided)</span></span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> 
                    <span>No Sound System <br/><span className="text-xs text-slate-500 font-normal">(Please bring your own equipment)</span></span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 
                    <span>Ceiling Fans Equipped</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 
                    <span>Washroom Facilities Available</span>
                  </div>
                </div>
              </div>

              {/* Rules (Glassmorphism) */}
              <div className="bg-rose-50/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-rose-200/60 shadow-[0_10px_30px_rgba(225,29,72,0.05)]">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-sm border border-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </span>
                  Rules & Guidelines
                </h3>
                <ul className="space-y-4 text-slate-700 font-medium leading-relaxed">
                  <li className="flex gap-3"><span className="text-rose-500 font-black">•</span> <span><strong className="text-slate-900">Time Slot:</strong> The hall is strictly available from morning until 2:00 PM.</span></li>
                  <li className="flex gap-3"><span className="text-rose-500 font-black">•</span> <span><strong className="text-slate-900">Availability:</strong> The hall can be booked on ANY day, including full moon Poya days and public holidays, as long as it has not been previously reserved.</span></li>
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN: Booking Form (Glassmorphism) */}
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(31,38,135,0.05)] border border-white/80">
                        
                <h2 className="text-2xl font-black text-slate-900 mb-2">Request to Book</h2>
                <p className="text-slate-500 text-sm mb-8 font-medium">Submit your details. Our administration team will review and contact you for approval.</p>

                {message.text && (
                  <div className={`mb-8 p-5 rounded-2xl text-sm font-bold flex items-start gap-3 shadow-sm ${
                    message.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}>
                    {message.text}
                  </div>
                )}

                {message.type === 'success' ? (
                  <div className="py-8 text-center space-y-6">
                    <Link href="/profile" className="inline-block bg-amber-600 hover:bg-amber-500 text-white font-bold px-8 py-4 rounded-2xl hover:-translate-y-1 transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)]">
                      View in Dashboard
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                            
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Your Name *</label>
                        <input type="text" required value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} className={glassInputClass} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Phone *</label>
                        <input type="tel" required value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} className={glassInputClass} />
                      </div>
                    </div>

                    {/* DATE INPUT WITH INLINE ERROR */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Select Date *</label>
                      <input 
                        type="date" 
                        required 
                        min={minDateString} 
                        value={formData.booking_date} 
                        onChange={handleDateChange} 
                        className={`${glassInputClass} ${
                          dateError ? '!border-rose-400 !focus:border-rose-400 !focus:ring-rose-400 text-rose-600' : ''
                        }`} 
                      />
                      {dateError && (
                        <p className="text-rose-500 text-xs font-bold mt-2 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {dateError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 border-t border-white/60 pt-5 mt-2">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Event Name *</label>
                      <input type="text" required placeholder="e.g. Traditional Dance Exhibition" value={formData.event_name} onChange={(e) => setFormData({...formData, event_name: e.target.value})} className={glassInputClass} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Expected Invitees *</label>
                      <input type="number" required min="1" max="1500" placeholder="Maximum 1500" value={formData.max_invitees} onChange={(e) => setFormData({...formData, max_invitees: e.target.value})} className={glassInputClass} />
                    </div>

                    <div className="space-y-2 border-t border-white/60 pt-5 mt-2">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Event Description *</label>
                      <textarea required placeholder="Please describe the purpose of the event..." value={formData.event_details} onChange={(e) => setFormData({...formData, event_details: e.target.value})} className={`${glassInputClass} resize-none h-28`} />
                    </div>

                    <button 
                      disabled={isFormLocked} 
                      className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 mt-8 text-base ${
                        isFormLocked 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                          : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-1'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Submitting Request...
                        </>
                      ) : (
                        'Submit Booking Request'
                      )}
                    </button>

                    {!user && (
                      <p className="text-center text-xs text-rose-500 mt-4 font-bold">
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