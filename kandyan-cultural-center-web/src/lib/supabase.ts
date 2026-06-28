import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

// Client-side Supabase client (use in browser/client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (lazy initialization for API routes and server components)
let supabaseServerInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseServer() {
  if (!supabaseServerInstance) {
    if (!supabaseUrl) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    }
    if (!supabaseServiceRoleKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }
    supabaseServerInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return supabaseServerInstance;
}

// For backward compatibility, export as property getter
export const supabaseServer = new Proxy({} as any, {
  get: (target, prop) => {
    const client = getSupabaseServer();
    return client[prop as keyof typeof client];
  },
});
