import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

// Convert time string "HH:MM" to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

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
      }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all bookings for this date
    const { data: bookings, error } = await supabase
      .from('workshop_bookings')
      .select('booked_time')
      .eq('booked_date', date);

    if (error) {
      console.warn('Error fetching bookings:', error);
      return NextResponse.json({ bookedTimes: [] });
    }

    // Extract unique times from bookings
    const bookedTimes = bookings?.map((b) => b.booked_time) || [];

    return NextResponse.json({ bookedTimes });
  } catch (err: any) {
    console.error('Error in GET availability:', err);
    return NextResponse.json({
      error: err?.message || 'Unknown error',
      bookedTimes: [],
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

    // Check if date is in blocked_dates table
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

    // Check if time slot is already booked (with 15-minute buffer)
    try {
      let conflictQuery = supabase.from('workshop_bookings').select('booked_time');
      if (workshop_id) {
        conflictQuery = conflictQuery.eq('workshop_id', workshop_id);
      } else if (craftsman) {
        conflictQuery = conflictQuery.eq('craftsman', craftsman);
      }
      conflictQuery = conflictQuery.eq('booked_date', booked_date);

      const { data: conflictData } = await conflictQuery;

      if (conflictData && conflictData.length > 0) {
        const selectedTimeMinutes = timeToMinutes(booked_time);

        // Check if selected time conflicts with any booked time (15-minute buffer)
        for (const booking of conflictData) {
          const bookedTimeMinutes = timeToMinutes(booking.booked_time);
          // If selected time is within 15 minutes after booked time
          if (selectedTimeMinutes >= bookedTimeMinutes && selectedTimeMinutes < bookedTimeMinutes + 15) {
            return NextResponse.json({
              available: false,
              reason: 'conflict',
              message: 'This time slot is unavailable (15-minute buffer for previous booking)',
            });
          }
        }
      }
    } catch (e) {
      console.warn('Conflict check failed', e);
    }

    return NextResponse.json({ available: true, message: 'Time slot is available' });
  } catch (err: any) {
    return NextResponse.json({
      error: err?.message || 'Unknown error',
      available: false,
    }, { status: 500 });
  }
}
