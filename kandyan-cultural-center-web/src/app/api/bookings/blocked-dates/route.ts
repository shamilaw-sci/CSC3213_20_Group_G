import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

function getAllSundaysUntil(endDate: Date): string[] {
  const sundays: string[] = [];
  
  // Use UTC dates for consistency
  const today = new Date();
  const currentDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  
  // Get day of week in UTC
  let dayOfWeek = currentDate.getUTCDay();
  
  // Calculate days until next Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  
  // Move to next Sunday if needed
  if (daysUntilSunday > 0) {
    currentDate.setUTCDate(currentDate.getUTCDate() + daysUntilSunday);
  }
  
  // Generate all Sundays until endDate
  while (currentDate <= endDate) {
    const year = currentDate.getUTCFullYear();
    const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getUTCDate()).padStart(2, '0');
    sundays.push(`${year}-${month}-${day}`);
    currentDate.setUTCDate(currentDate.getUTCDate() + 7);
  }
  
  return sundays;
}

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

    // Get database blocked dates
    const dbBlockedDates = (data || []).map((row: any) => ({
      blocked_date: row.blocked_date,
      reason: row.reason || 'Not available',
    }));

    // Generate all Sundays for the next year
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    const sundays = getAllSundaysUntil(endDate);

    // Add Sundays to blocked dates
    const sundayBlockedDates = sundays.map((sunday) => ({
      blocked_date: sunday,
      reason: 'Closed on Sundays',
    }));

    // Merge and deduplicate
    const allBlockedDates = [...dbBlockedDates, ...sundayBlockedDates];
    const uniqueBlockedDates = Array.from(
      new Map(allBlockedDates.map((item) => [item.blocked_date, item])).values()
    ).sort((a, b) => a.blocked_date.localeCompare(b.blocked_date));

    return NextResponse.json({ blockedDates: uniqueBlockedDates });
  } catch (err: any) {
    console.warn('Error fetching blocked dates:', err);
    return NextResponse.json({ blockedDates: [] });
  }
}
