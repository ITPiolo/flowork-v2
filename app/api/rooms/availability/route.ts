import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_BOOKING_SETTINGS } from "@/lib/booking";

// Public endpoint. Returns only what's needed to compute the tap-to-select
// slot grid client-side: the room's booking settings, and the start/end
// times of bookings that currently block the day — never guest identity
// (name/email/phone), which stays server-side only.

export async function GET(req: Request) {
  const url = new URL(req.url);
  const roomId = url.searchParams.get("roomId");
  const date = url.searchParams.get("date"); // YYYY-MM-DD

  if (!roomId || !date) {
    return NextResponse.json({ error: "Missing roomId or date" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: room } = await admin
    .from("bookable_rooms")
    .select("id, location_id, hourly_rate_aed, is_active")
    .eq("id", roomId)
    .maybeSingle();

  if (!room || !(room as any).is_active) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const { data: settingsRow } = await admin
    .from("booking_settings")
    .select("*")
    .eq("location_id", (room as any).location_id)
    .maybeSingle();

  const settings = settingsRow
    ? {
        buffer_minutes: (settingsRow as any).buffer_minutes,
        slot_increment_minutes: (settingsRow as any).slot_increment_minutes,
        min_booking_minutes: (settingsRow as any).min_booking_minutes,
        max_booking_minutes: (settingsRow as any).max_booking_minutes,
        opening_time: (settingsRow as any).opening_time,
        closing_time: (settingsRow as any).closing_time,
      }
    : DEFAULT_BOOKING_SETTINGS;

  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;
  const twentyMinAgo = new Date(Date.now() - 20 * 60_000).toISOString();

  // Confirmed bookings always block; pending ones only block while their
  // checkout session is still plausibly active — stops an abandoned
  // checkout from permanently locking a slot.
  const { data: bookings } = await admin
    .from("room_bookings")
    .select("starts_at, ends_at, status, created_at")
    .eq("room_id", roomId)
    .gte("starts_at", dayStart)
    .lte("starts_at", dayEnd);

  const existing = (bookings ?? [])
    .filter((b: any) => b.status === "confirmed" || (b.status === "pending" && b.created_at > twentyMinAgo))
    .map((b: any) => ({ starts_at: b.starts_at, ends_at: b.ends_at }));

  return NextResponse.json({
    settings,
    existing,
    hourlyRateAed: (room as any).hourly_rate_aed,
  });
}
