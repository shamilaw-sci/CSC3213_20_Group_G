'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BookingPanel, { BookingChangeState, BookingPanelRef } from "../components/BookingPanel";
import { useCurrency } from '@/context/CurrencyContext';
import { workshops } from "../data";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Workshop = (typeof workshops)[number];

function formatTimeForDisplay(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export default function WorkshopCheckoutPage() {
  const router = useRouter();

  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [bookingState, setBookingState] = useState<BookingChangeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialName, setInitialName] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const bookingRef = useRef<BookingPanelRef | null>(null);

  useEffect(() => {
    const workshopId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("workshop") : null;
    if (!workshopId) {
      setError("No workshop selected. Please return to the workshop page to choose a booking.");
      setLoading(false);
      return;
    }

    const workshop = workshops.find((item) => item.id === workshopId);
    if (!workshop) {
      setError("Selected workshop not found. Please choose the Wood Craft Workshop again.");
      setLoading(false);
      return;
    }

    setSelectedWorkshop(workshop);
  }, []);

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
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-300 mb-2">Wood Craft Workshop</p>
            <h1 className="text-3xl font-bold text-slate-900">Confirm your booking</h1>
            <p className="mt-2 text-slate-600 max-w-2xl">Select your date and time, review the summary, and complete booking with your profile details pre-filled.</p>
          </div>
          <Link href={`/workshops/${selectedWorkshop.id}`} className="text-sm font-semibold text-rose-700 hover:text-rose-900">
            Back to workshop details
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_0.6fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{selectedWorkshop.title}</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">{selectedWorkshop.craftsman}</h2>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm text-slate-500">Duration</p>
                <p className="text-lg font-semibold text-slate-900">{selectedWorkshop.duration}</p>
                <p className="text-sm text-slate-500">Price</p>
                <p className="text-xl font-bold text-rose-700">{useCurrency().formatPrice(selectedWorkshop.price)}</p>
              </div>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {selectedWorkshop.highlights.map((highlight) => (
                <div key={highlight} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{highlight}</p>
                </div>
              ))}
            </div>

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

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Booking Summary</p>
              <div className="mt-6 space-y-4 text-slate-700">
                <div className="flex justify-between">
                  <span className="font-medium">Workshop</span>
                  <span>{selectedWorkshop.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Craftsman</span>
                  <span>{selectedWorkshop.craftsman}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Location</span>
                  <span>{selectedWorkshop.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Duration</span>
                  <span>{selectedWorkshop.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Price</span>
                  <span>{useCurrency().formatPrice(selectedWorkshop.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Gateway handling fee (3.30%)</span>
                  <span>{useCurrency().formatPrice(Math.round(selectedWorkshop.price * 0.033))}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount </span>
                  <span className="font-semibold">{useCurrency().formatPrice(Math.round(selectedWorkshop.price + Math.round(selectedWorkshop.price * 0.033)))}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between">
                  <span className="font-medium">Date</span>
                  <span>{bookingState?.selectedDate ? new Date(bookingState.selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Choose date'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time</span>
                  <span>{bookingState?.selectedTime ? formatTimeForDisplay(bookingState.selectedTime) : 'Choose time'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Guests</span>
                  <span>{bookingState?.guests ?? 1}</span>
                </div>
                {bookingState?.availability?.message && (
                  <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                    {bookingState.availability.message}
                  </div>
                )}
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
                className="mt-6 w-full rounded-3xl bg-rose-700 px-5 py-3 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-800"
              >
                {bookingState?.loading ? 'Processing...' : 'Proceed to Pay'}
              </button>
              {bookingState?.error && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {bookingState.error}
                </div>
              )}
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Need help?</p>
              <p className="mt-4 text-sm text-slate-600">If you need assistance with booking or availability, please contact us through the profile page or visit the help section.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
