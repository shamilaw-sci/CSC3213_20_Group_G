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

function ChipIcon({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm text-slate-200">
      <span className="h-4 w-4 flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-sm font-medium">{children}</span>;
}

function WorkshopIcon() {
  return (
    <div className="h-9 w-9 flex items-center justify-center rounded-md bg-slate-50 text-slate-700">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18M7 21V7" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-600"><path d="M20 6L9 17l-5-5" stroke="#9A6B13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}

function DurationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 6v6l4 2" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="#F59E0B" strokeWidth="1.2"/></svg>
  );
}

function SkillIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l2 5 5 .5-4 3 1.2 5L12 14l-4.2 2.5L9 10 5 7l5-.5L12 2z" stroke="#F59E0B" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
    if (!workshopId) {
      return;
    }

    const loadWorkshop = async () => {
      try {
        const res = await fetch(`/api/workshops/${encodeURIComponent(workshopId)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error('Workshop API failed', res.status, body);
          setError(`Selected workshop not found (${workshopId}). Please choose the Wood Craft Workshop again.`);
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
      <main className="min-h-screen bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-600 mb-4">Booking error</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">{error}</h1>
          <p className="text-slate-600 mb-8">Please return to the workshop overview and select the available Wood Craft Workshop.</p>
          <Link href="/workshops" className="inline-flex items-center justify-center rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
            Back to Workshops
          </Link>
        </div>
      </main>
    );
  }

  if (!selectedWorkshop) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* --- MAIN SCROLLING CONTENT --- */}
      <div className="relative z-10 py-24">
     
      <div className="mx-auto max-w-6xl px-6">
        <section className="mb-10">
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(31,38,135,0.08)] max-w-5xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-400/20 blur-[50px] rounded-full pointer-events-none"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-4 flex items-center justify-center gap-4">
              </h2>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-5">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">{selectedWorkshop.title}</span>
              </h1>
              <p className="text-slate-600 max-w-3xl mx-auto text-lg leading-relaxed">
                Complete your booking with a seamless checkout made for Kandyan craft experiences.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <ChipIcon label={selectedWorkshop.duration} icon={<DurationIcon />} />
                <Badge>{selectedWorkshop.category === 'show' ? 'Show Ticket' : 'Workshop'}</Badge>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.45fr]">
          <div className="rounded-[20px] bg-white p-6 shadow-sm border border-slate-100">
            {/* Workshop info card */}
            <div className="mb-6 flex gap-4">
              <img
                src={selectedWorkshop.image || selectedWorkshop.artisans?.avatar_url || '/default-workshop.jpg'}
                alt={selectedWorkshop.title}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold">{selectedWorkshop.title}</h2>
                <p className="text-sm text-slate-500">by {selectedWorkshop.artisans?.name || 'Artisan'}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <Badge>Hands-on Experience</Badge>
                  <Badge>Custom Keepsake</Badge>
                  <Badge>Traditional Kandyan Craft</Badge>
                </div>
              </div>
            </div>

            {/* Booking form header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Booking details</h3>
              <p className="text-sm text-slate-500">Choose your preferred date and time</p>
            </div>

            {/* BookingPanel (form) — keep all functionality unchanged */}
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

          {/* Sticky summary */}
          <aside className="lg:col-start-2 lg:sticky lg:top-24 self-start">
            <div className="rounded-[20px] bg-white p-6 shadow-lg border border-slate-100 w-full">
              <p className="text-sm text-slate-500">Booking summary</p>
              <div className="mt-4 space-y-3 text-slate-700">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <WorkshopIcon />
                    <div>
                      <div className="text-sm font-medium">{selectedWorkshop.title}</div>
                      <div className="text-xs text-slate-500">{selectedWorkshop.artisans?.name || 'Artisan'}</div>
                    </div>
                  </div>
                  <div className="font-medium">{formatPrice(selectedWorkshop.price)}</div>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Gateway fee (3.30%)</span>
                  <span>{formatPrice(Math.round(selectedWorkshop.price * 0.033))}</span>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-sm text-slate-500">Total amount</div>
                    <div className="text-2xl font-bold text-[#072146]">{formatPrice(Math.round(selectedWorkshop.price + Math.round(selectedWorkshop.price * 0.033)))}</div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="text-sm text-slate-600">
                  <div className="flex justify-between gap-3"><span>Workshop</span><span className="text-right font-medium text-slate-700">{selectedWorkshop.title}</span></div>
                  <div className="flex justify-between gap-3"><span>Booker</span><span className="text-right font-medium text-slate-700">{bookingState?.name?.trim() || 'Not provided'}</span></div>
                  <div className="flex justify-between gap-3"><span>Date</span><span className="text-right font-medium text-slate-700">{bookingState?.selectedDate ? new Date(bookingState.selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Choose date'}</span></div>
                  <div className="flex justify-between gap-3"><span>Time</span><span className="text-right font-medium text-slate-700">{bookingState?.selectedTime ? formatTimeForDisplay(bookingState.selectedTime) : 'Choose time'}</span></div>
                  <div className="flex justify-between gap-3"><span>Guests</span><span className="text-right font-medium text-slate-700">{bookingState?.guests ?? 1}</span></div>
                </div>

                {bookingState?.availability?.message && (
                  <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">{bookingState.availability.message}</div>
                )}
              </div>

              {/* Trust indicators */}
              <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-2"><CheckIcon /> <span>Secure payment</span></div>
                <div className="flex items-center gap-2"><CheckIcon /> <span>Instant confirmation</span></div>
                <div className="flex items-center gap-2"><CheckIcon /> <span>No hidden charges</span></div>
              </div>

              <button
                onClick={() => bookingRef.current?.handleBooking()}
                disabled={
                  bookingState?.loading ||
                  bookingState?.checkingAvailability ||
                  !bookingState?.availability?.available ||
                  !bookingState?.selectedDate ||
                  !bookingState?.selectedTime
                }
                className="mt-6 w-full rounded-lg bg-amber-600 px-5 py-3 text-white font-semibold shadow-[0_8px_20px_rgba(217,119,6,0.25)] transition-all duration-300 hover:bg-amber-700 hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bookingState?.loading ? 'Processing...' : 'Proceed to Pay'}
              </button>

              {bookingState?.error && (
                <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {bookingState.error}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
      </div>
    </main>
  );
}
