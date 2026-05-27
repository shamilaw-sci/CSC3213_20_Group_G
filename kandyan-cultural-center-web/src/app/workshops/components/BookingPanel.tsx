'use client';

import { useEffect, useState } from 'react';

type Workshop = {
  id?: string;
  title: string;
  price: number;
  craftsman: string;
};

function formatDateForDisplay(dateString: string) {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

type BookingConfirmation = {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
} | null;

export default function BookingPanel({ workshop }: { workshop: Workshop }) {
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [availability, setAvailability] = useState<{ available: boolean; message: string } | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch blocked dates on mount
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const res = await fetch('/api/bookings/blocked-dates');
        if (res.ok) {
          const data = await res.json();
          const dateSet = new Set(data.blockedDates || []);
          setBlockedDates(dateSet);
        }
      } catch (err) {
        console.warn('Failed to fetch blocked dates', err);
      }
    };
    fetchBlockedDates();
  }, []);

  // Real-time availability check
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      setAvailability(null);
      return;
    }

    const checkAvailability = async () => {
      setCheckingAvailability(true);
      try {
        const res = await fetch('/api/bookings/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booked_date: selectedDate,
            booked_time: selectedTime,
            workshop_id: workshop.id ?? null,
            craftsman: workshop.craftsman,
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
  }, [selectedDate, selectedTime, workshop.id, workshop.craftsman]);

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
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshop_id: workshop.id ?? null,
          workshop_title: workshop.title,
          craftsman: workshop.craftsman,
          booked_date: selectedDate,
          booked_time: selectedTime,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          guests,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Booking failed');

      setConfirmation({
        id: json.booking.id,
        date: selectedDate,
        time: selectedTime,
        name,
        email,
        phone,
        guests,
      });
      setSelectedDate('');
      setSelectedTime('');
      setName('');
      setEmail('');
      setPhone('');
      setGuests(1);
      setAvailability(null);
    } catch (err: any) {
      setError(err?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  // Calendar rendering
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleString('en-US', { month: 'long' });

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Book Your Workshop</h2>

      {/* Calendar with Blocked Dates */}
      <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{monthName} {year}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              className="px-3 py-1 rounded border border-slate-300 text-sm hover:bg-white"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              className="px-3 py-1 rounded border border-slate-300 text-sm hover:bg-white"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-sm">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
            <div key={`wd-${idx}`} className="text-center text-xs font-semibold text-slate-500">
              {d}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {Array.from({ length: lastDate }).map((_, i) => {
            const day = i + 1;
            const iso = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
            const isBlocked = blockedDates.has(iso);
            const isPast = iso < minDate;
            const isDisabled = isBlocked || isPast;

            return (
              <button
                key={`day-${day}`}
                onClick={() => !isDisabled && setSelectedDate(iso)}
                disabled={isDisabled}
                className={`h-9 w-9 rounded-lg text-center leading-9 text-sm transition ${
                  isDisabled
                    ? 'text-slate-300 cursor-not-allowed bg-slate-200'
                    : iso === selectedDate
                    ? 'ring-2 ring-rose-500 bg-rose-100 text-rose-900 font-semibold'
                    : 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                }`}
                title={isBlocked ? 'Blocked' : isPast ? 'Past date' : ''}
              >
                {day}
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-slate-500">
          <span className="inline-block mr-3">🔴 Blocked dates</span>
          <span className="inline-block">📅 Select any available date</span>
        </div>
      </div>

      {/* Time Input */}
      <div className="mb-5">
        <label className="block mb-2 font-medium">Select Time</label>
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm"
        />
      </div>

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

      {/* Booking Summary */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-600">Booking Summary</div>
        <div className="mt-3 text-lg font-semibold text-slate-900">
          {selectedDate ? formatDateForDisplay(selectedDate) : 'Select a date'} at{' '}
          {selectedTime || '--:--'}
        </div>
        <div className="text-sm text-slate-600 mt-1">
          {workshop.craftsman} · {guests} guest{guests === 1 ? '' : 's'} · LKR {workshop.price}
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-rose-700">{error}</div>}

      {/* Submit Button */}
      <button
        onClick={handleBooking}
        disabled={loading || !availability?.available || checkingAvailability}
        className="w-full rounded-3xl bg-rose-700 px-5 py-3 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-800 enabled:hover:bg-rose-800"
      >
        {loading ? 'Submitting...' : 'Confirm Booking'}
      </button>

      {/* Confirmation Modal */}
      {confirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 rounded-t-2xl text-white">
              <h3 className="text-xl font-bold">✓ Booking Confirmed!</h3>
              <p className="mt-1 text-sm text-emerald-100">Your workshop is reserved</p>
            </div>

            {/* Content */}
            <div className="space-y-4 px-5 py-5">
              {/* Reference ID */}
              <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Reference ID</p>
                <p className="mt-1 font-mono text-sm font-bold text-emerald-900 break-all">{confirmation.id}</p>
              </div>

              {/* Booking Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Workshop</span>
                  <span className="font-semibold text-slate-900">{workshop.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Craftsman</span>
                  <span className="font-semibold text-slate-900">{workshop.craftsman}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between">
                  <span className="text-slate-600">Date</span>
                  <span className="font-semibold text-slate-900">{formatDateForDisplay(confirmation.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Time</span>
                  <span className="font-semibold text-slate-900">{confirmation.time}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between">
                  <span className="text-slate-600">Guest Name</span>
                  <span className="font-semibold text-slate-900 truncate">{confirmation.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Email</span>
                  <span className="font-semibold text-slate-900 text-xs truncate">{confirmation.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Guests</span>
                  <span className="font-semibold text-slate-900">{confirmation.guests}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between">
                  <span className="text-slate-600">Price</span>
                  <span className="font-semibold text-slate-900">LKR {workshop.price}</span>
                </div>
              </div>

              {/* Note */}
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
                Confirmation email sent to <strong>{confirmation.email}</strong>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 rounded-b-2xl">
              <button
                onClick={() => setConfirmation(null)}
                className="w-full rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
              >
                OK, Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  