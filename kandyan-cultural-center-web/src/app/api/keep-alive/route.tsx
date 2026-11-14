import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // Only allow requests that have the correct secret password
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized request', { status: 401 });
  }

  // Initialize Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Ping the database to reset the 7-day inactivity timer
    const { data, error } = await supabase
      .from('artifacts')
      .select('id')
      .limit(1);

    if (error) throw error;
    
    console.log("Supabase successfully pinged to stay awake!");
    return NextResponse.json({ success: true, message: 'Database awakened' }, { status: 200 });
    
  } catch (error) {
    console.error("Keep-alive failed:", error);
    return NextResponse.json({ success: false, error: 'Keep-alive failed' }, { status: 500 });
  }
}