import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

// GET endpoint to fetch booked times for a specific date
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase env vars missing',
        bookedTimes: [],
        bookedCounts: {},
      }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 🚨 FIXED: Ignore failed/cancelled bookings so they don't eat up slots
    const { data: bookings, error } = await supabase
      .from('workshop_bookings')
      .select('booked_time, guests')
      .eq('booked_date', date)
      .neq('status', 'failed')
      .neq('status', 'cancelled');

    if (error) {
      console.warn('Error fetching bookings:', error);
      return NextResponse.json({ bookedTimes: [], bookedCounts: {} });
    }

    const bookedTimes = bookings?.map((b) => b.booked_time) || [];
    
    const bookedCounts: Record<string, number> = {};
    (bookings || []).forEach((b) => {
      const time = b.booked_time;
      const guests = b.guests || 1;
      bookedCounts[time] = (bookedCounts[time] || 0) + guests;
    });

    return NextResponse.json({ bookedTimes, bookedCounts });
  } catch (err: any) {
    console.error('Error in GET availability:', err);
    return NextResponse.json({
      error: err?.message || 'Unknown error',
      bookedTimes: [],
      bookedCounts: {},
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { booked_date, booked_time, workshop_id, craftsman } = body;

    if (!booked_date || !booked_time) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase env vars missing',
        available: false,
      }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    try {
      const { data: blockedData } = await supabase
        .from('blocked_dates')
        .select('blocked_date')
        .eq('blocked_date', booked_date)
        .limit(1);

      if (blockedData && blockedData.length > 0) {
        return NextResponse.json({
          available: false,
          reason: 'blocked',
          message: 'This date is blocked and cannot be booked',
        });
      }
    } catch (e) {
      console.warn('Blocked date check failed', e);
    }

    try {
      let capacityQuery = supabase.from('workshop_bookings').select('guests');
      if (workshop_id) {
        capacityQuery = capacityQuery.eq('workshop_id', workshop_id);
      } else if (craftsman) {
        capacityQuery = capacityQuery.eq('craftsman', craftsman);
      }
      
      // 🚨 FIXED: Ignore failed/cancelled bookings in POST check as well
      capacityQuery = capacityQuery
        .eq('booked_date', booked_date)
        .eq('booked_time', booked_time)
        .neq('status', 'failed')
        .neq('status', 'cancelled');

      const { data: existingBookings } = await capacityQuery;

      if (existingBookings && existingBookings.length > 0) {
        const totalBookedGuests = existingBookings.reduce((sum, booking) => sum + (booking.guests || 1), 0);
        return NextResponse.json({ available: true, message: 'Time slot is available', bookedGuests: totalBookedGuests });
      }
    } catch (e) {
      console.warn('Capacity check failed', e);
    }

    return NextResponse.json({ available: true, message: 'Time slot is available' });
  } catch (err: any) {
    return NextResponse.json({
      error: err?.message || 'Unknown error',
      available: false,
    }, { status: 500 });
  }
}