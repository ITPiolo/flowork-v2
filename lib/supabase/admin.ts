import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Server-only client using the service role key — bypasses RLS entirely.
// Only ever import this from API routes, never from client components.
// Used for occupancy share links, where an anonymous outside visitor
// needs to be checked against a password without ever being granted
// direct table access.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
