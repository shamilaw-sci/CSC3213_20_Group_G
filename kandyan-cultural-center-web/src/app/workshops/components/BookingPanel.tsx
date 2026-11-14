'use client';

import { forwardRef, ForwardedRef, useEffect, useImperativeHandle, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCurrency } from '@/context/CurrencyContext';
// 🚨 ADDED: Need useRouter for the dummy payment redirect
import { useRouter } from 'next/navigation'; 

// Check if a date is a Sunday
function isSunday(dateString: string): boolean {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCDay() === 0;
}

// Convert time string "HH:MM" to 12-hour display format
function timeTo12Hour(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

// Normalize display times like "06:00 PM" or "6:00 PM" to 24-hour "HH:MM"
function normalizeTimeTo24(timeStr: string) {
  if (!timeStr) return timeStr;
  const m = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!m) return timeStr; 
  let hh = parseInt(m[1], 10);
  const mm = m[2];
  const ampm = m[3]?.toUpperCase();
  if (ampm === 'PM' && hh < 12) hh += 12;
  if (ampm === 'AM' && hh === 12) hh = 0;
  const hhStr = String(hh).padStart(2, '0');
  return `${hhStr}:${mm}`;
}

type Workshop = {
  id?: string;
  category?: string;
  title: string;
  price: number;
  no_of_guests?: number;
  artisan_id?: string;
  artisans?: {
    id: string;
    name?: string;
    guild?: string;
    bio?: string;
    avatar_url?: string;
  };
};

function formatDateForDisplay(dateString: string) {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export type BookingChangeState = {
  selectedDate: string;
  selectedTime: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  availability: { available: boolean; message: string } | null;
  checkingAvailability: boolean;
  error: string;
  loading: boolean;
};

export type BookingPanelRef = {
  handleBooking: () => Promise<void>;
};

type BookingPanelProps = {
  workshop: Workshop;
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  onBookingChange?: (state: BookingChangeState) => void;
  showSubmitButton?: boolean;
  showBookingSummary?: boolean;
};

function BookingPanel(
  { workshop, initialName = '', initialEmail = '', initialPhone = '', onBookingChange, showSubmitButton = true, showBookingSummary = true }: BookingPanelProps,
  ref: ForwardedRef<BookingPanelRef>
) {
  const router = useRouter(); // 🚨 ADDED
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);

  useEffect(() => {
    if (initialName) setName(initialName);
    if (initialEmail) setEmail(initialEmail);
    if (initialPhone) setPhone(initialPhone);
  }, [initialName, initialEmail, initialPhone]);

  const [availability, setAvailability] = useState<{ available: boolean; message: string } | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');
  const [loading, setLoading] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Record<string, string>>({});
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [bookedCounts, setBookedCounts] = useState<Record<string, number>>({});

  const today = new Date().toISOString().slice(0, 10);
  const allTimesForDate = timeSlots;
  const { formatPrice } = useCurrency();
  const workshopCraftsman = workshop.artisans?.name ?? 'Artisan';

  const blockedReason = selectedDate ? blockedDates[selectedDate] : undefined;
  const isSelectedDateBlocked = !!blockedReason;

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!workshop.id) {
        setTimeSlots([]);
        return;
      }
      try {
        const res = await fetch(`/api/workshop-time-slots?workshopId=${encodeURIComponent(workshop.id)}`);
        if (!res.ok) return;
        const data = await res.json();
        setTimeSlots(Array.isArray(data?.slots) ? data.slots : []);
      } catch (err) {
        console.warn('Failed to load workshop time slots', err);
      }
    };
    fetchTimeSlots();
  }, [workshop.id]);

  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const res = await fetch('/api/bookings/blocked-dates');
        if (!res.ok) return;
        const data = await res.json();
        const map: Record<string, string> = {};
        (data.blockedDates || []).forEach((row: any) => {
          if (row.blocked_date) {
            map[row.blocked_date] = row.reason || 'Not available';
          }
        });
        setBlockedDates(map);
      } catch (err) {
        console.warn('Failed to load blocked dates', err);
      }
    };
    fetchBlockedDates();
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setBookedTimes(new Set());
      setBookedCounts({});
      return;
    }
    const fetchBookedTimes = async () => {
      try {
        const res = await fetch(`/api/bookings/availability?date=${selectedDate}`);
        if (!res.ok) return;
        const data = await res.json();
        setBookedTimes(new Set((data.bookedTimes || []).map((time: string) => normalizeTimeTo24(time))));
        setBookedCounts(data.bookedCounts || {});
      } catch (err) {
        console.warn('Failed to load booked times', err);
      }
    };
    fetchBookedTimes();
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      setAvailability(null);
      return;
    }
    if (blockedReason) {
      setCheckingAvailability(false);
      setAvailability({ available: false, message: `${blockedReason} — this date is not available.` });
      return;
    }

    const checkAvailability = async () => {
      setCheckingAvailability(true);
      try {
        const normalizedTime = normalizeTimeTo24(selectedTime);
        const res = await fetch('/api/bookings/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booked_date: selectedDate,
            booked_time: normalizedTime,
            workshop_id: workshop.id ?? null,
            craftsman: workshopCraftsman,
          }),
        });
        const data = await res.json();
        setAvailability(data);
      } catch (err: any) {
        setAvailability({ available: false, message: err?.message || 'Error checking availability' });
      } finally {
        setCheckingAvailability(false);
      }
    };
    const timer = setTimeout(checkAvailability, 300);
    return () => clearTimeout(timer);
  }, [selectedDate, selectedTime, workshop.id, workshopCraftsman]);

  const handleBooking = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !phone.trim() || !selectedDate || !selectedTime) {
      setError('Please fill in all fields.');
      return;
    }
    if (!availability?.available) {
      setError('Selected date/time is not available.');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const normalizedTime = normalizeTimeTo24(selectedTime);
      
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          workshop_id: workshop.id ?? null,
          workshop_title: workshop.title,
          craftsman: workshopCraftsman || "Kandyan Art Association Artists",
          booked_date: selectedDate,
          booked_time: normalizedTime,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          guests,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Booking failed');
      setSelectedDate('');
      setSelectedTime('');
      setName('');
      setEmail('');
      setPhone('');
      setGuests(1);
      setAvailability(null);

      try {
        const subtotal = workshop.price * guests;
        const gatewayFee = Math.round(subtotal * 0.033);
        const totalAmount = subtotal + gatewayFee;

        const checkoutRes = await fetch('/api/workshop-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: json.booking.id,
            totalAmount,
          }),
        });

        const paymentConfig = await checkoutRes.json();
        if (!checkoutRes.ok) throw new Error(paymentConfig.error || 'Failed to initialize payment');

        // 🚨 EVALUATION MODE INTERCEPTOR ADDED HERE
        if (process.env.NEXT_PUBLIC_EVAL_MODE === 'true') {
          const queryParams = new URLSearchParams({
            order_id: paymentConfig.orderId,
            amount: paymentConfig.amount || String(totalAmount),
            custom_1: `booking:${json.booking.id}`,
          });
          router.push(`/dummy-payment?${queryParams.toString()}`);
          return;
        }

        // --- ACTUAL PAYHERE LOGIC (Preserved for Production) ---
        const form = document.createElement('form');
        form.method = 'POST';
        
        form.action = process.env.NEXT_PUBLIC_PAYHERE_ENV === 'live' 
          ? 'https://www.payhere.lk/pay/checkout' 
          : 'https://sandbox.payhere.lk/pay/checkout';

        const nameParts = name.trim().split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';

        const fields: Record<string, any> = {
          merchant_id: paymentConfig.merchantId,
          return_url: `${window.location.origin}/success?booking=${json.booking.id}&order=${paymentConfig.orderId}`,
          cancel_url: `${window.location.origin}/workshops/checkout?workshop=${workshop.id}`,
          notify_url: `${window.location.origin}/api/payhere-notify`,
          order_id: paymentConfig.orderId,
          items: `${workshop.title} (${guests} Guest${guests > 1 ? 's' : ''})`,
          currency: paymentConfig.currency || 'LKR',
          amount: paymentConfig.amount || String(totalAmount),
          first_name,
          last_name,
          email,
          phone,
          address: 'Kandyan Cultural Centre',
          city: 'Kandy',
          country: 'Sri Lanka',
          hash: paymentConfig.hash,
          custom_1: `booking:${json.booking.id}`,
        };

        Object.entries(fields).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value ?? '');
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } catch (payErr) {
        console.error('Payment init error:', payErr);
      }
    } catch (err: any) {
      setError(err?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ handleBooking }), [handleBooking]);

  useEffect(() => {
    onBookingChange?.({
      selectedDate,
      selectedTime,
      guests,
      name,
      email,
      phone,
      availability,
      checkingAvailability,
      error,
      loading,
    });
  }, [selectedDate, selectedTime, guests, name, email, phone, availability, checkingAvailability, error, loading, onBookingChange]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">
        Book Your Workshop
      </h2>

      {selectedDate && selectedTime && (
        <div
          className={`mb-4 rounded-3xl border px-4 py-3 text-sm ${
            checkingAvailability
              ? 'border-slate-300 bg-slate-50 text-slate-600'
              : availability?.available
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-rose-300 bg-rose-50 text-rose-700'
          }`}
        >
          {checkingAvailability ? '⏳ Checking...' : availability?.message}
        </div>
      )}

      <div className="grid gap-3 mb-5">
        <div>
          <label className="block mb-2 font-medium">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={(e) => {
              const selectedDateValue = e.target.value;
              
              if (isSunday(selectedDateValue)) {
                setDateError('Sundays are not available for bookings.');
                setSelectedDate('');
                setSelectedTime('');
                return;
              }
              
              if (blockedDates[selectedDateValue]) {
                setDateError(`This date is not available: ${blockedDates[selectedDateValue]}`);
                setSelectedDate('');
                setSelectedTime('');
                return;
              }
              
              setSelectedDate(selectedDateValue);
              setSelectedTime('');
              setDateError('');
              setError('');
            }}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm"
          />
          {dateError && (
            <div className="mt-2 rounded-3xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <strong>Not Available:</strong> {dateError}
            </div>
          )}
          {selectedDate && isSelectedDateBlocked && (
            <div className="mt-2 rounded-3xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <strong>Unavailable:</strong> {blockedReason}
            </div>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium">Select Time</label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm"
            disabled={!selectedDate || isSelectedDateBlocked}
          >
            <option value="">Choose a time</option>
            {allTimesForDate.map((time) => {
              const normalizedTime = normalizeTimeTo24(time);
              const bookedCount = bookedCounts[normalizedTime] || 0;
              const maxGuests = workshop.no_of_guests || 0;
              const remainingSpots = maxGuests - bookedCount;
              const isFull = remainingSpots <= 0;
              
              return (
                <option key={time} value={normalizedTime} disabled={isFull}>
                  {timeTo12Hour(normalizedTime)} {isFull ? '(Full)' : `(${remainingSpots} spot${remainingSpots === 1 ? '' : 's'} left)`}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="Your phone"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Guests</label>
          {selectedTime && selectedDate && (
            (() => {
              const bookedCount = bookedCounts[selectedTime] || 0;
              const maxGuests = workshop.no_of_guests || 1;
              const availableSpots = maxGuests - bookedCount;
              
              return (
                <>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (guests > 1) setGuests(guests - 1);
                      }}
                      className="flex-shrink-0 w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-lg font-semibold text-slate-600 transition"
                      aria-label="Decrease guests"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={availableSpots}
                      value={guests}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value <= availableSpots && value >= 1) {
                          setGuests(value);
                        }
                      }}
                      className="flex-1 text-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (guests < availableSpots) setGuests(guests + 1);
                      }}
                      disabled={guests >= availableSpots}
                      className="flex-shrink-0 w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-semibold text-slate-600 transition"
                      aria-label="Increase guests"
                    >
                      +
                    </button>
                  </div>
                  {availableSpots < guests && (
                    <p className="mt-2 text-sm text-rose-600">Only {availableSpots} spot{availableSpots === 1 ? '' : 's'} available</p>
                  )}
                </>
              );
            })()
          )}
          {(!selectedTime || !selectedDate) && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (guests > 1) setGuests(guests - 1);
                }}
                className="flex-shrink-0 w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-lg font-semibold text-slate-600 transition"
                aria-label="Decrease guests"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="flex-1 text-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
                placeholder="1"
              />
              <button
                type="button"
                onClick={() => {
                  setGuests(guests + 1);
                }}
                className="flex-shrink-0 w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-lg font-semibold text-slate-600 transition"
                aria-label="Increase guests"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {showBookingSummary && (
        <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm text-slate-600">Booking Summary</div>
          <div className="mt-3 text-lg font-semibold text-slate-900">
            {selectedDate ? formatDateForDisplay(selectedDate) : 'Select a date'} at{' '}
            {selectedTime ? timeTo12Hour(selectedTime) : '--:--'}
          </div>
          <div className="text-sm text-slate-600 mt-1">
            {workshopCraftsman || 'Workshop'} · {guests} guest{guests === 1 ? '' : 's'} · {formatPrice(workshop.price * guests)}
          </div>
        </div>
      )}

      {error && <div className="mb-4 text-sm text-white px-4 py-3 rounded-xl bg-amber-600 font-semibold">{error}</div>}

      {showSubmitButton && (
        <button
          onClick={handleBooking}
          disabled={loading || !availability?.available || checkingAvailability}
          className="w-full rounded-3xl bg-orange-500 px-5 py-3 text-white font-semibold shadow-md transition-all duration-300 hover:bg-orange-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Proceed to Pay'}
        </button>
      )}
    </div>
  );
}

export default forwardRef(BookingPanel);