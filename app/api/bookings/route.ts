import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import {
  DEFAULT_BOOKING_SETTINGS,
  reachableEndMarks,
  timeMarks,
  type BookingSettings,
} from "@/lib/booking";

// Public endpoint — creates a "pending" booking row (soft hold on the
// slot) and a Stripe Checkout Session for it. The slot is only confirmed
// once Stripe confirms payment via the webhook (/api/stripe-webhook).
// Re-validates the requested slot server-side against the DB — the
// client-side selection UI is a convenience, not the source of truth.
//
// Writes to the real, shared room_bookings table (also used by
// flowork's mobile app) — the DB's own exclusion constraint
// (room_bookings_no_overlap) is what actually prevents double-booking
// across both apps, this route's own check is just an earlier, friendlier
// rejection before hitting Stripe.

export async function POST(req: Request) {
  const body = await req.json();
  const { roomId: spaceId, startsAt, endsAt, fullName, email, confirmEmail, emiratesId } = body;

  if (!spaceId || !startsAt || !endsAt || !fullName || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (confirmEmail && email !== confirmEmail) {
    return NextResponse.json({ error: "Email addresses don't match" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: space } = await admin
    .from("spaces")
    .select("*")
    .eq("id", spaceId)
    .maybeSingle();

  if (!space || !(space as any).is_active || !(space as any).show_on_website || (space as any).guest_hourly_rate_aed == null) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const { data: settingsRow } = await admin
    .from("booking_settings")
    .select("*")
    .eq("location_id", (space as any).location_id)
    .maybeSingle();

  const settings: BookingSettings = settingsRow
    ? {
        buffer_minutes: (settingsRow as any).buffer_minutes,
        slot_increment_minutes: (settingsRow as any).slot_increment_minutes,
        min_booking_minutes: (settingsRow as any).min_booking_minutes,
        max_booking_minutes: (settingsRow as any).max_booking_minutes,
        opening_time: (settingsRow as any).opening_time,
        closing_time: (settingsRow as any).closing_time,
      }
    : DEFAULT_BOOKING_SETTINGS;

  if ((space as any).min_booking_minutes_override != null) {
    settings.min_booking_minutes = (space as any).min_booking_minutes_override;
  }
  if ((space as any).max_booking_minutes_override != null) {
    settings.max_booking_minutes = (space as any).max_booking_minutes_override;
  }

  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const dateStr = start.toISOString().slice(0, 10);
  const dayStart = `${dateStr}T00:00:00.000Z`;
  const dayEnd = `${dateStr}T23:59:59.999Z`;
  const twentyMinAgo = new Date(Date.now() - 20 * 60_000).toISOString();

  const { data: bookings } = await admin
    .from("room_bookings")
    .select("starts_at, ends_at, status, created_at")
    .eq("space_id", spaceId)
    .gte("starts_at", dayStart)
    .lte("starts_at", dayEnd);

  const existing = (bookings ?? [])
    .filter((b: any) => b.status === "confirmed" || (b.status === "pending" && b.created_at > twentyMinAgo))
    .map((b: any) => ({ starts_at: b.starts_at, ends_at: b.ends_at }));

  // Re-derive the valid grid server-side and confirm the requested end
  // time is actually reachable from the requested start — rejects stale
  // or tampered client selections.
  const marks = timeMarks(start, existing, settings);
  const reachable = reachableEndMarks(start, marks, existing, settings);
  const matchesReachable = reachable.some((m) => m.getTime() === end.getTime());
  const durationMinutes = (end.getTime() - start.getTime()) / 60_000;
  const withinBounds =
    durationMinutes >= settings.min_booking_minutes &&
    (settings.max_booking_minutes == null || durationMinutes <= settings.max_booking_minutes);

  if (!matchesReachable && !withinBounds) {
    return NextResponse.json({ error: "That slot is no longer available. Please pick another." }, { status: 409 });
  }

  const hours = durationMinutes / 60;
  const totalAed = Math.round((space as any).guest_hourly_rate_aed * hours * 100) / 100;

  const { data: booking, error } = await admin
    .from("room_bookings")
    .insert({
      space_id: spaceId,
      user_id: null,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      status: "pending",
      payment_method: "stripe",
      total_aed: totalAed,
      full_name: fullName,
      email,
      emirates_id: emiratesId || null,
    } as never)
    .select()
    .single();

  if (error || !booking) {
    console.error("Booking insert failed:", error?.message);
    return NextResponse.json({ error: "Could not create booking" }, { status: 500 });
  }

  const bookingId = (booking as any).id;

  if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_SITE_URL) {
    return NextResponse.json(
      { error: "Payments aren't configured yet. Contact flowork directly to complete this booking." },
      { status: 503 }
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "aed",
            unit_amount: Math.round(totalAed * 100),
            product_data: {
              name: `${(space as any).name} — ${start.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/confirmed?booking=${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book?roomId=${spaceId}`,
    });

    await admin
      .from("room_bookings")
      .update({ stripe_session_id: session.id } as never)
      .eq("id", bookingId);

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("Stripe checkout session creation failed:", err);
    await admin.from("room_bookings").update({ status: "cancelled" } as never).eq("id", bookingId);
    return NextResponse.json({ error: "Payment setup failed" }, { status: 500 });
  }
}
