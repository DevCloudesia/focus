import { createClient } from "@supabase/supabase-js";

let client = null;

/**
 * Server-only admin client (service role key). Never import this from a
 * "use client" component — it must stay inside API routes / server code.
 */
export function supabaseAdmin() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return client;
}
