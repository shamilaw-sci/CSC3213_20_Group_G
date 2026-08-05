import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

function validateBody(body: any) {
  const required = ['workshop_title', 'booked_date', 'booked_time', 'customer_name', 'customer_email'];
  const missing = required.filter((k) => !body || body[k] === undefined || body[k] === null || String(body[k]).trim() === '');
  return { valid: missing.length === 0, missing };
}

// Convert time string "HH:MM" to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Supabase env vars missing: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
      }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { valid, missing } = validateBody(body);
    if (!valid) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    }

    // Unified insert payload for workshop_bookings
    const insert = {
      user_id: body.user_id ?? null,
      workshop_id: body.workshop_id ?? body.experience_id ?? null,
      workshop_title: body.workshop_title ?? body.experience_title,
      craftsman: body.craftsman ?? null,
      booked_date: body.booked_date,
      booked_time: body.booked_time,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone ?? null,
      guests: body.guests ?? 1,
      notes: body.notes ?? null,
      status: 'pending'
    };

    // 1. Prevent booking on blocked dates
    try {
      const { data: blockedData, error: blockedError } = await supabase
        .from('blocked_dates')
        .select('blocked_date')
        .eq('blocked_date', insert.booked_date)
        .limit(1);

      if (blockedError) {
        console.warn('Blocked date check failed:', blockedError.message || blockedError);
      } else if (blockedData && blockedData.length > 0) {
        return NextResponse.json({ error: 'Selected date is blocked and cannot be booked' }, { status: 409 });
      }
    } catch (e) {
      console.warn('Blocked date check exception', e);
    }

    // 2. Prevent time slot conflicts (checks workshop_bookings and ignores failed/cancelled rows)
    try {
      let conflictQuery = supabase
        .from('workshop_bookings')
        .select('booked_time')
        .eq('booked_date', insert.booked_date)
        .neq('status', 'failed')
        .neq('status', 'cancelled');

      if (insert.workshop_id) {
        conflictQuery = conflictQuery.eq('workshop_id', insert.workshop_id);
      } else if (insert.craftsman) {
        conflictQuery = conflictQuery.eq('craftsman', insert.craftsman);
      }

      const { data: conflictData, error: conflictError } = await conflictQuery;
      if (conflictError) {
        console.warn('Conflict check failed:', conflictError.message || conflictError);
      } else if (conflictData && conflictData.length > 0) {
        const selectedTimeMinutes = timeToMinutes(insert.booked_time);

        for (const booking of conflictData) {
          const bookedTimeMinutes = timeToMinutes(booking.booked_time);
          if (selectedTimeMinutes >= bookedTimeMinutes && selectedTimeMinutes < bookedTimeMinutes + 15) {
            return NextResponse.json({ error: 'Selected time slot is unavailable (15-minute buffer for previous booking)' }, { status: 409 });
          }
        }
      }
    } catch (e) {
      console.warn('Conflict check exception', e);
    }

    const { data, error } = await supabase.from('workshop_bookings').insert([insert]).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ booking: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}