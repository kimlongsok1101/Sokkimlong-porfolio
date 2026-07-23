import { createClient, SupabaseClient } from "@supabase/supabase-js";

const globalWithSupabaseAdmin = globalThis as typeof globalThis & {
  __supabaseAdminClient?: SupabaseClient | null;
};

export function createSupabaseAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  if (globalWithSupabaseAdmin.__supabaseAdminClient) {
    return globalWithSupabaseAdmin.__supabaseAdminClient;
  }

  const client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  globalWithSupabaseAdmin.__supabaseAdminClient = client;
  return client;
}
