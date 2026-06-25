'use client';

import { forwardRef, ForwardedRef, useEffect, useImperativeHandle, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useCurrency } from '@/context/CurrencyContext';

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
  if (!m) return timeStr; // return as-is if unexpected format
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
  category?: "workshop" | "show";
  title: string;
  price: number;
  craftsman: string;
  location?: string;
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
  const [loading, setLoading] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Record<string, string>>({});
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());

  // Free-date booking: fixed time slots available for any date (unless blocked)
  const TIME_SLOTS = ['09:00', '11:30', '14:00'];
  const today = new Date().toISOString().slice(0, 10);
  const allTimesForDate = TIME_SLOTS;
  const { formatPrice } = useCurrency();

  const blockedReason = selectedDate ? blockedDates[selectedDate] : undefined;
  const isSelectedDateBlocked = !!blockedReason;
  const isSelectedDateValid = !!selectedDate && !isSelectedDateBlocked;

  // Fetch blocked dates with reasons
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

  // Fetch booked times for the currently selected date
  useEffect(() => {
    if (!selectedDate) {
      setBookedTimes(new Set());
      return;
    }

    const fetchBookedTimes = async () => {
      try {
        const res = await fetch(`/api/bookings/availability?date=${selectedDate}`);
        if (!res.ok) return;
        const data = await res.json();
        setBookedTimes(new Set((data.bookedTimes || []).map((time: string) => normalizeTimeTo24(time))));
      } catch (err) {
        console.warn('Failed to load booked times', err);
      }
    };

    fetchBookedTimes();
  }, [selectedDate]);

  // Real-time availability check
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

    if (workshop.category === 'show') {
      setCheckingAvailability(false);
      setAvailability({ available: true, message: 'Show schedule selected' });
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
            craftsman: workshop.category === 'show' ? null : workshop.craftsman,
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
  }, [selectedDate, selectedTime, workshop.id, workshop.craftsman, workshop.category]);

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
      const normalizedTime = normalizeTimeTo24(selectedTime);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshop_id: workshop.id ?? null,
          experience_id: workshop.id ?? null,
          workshop_title: workshop.title,
          experience_title: workshop.title,
          category: workshop.category ?? 'workshop',
          craftsman: workshop.category === 'show' ? null : workshop.craftsman,
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

      // After booking is created, initialize payment via /api/checkout and redirect to PayHere
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const profileId = user?.id || null;

        // Calculate totals: subtotal remains fixed, gateway fee (3.3%), and final total
        const subtotal = workshop.price;
        const gatewayFee = Math.round(subtotal * 0.033); // 3.3% handling fee
        const totalAmount = subtotal + gatewayFee;

        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId,
            totalAmount,
            items: [
              {
                id: workshop.id || 'workshop',
                name: workshop.title,
                quantity: 1,
                price: workshop.price,
              },
            ],
            shippingAddress: workshop.location || '',
          }),
        });

        const paymentConfig = await checkoutRes.json();
        if (!checkoutRes.ok) throw new Error(paymentConfig.error || 'Failed to initialize payment');

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://sandbox.payhere.lk/pay/checkout';

        const nameParts = name.trim().split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';

        const fields: Record<string, any> = {
          merchant_id: paymentConfig.merchantId,
          return_url: `${window.location.origin}/success?booking=${json.booking.id}&order=${paymentConfig.orderId}`,
          cancel_url: `${window.location.origin}/workshops/checkout?workshop=${workshop.id}`,
          notify_url: `${window.location.origin}/api/payhere-notify`,
          order_id: paymentConfig.orderId,
          items: workshop.title,
          currency: paymentConfig.currency || 'LKR',
          amount: paymentConfig.amount || String(workshop.price),
          first_name,
          last_name,
          email,
          phone,
          address: workshop.location || '',
          city: '',
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
        Book Your {workshop.category === "show" ? "Show Ticket" : "Workshop"}
      </h2>

      {/* Booking inputs moved into Guest Details section below */}

      {/* Availability Status */}
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

      {/* Guest Details */}
      <div className="grid gap-3 mb-5">
        <div>
          <label className="block mb-2 font-medium">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTime('');
              setError('');
            }}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm"
          />
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
              const isBooked = bookedTimes.has(normalizedTime);
              return (
                <option key={time} value={normalizedTime} disabled={isBooked}>
                  {timeTo12Hour(normalizedTime)} {isBooked ? '(Booked)' : ''}
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
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm"
          />
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
            {workshop.category === 'show' ? workshop.location : workshop.craftsman} · {guests} guest{guests === 1 ? '' : 's'} · {formatPrice(workshop.price)}
          </div>
          {workshop.category === 'show' && selectedDate && selectedTime && (
            <div className="text-sm text-slate-600 mt-2">
              Selected venue: <span className="font-semibold text-slate-900">{workshop.location}</span>
            </div>
          )}
        </div>
      )}

      {error && <div className="mb-4 text-sm text-rose-700">{error}</div>}

      {showSubmitButton && (
        <button
          onClick={handleBooking}
          disabled={loading || !availability?.available || checkingAvailability}
          className="w-full rounded-3xl bg-rose-700 px-5 py-3 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-800 enabled:hover:bg-rose-800"
        >
          {loading ? 'Processing...' : 'Proceed to Pay'}
        </button>
      )}

      
    </div>
  );
}

export default forwardRef(BookingPanel);
  