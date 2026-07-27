import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_BOOKING_SETTINGS, type BookingSettings } from "@/lib/booking";

// booking_settings can have a location-specific row, or a single global
// row (location_id IS NULL) that applies everywhere — verified live:
// there's currently only a global row. Try the specific location first,
// then fall back to the global row, then the hardcoded default as a
// last resort if the table is somehow empty.
export async function fetchBookingSettings(
  admin: SupabaseClient,
  locationId: string
): Promise<BookingSettings> {
  const { data: specific } = await admin
    .from("booking_settings")
    .select("*")
    .eq("location_id", locationId)
    .maybeSingle();

  const row =
    specific ??
    (
      await admin.from("booking_settings").select("*").is("location_id", null).maybeSingle()
    ).data;

  // Return a copy, not the shared constant — callers may mutate the
  // result to apply a space's own min/max booking overrides.
  if (!row) return { ...DEFAULT_BOOKING_SETTINGS };

  return {
    buffer_minutes: (row as any).buffer_minutes,
    slot_increment_minutes: (row as any).slot_increment_minutes,
    min_booking_minutes: (row as any).min_booking_minutes,
    max_booking_minutes: (row as any).max_booking_minutes,
    opening_time: (row as any).opening_time,
    closing_time: (row as any).closing_time,
  };
}
