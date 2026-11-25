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

export type SupabaseSchemaStatus = "disabled" | "ready" | "missing" | "offline";

/**
 * Memeriksa apakah tabel aplikasi sudah tersedia. Berguna untuk membedakan
 * "Supabase belum dikonfigurasi", "skema belum dijalankan", dan "jaringan
 * bermasalah" agar pesan ke pengguna tidak menyesatkan.
 */
export async function checkSupabaseSchema(): Promise<SupabaseSchemaStatus> {
  if (!isSupabaseConfigured) return "disabled";
  const client = createClient();
  if (!client) return "disabled";

  try {
    const { error } = await client
      .from("reports")
      .select("id", { head: true, count: "exact" })
      .limit(1);

    if (!error) return "ready";

    if (
      error.code === "PGRST205" ||
      /could not find the table|could not find the relation|schema cache/i.test(
        error.message ?? "",
      )
    ) {
      return "missing";
    }

    return "offline";
  } catch {
    return "offline";
  }
}

