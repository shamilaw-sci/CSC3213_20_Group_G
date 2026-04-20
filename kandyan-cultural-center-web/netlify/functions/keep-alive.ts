import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const handler = async () => {
  console.log("Running Netlify Keep-Alive Cron...");

  // Initialize Supabase using your environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Ping the artifacts table just to wake up the database
    const { data, error } = await supabase
      .from('artifacts')
      .select('id')
      .limit(1);

    if (error) throw error;
    
    console.log("Supabase successfully pinged!");
    return { statusCode: 200, body: 'Keep-alive successful' };
    
  } catch (error) {
    console.error("Keep-alive failed:", error);
    return { statusCode: 500, body: 'Keep-alive failed' };
  }
};

// This tells Netlify to run this function at midnight every 3 days automatically
export const config = {
  schedule: "0 0 */3 * *"
};

export default schedule(config.schedule, handler);