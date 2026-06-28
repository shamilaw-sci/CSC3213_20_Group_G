import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

const DEFAULT_TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

function normalizeTimeSlots(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return normalizeTimeSlots(parsed);
      }
    } catch {
      // fall through to comma-separated parsing
    }

    return trimmed
      .split(/[\n,;|]+/)
      .map((slot) => slot.trim())
      .filter(Boolean);
  }

  return [];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get('workshopId');
    const supabase = getSupabaseServer();

    if (!workshopId) {
      return NextResponse.json({ slots: DEFAULT_TIME_SLOTS });
    }

    const { data, error } = await supabase
      .from('workshops')
      .select('id, time_slots, slot_times, available_slots, booking_times, timeSlots, slots')
      .eq('id', workshopId)
      .maybeSingle();

    if (error) {
      console.warn('Failed to load workshop time slots from workshops table', error.message);
      return NextResponse.json({ slots: DEFAULT_TIME_SLOTS });
    }

    if (!data) {
      return NextResponse.json({ slots: DEFAULT_TIME_SLOTS });
    }

    const slotValue = (data as any).time_slots ?? (data as any).slot_times ?? (data as any).available_slots ?? (data as any).booking_times ?? (data as any).timeSlots ?? (data as any).slots;
    const slots = normalizeTimeSlots(slotValue);

    return NextResponse.json({ slots: slots.length > 0 ? slots : DEFAULT_TIME_SLOTS });
  } catch (err) {
    console.warn('Workshop time slots API failed', err);
    return NextResponse.json({ slots: DEFAULT_TIME_SLOTS });
  }
}
