import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null | undefined;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (supabase !== undefined) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    supabase = null;
    return supabase;
  }

  supabase = createClient(url, anonKey);
  return supabase;
}
