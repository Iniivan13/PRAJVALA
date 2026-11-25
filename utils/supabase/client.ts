import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Apakah kredensial Supabase tersedia. Bila tidak, aplikasi otomatis memakai
 * mode lokal (localStorage) agar demo tetap dapat dijalankan tanpa backend.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

let browserClient: SupabaseClient | null = null;

/**
 * Klien Supabase untuk komponen klien. Sengaja memakai satu instance agar
 * listener auth dan penyimpanan cookie tidak terduplikasi.
 */
export function createClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseKey);
  }
  return browserClient;
}
