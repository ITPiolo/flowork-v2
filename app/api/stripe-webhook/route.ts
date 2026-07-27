import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe calls this after a checkout session completes. This is the only
// place a booking actually flips from "pending" to "confirmed" — never
// trust the client's success redirect alone, since that URL could be hit
// without ever paying.

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      const admin = createAdminClient();
      // Note: the real room_bookings table has no stripe_payment_intent_id
      // column (verified against the live schema) — only status changes here.
      const { error } = await admin
        .from("room_bookings")
        .update({ status: "confirmed" } as never)
        .eq("id", bookingId)
        .eq("status", "pending");

      // If this fails because another confirmed booking now overlaps
      // (the DB exclusion constraint rejected it), the slot was taken by
      // someone else in the same race window — flag for manual refund
      // rather than silently losing the payment.
      if (error) {
        console.error(`Booking ${bookingId} could not be confirmed (likely slot conflict):`, error.message);
        await admin.from("room_bookings").update({ status: "cancelled" } as never).eq("id", bookingId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
