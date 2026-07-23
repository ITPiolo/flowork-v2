import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { RoomBooking, BookableRoom } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking: bookingId } = await searchParams;
  const supabase = await createClient();

  let booking: RoomBooking | null = null;
  let room: BookableRoom | null = null;

  if (bookingId) {
    const { data } = await supabase.from("room_bookings").select("*").eq("id", bookingId).maybeSingle();
    booking = data as RoomBooking | null;
    if (booking) {
      const { data: roomData } = await supabase
        .from("bookable_rooms")
        .select("*")
        .eq("id", booking.room_id)
        .maybeSingle();
      room = roomData as BookableRoom | null;
    }
  }

  const isConfirmed = booking?.status === "confirmed";

  return (
    <section className="max-w-content mx-auto px-6 lg:px-8 py-24 text-center">
      {isConfirmed ? (
        <>
          <CheckCircle2 size={48} className="text-sage-500 mx-auto mb-4" />
          <h1 className="font-display text-3xl md:text-4xl">Booking confirmed</h1>
          {room && booking && (
            <p className="mt-4 text-charcoal/60 max-w-md mx-auto">
              {room.name} &middot;{" "}
              {new Date(booking.starts_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} –{" "}
              {new Date(booking.ends_at).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" })}
            </p>
          )}
          <p className="mt-2 text-sm text-charcoal/40">A confirmation has been sent to your email.</p>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl md:text-4xl">Finalizing your booking...</h1>
          <p className="mt-4 text-charcoal/60 max-w-md mx-auto">
            If this doesn&rsquo;t update in a moment, your payment may still be processing — check back shortly or
            contact us if you have concerns.
          </p>
        </>
      )}
      <Link href="/" className="inline-block mt-8 rounded-full bg-sage-500 text-cream px-6 py-3 text-sm font-medium">
        Back to home
      </Link>
    </section>
  );
}
