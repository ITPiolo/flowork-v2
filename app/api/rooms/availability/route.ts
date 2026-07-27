import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchBookingSettings } from "@/lib/bookingSettings.server";

// Public endpoint. Returns only what's needed to compute the tap-to-select
// slot grid client-side: booking settings, and the start/end times of
// bookings that currently block the day — never guest identity (name/
// email/Emirates ID), which stays server-side only.
//
// Reads from the real, shared `spaces` / `booking_settings` / `room_bookings`
// tables (also used by flowork's mobile app) — verified directly against
// the live Supabase schema, not assumed.

export async function GET(req: Request) {
  const url = new URL(req.url);
  const spaceId = url.searchParams.get("roomId"); // query param name kept for now; refers to a space id
  const date = url.searchParams.get("date"); // YYYY-MM-DD

  if (!spaceId || !date) {
    return NextResponse.json({ error: "Missing roomId or date" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: space } = await admin
    .from("spaces")
    .select("id, location_id, guest_hourly_rate_aed, is_active, show_on_website, min_booking_minutes_override, max_booking_minutes_override")
    .eq("id", spaceId)
    .maybeSingle();

  if (!space || !(space as any).is_active || !(space as any).show_on_website || (space as any).guest_hourly_rate_aed == null) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const settings = await fetchBookingSettings(admin, (space as any).location_id);

  // Per-space overrides win over location-wide settings (e.g. a shorter
  // min/max booking window for a specific space).
  if ((space as any).min_booking_minutes_override != null) {
    settings.min_booking_minutes = (space as any).min_booking_minutes_override;
  }
  if ((space as any).max_booking_minutes_override != null) {
    settings.max_booking_minutes = (space as any).max_booking_minutes_override;
  }

  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;
  const twentyMinAgo = new Date(Date.now() - 20 * 60_000).toISOString();

  // Confirmed bookings always block; pending ones only block while their
  // checkout session is still plausibly active — stops an abandoned
  // checkout from permanently locking a slot. This includes bookings
  // made via the mobile app too, since it's the same shared table.
  const { data: bookings } = await admin
    .from("room_bookings")
    .select("starts_at, ends_at, status, created_at")
    .eq("space_id", spaceId)
    .gte("starts_at", dayStart)
    .lte("starts_at", dayEnd);

  const existing = (bookings ?? [])
    .filter((b: any) => b.status === "confirmed" || (b.status === "pending" && b.created_at > twentyMinAgo))
    .map((b: any) => ({ starts_at: b.starts_at, ends_at: b.ends_at }));

  return NextResponse.json({
    settings,
    existing,
    hourlyRateAed: (space as any).guest_hourly_rate_aed,
  });
}
