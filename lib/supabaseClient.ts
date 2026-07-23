import { createClient, SupabaseClient } from "@supabase/supabase-js";

const globalWithSupabase = globalThis as typeof globalThis & {
  __supabaseClient?: SupabaseClient | null;
};

export function createSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (globalWithSupabase.__supabaseClient) {
    return globalWithSupabase.__supabaseClient;
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  globalWithSupabase.__supabaseClient = client;
  return client;
}

