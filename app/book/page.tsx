import { createClient } from "@/lib/supabase/server";
import Reveal from "@/components/Reveal";
import BookingFlow from "@/components/BookingFlow";
import type { Location, BookableRoom } from "@/lib/supabase/types";

export const metadata = {
  title: "Book a Room | flowork",
  description: "Book a meeting room, boardroom, or podcast room at flowork Dubai Hills or Vision Tower Business Bay.",
};

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const supabase = await createClient();
  const { data: locationsData } = await supabase.from("locations").select("*").order("display_order");
  const { data: roomsData } = await supabase
    .from("bookable_rooms")
    .select("*")
    .eq("is_active", true)
    .order("name");

  const locations = (locationsData ?? []) as Location[];
  const rooms = (roomsData ?? []) as BookableRoom[];

  return (
    <section className="max-w-content mx-auto px-6 lg:px-8 py-16">
      <Reveal>
        <span className="eyebrow">Book a room</span>
        <h1 className="font-display text-4xl md:text-5xl mt-2 max-w-2xl">
          Reserve a meeting room, boardroom, or podcast room
        </h1>
        <p className="mt-4 text-charcoal/60 max-w-xl">
          Pick a room, choose a time, and pay securely online — your booking is confirmed instantly.
        </p>
      </Reveal>

      <div className="mt-10">
        <BookingFlow locations={locations} rooms={rooms} />
      </div>
    </section>
  );
}
