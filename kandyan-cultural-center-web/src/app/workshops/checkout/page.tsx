'use client';

import { useEffect, useRef, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import BookingPanel, { BookingChangeState, BookingPanelRef } from "../components/BookingPanel";
import { useCurrency } from '@/context/CurrencyContext';
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Workshop = {
  id: string;
  category?: "workshop" | "show";
  title: string;
  artisan_id?: string;
  artisans?: {
    id: string;
    name?: string;
    guild?: string;
    bio?: string;
    avatar_url?: string;
  };
  image: string;
  gallery: string[];
  price: number;
  duration: string;
  description: string;
  highlights: string[];
};

function formatTimeForDisplay(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-semibold border border-amber-200/40">{children}</span>;
}

// Fixed sizing issue and wrapped beautifully
function WorkshopIcon() {
  return (
    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-700 shadow-sm flex-shrink-0">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7h18M7 21V7" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function CheckIcon() {
  return (
    <div className="h-5 w-5 flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex-shrink-0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export default function WorkshopCheckoutPage() {
  const router = useRouter();

  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [workshopId, setWorkshopId] = useState<string | null>(null);
  const [bookingState, setBookingState] = useState<BookingChangeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialName, setInitialName] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const bookingRef = useRef<BookingPanelRef | null>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('workshop')?.trim() || null;

    if (!id) {
      setError("No workshop selected. Please return to the workshop page to choose a booking.");
      setLoading(false);
      return;
    }

    setWorkshopId(id);
  }, []);

  useEffect(() => {
    if (!workshopId) return;

    const loadWorkshop = async () => {
      try {
        const res = await fetch(`/api/workshops/${encodeURIComponent(workshopId)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error('Workshop API failed', res.status, body);
          setError(`Selected workshop not found (${workshopId}). Please choose the workshop again.`);
          setLoading(false);
          return;
        }

        const workshop = await res.json();
        setSelectedWorkshop(workshop as Workshop);
      } catch (fetchError) {
        console.error('Workshop fetch error', fetchError);
        setError(`Unable to load workshop (${workshopId}). Please try again.`);
        setLoading(false);
      }
    };

    loadWorkshop();
  }, [workshopId]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.warn("Profile load error", profileError.message);
      }

      const nameParts = (profile?.full_name || user.email || "").split(" ");
      setInitialName(nameParts[0] || "");
      setInitialEmail(user.email || "");
      setInitialPhone(profile?.phone || "");
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-rose-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 py-20 flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-[2.5rem] bg-white/60 backdrop-blur-md p-10 text-center shadow-sm border border-white/85">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-rose-600 mb-4">Booking error</p>
          <h1 className="text-xl font-black text-slate-900 mb-3">{error}</h1>
          <p className="text-sm text-slate-500 mb-8">Please return to the workshop overview and select an available craft workshop.</p>
          <Link href="/workshops" className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-500">
            Back to Workshops
          </Link>
        </div>
      </main>
    );
  }

  if (!selectedWorkshop) return null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 relative">
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* --- MAIN SCROLLING CONTENT --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-24">
        
        {/* --- ABSOLUTE TOP GLOBAL BACK BUTTON --- */}
        <div className="mb-8">
          <Link 
            href={`/workshops/${selectedWorkshop.id}`} 
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-amber-600 transition-colors bg-white hover:bg-amber-50/50 px-5 py-2.5 rounded-xl border border-slate-200/60 shadow-sm group"
          >
            <svg 
              className="w-4 h-4 transform transition-transform group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Workshops
          </Link>
        </div>

        {/* --- 2 COLUMN GRID LAYOUT --- */}
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          
          {/* Main Left Block: Form & Selection */}
          <div className="space-y-6">
            <div className="rounded-[2.5rem] bg-white/70 backdrop-blur-xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(31,38,135,0.04)] border border-white/80">
              
              {/* Refined Workshop Header Banner Inside Card */}
              <div className="mb-8 flex flex-col sm:flex-row gap-5 pb-6 border-b border-slate-100 items-start sm:items-center">
                <img
                  src={selectedWorkshop.image || selectedWorkshop.artisans?.avatar_url || '/default-workshop.jpg'}
                  alt={selectedWorkshop.title}
                  className="h-20 w-20 rounded-2xl object-cover shadow-sm border border-slate-100"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge>{selectedWorkshop.category === 'show' ? 'Show Ticket' : 'Craft Workshop'}</Badge>
                    <span className="text-xs font-medium text-slate-400">• {selectedWorkshop.duration}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedWorkshop.title}</h2>
                  <p className="text-sm font-medium text-slate-500">Hosted by Master Artisan: <span className="text-amber-600 font-bold">{selectedWorkshop.artisans?.name || 'Artisan'}</span></p>
                </div>
              </div>

              {/* Booking Form Title */}
              <div className="mb-6">
                <h3 className="text-xl font-black tracking-tight text-slate-900">Configure Schedule</h3>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">Select date, timing slot & guests count</p>
              </div>

              {/* BookingPanel Core Layout */}
              <div className="space-y-6">
                <BookingPanel
                  ref={bookingRef}
                  workshop={selectedWorkshop}
                  initialName={initialName}
                  initialEmail={initialEmail}
                  initialPhone={initialPhone}
                  showSubmitButton={false}
                  showBookingSummary={false}
                  onBookingChange={setBookingState}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Premium Sticky Summary Panel */}
          <aside className="lg:sticky lg:top-28 self-start w-full">
            <div className="rounded-[2.5rem] bg-white/80 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(31,38,135,0.04)] border border-white/90">
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-4">Summary Breakdown</h3>
              
              <div className="space-y-4 text-slate-700">
                <div className="flex justify-between items-center bg-slate-50/60 border border-slate-100 p-3 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <WorkshopIcon />
                    <div>
                      <div className="text-sm font-bold text-slate-900 line-clamp-1">{selectedWorkshop.title}</div>
                      <div className="text-xs text-slate-400 font-medium">Standard ticket pricing</div>
                    </div>
                  </div>
                  <div className="font-black text-slate-900 text-sm">{formatPrice(selectedWorkshop.price)}</div>
                </div>

                <div className="flex justify-between items-center text-sm px-1">
                  <span className="text-slate-500 font-medium">Platform Gateway fee (3.3%)</span>
                  <span className="font-semibold text-slate-700">{formatPrice(Math.round(selectedWorkshop.price * 0.033))}</span>
                </div>

                <div className="h-px bg-slate-100 my-2" />

                <div className="flex justify-between items-center bg-amber-50/40 border border-amber-100/60 p-4 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-amber-800/80 uppercase tracking-wider">Total Booking Amount</div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                      {formatPrice(Math.round(selectedWorkshop.price + Math.round(selectedWorkshop.price * 0.033)))}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-2" />

                {/* Styled Meta Tags Grid */}
                <div className="text-xs space-y-2.5 bg-slate-50/40 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400 font-medium">Booker Identity</span>
                    <span className="text-right font-bold text-slate-700 line-clamp-1">{bookingState?.name?.trim() || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400 font-medium">Selected Date</span>
                    <span className="text-right font-bold text-slate-700">{bookingState?.selectedDate ? new Date(bookingState.selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Choose date'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400 font-medium">Arrival Time Slot</span>
                    <span className="text-right font-bold text-slate-700">{bookingState?.selectedTime ? formatTimeForDisplay(bookingState.selectedTime) : 'Choose time'}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400 font-medium">Reserved Spots</span>
                    <span className="text-right font-black text-amber-600">{bookingState?.guests ?? 1} Head(s)</span>
                  </div>
                </div>

                {bookingState?.availability?.message && (
                  <div className="rounded-xl bg-amber-50 p-3.5 text-xs font-medium text-amber-700 border border-amber-100/60">{bookingState.availability.message}</div>
                )}
              </div>

              {/* Trust badges row */}
              <div className="mt-5 grid grid-cols-1 gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><CheckIcon /> <span>Secure SSL Encrypted Payment</span></div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><CheckIcon /> <span>Instant Reservation Confirmation</span></div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => bookingRef.current?.handleBooking()}
                disabled={
                  bookingState?.loading ||
                  bookingState?.checkingAvailability ||
                  !bookingState?.availability?.available ||
                  !bookingState?.selectedDate ||
                  !bookingState?.selectedTime
                }
                className="mt-6 w-full rounded-2xl bg-amber-600 px-5 py-3.5 text-white font-bold transition-all duration-300 hover:bg-amber-500 shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:transform-none text-base"
              >
                {bookingState?.loading ? 'Processing Transaction...' : 'Proceed to Secure Payment'}
              </button>

              {bookingState?.error && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                  {bookingState.error}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}