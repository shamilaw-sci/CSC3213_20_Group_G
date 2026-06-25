import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export async function GET(req: Request) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ blockedDates: [] });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from('blocked_dates')
      .select('blocked_date, reason')
      .gte('blocked_date', new Date().toISOString().split('T')[0])
      .order('blocked_date', { ascending: true });

    if (error) {
      console.warn('Failed to fetch blocked dates:', error);
      return NextResponse.json({ blockedDates: [] });
    }

    const blockedDates = (data || []).map((row: any) => ({
      blocked_date: row.blocked_date,
      reason: row.reason || 'Not available',
    }));
    return NextResponse.json({ blockedDates });
  } catch (err: any) {
    console.warn('Error fetching blocked dates:', err);
    return NextResponse.json({ blockedDates: [] });
  }
}
