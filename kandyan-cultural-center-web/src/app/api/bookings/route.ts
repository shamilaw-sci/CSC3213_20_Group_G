import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

function validateBody(body: any) {
  const required = ['workshop_title', 'booked_date', 'booked_time', 'customer_name', 'customer_email'];
  const missing = required.filter((k) => !body || body[k] === undefined || body[k] === null || String(body[k]).trim() === '');
  return { valid: missing.length === 0, missing };
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

    // PostgreSQL locks the row and prevents double-booking (atomic function)
    const { data: rpcResult, error: rpcError } = await supabase.rpc('create_workshop_booking_atomic', {
      p_user_id: body.user_id ?? null,
      p_workshop_id: body.workshop_id ?? body.experience_id ?? null,
      p_workshop_title: body.workshop_title ?? body.experience_title,
      p_craftsman: body.craftsman ?? null,
      p_booked_date: body.booked_date,
      p_booked_time: body.booked_time,
      p_customer_name: body.customer_name,
      p_customer_email: body.customer_email,
      p_customer_phone: body.customer_phone ?? null,
      p_guests: body.guests ?? 1,
      p_notes: body.notes ?? null,
    });

    if (rpcError) {
      console.error('Atomic booking RPC error:', rpcError);
      return NextResponse.json({ error: rpcError.message || 'Database transaction failed.' }, { status: 500 });
    }

    if (!rpcResult?.success) {
      return NextResponse.json({ error: rpcResult?.error || 'Time slot is no longer available.' }, { status: rpcResult?.status || 409 });
    }

    return NextResponse.json({ booking: rpcResult.booking }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}