import { createClient } from '@supabase/supabase-js';

// 1. Check if the environment variables are actually loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

// 2. Initialize and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);