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
    <main className="min-h-screen bg-white py-10">
      <div className="mx-auto max-w-6xl px-6">
        {/* Stepper */}
        <div className="mb-8">
          <ol className="flex items-center gap-4 text-sm">
            <li className="flex items-center gap-2 text-slate-500">
              <span className="h-6 w-6 flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700">1</span>
              <span>Workshop Details</span>
            </li>
            <li className="flex items-center gap-2 text-amber-600">
              <span className="h-6 w-6 flex items-center justify-center rounded-full bg-amber-600 text-white">2</span>
              <span className="font-semibold">Booking</span>
            </li>
            <li className="flex items-center gap-2 text-slate-500">
              <span className="h-6 w-6 flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700">3</span>
              <span>Payment</span>
            </li>
            <li className="flex items-center gap-2 text-slate-500">
              <span className="h-6 w-6 flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700">4</span>
              <span>Confirmation</span>
            </li>
          </ol>
        </div>

        {/* Hero / Booking header */}
        <div className="mb-8 rounded-[20px] bg-[#072146] text-white p-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-3">
                <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold">Wood Craft Workshop</span>
                <h1 className="text-2xl md:text-3xl font-extrabold">{selectedWorkshop.title}</h1>
              </div>
              <p className="mt-2 text-slate-200">You're booking a spot — your profile details are pre-filled below.</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <ChipIcon label={selectedWorkshop.duration} icon={<DurationIcon />} />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <img
                src={selectedWorkshop.image || selectedWorkshop.artisans?.avatar_url || '/default-workshop.jpg'}
                alt="workshop"
                className="h-24 w-24 rounded-lg object-cover border border-slate-200"
              />
              <div className="text-right">
                <p className="text-sm text-slate-300">From</p>
                <p className="text-2xl font-bold text-amber-400">{formatPrice(selectedWorkshop.price)}</p>
              </div>
            </div>
          </div>
        </div>

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
          <aside className="sticky top-24">
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
                  <div className="flex justify-between"><span>Date</span><span>{bookingState?.selectedDate ? new Date(bookingState.selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Choose date'}</span></div>
                  <div className="flex justify-between"><span>Time</span><span>{bookingState?.selectedTime ? formatTimeForDisplay(bookingState.selectedTime) : 'Choose time'}</span></div>
                  <div className="flex justify-between"><span>Guests</span><span>{bookingState?.guests ?? 1}</span></div>
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
                className="mt-6 w-full rounded-lg bg-[#072146] px-5 py-3 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#031426]"
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
    </main>
  );
}
