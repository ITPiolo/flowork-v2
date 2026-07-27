"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Check } from "lucide-react";
import {
  DEFAULT_BOOKING_SETTINGS,
  timeMarks,
  validStartMarks,
  reachableEndMarks,
  exactDurationMarks,
  endOfDay,
  type BookingSettings,
  type ExistingBooking,
} from "@/lib/booking";
import type { Location, Space } from "@/lib/supabase/types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
}

// Cosmetic only — strips a trailing lone number (e.g. "Meeting Room 1"
// -> "Meeting Room") for display, without touching the underlying
// spaces.name value shared with the mobile app.
function displayName(name: string) {
  return name.replace(/\s+\d+$/, "");
}

function spaceTypeLabel(spaceType: string) {
  return spaceType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function BookingFlow({ locations, rooms }: { locations: Location[]; rooms: Space[] }) {
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState(todayStr());
  const [settings, setSettings] = useState<BookingSettings>(DEFAULT_BOOKING_SETTINGS);
  const [existing, setExisting] = useState<ExistingBooking[]>([]);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);

  const [form, setForm] = useState({ fullName: "", email: "", confirmEmail: "", emiratesId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const roomsForLocation = rooms.filter((r) => r.location_id === locationId);

  useEffect(() => {
    if (roomsForLocation.length > 0 && !roomsForLocation.find((r) => r.id === roomId)) {
      setRoomId(roomsForLocation[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  useEffect(() => {
    if (!roomId || !date) return;
    setLoading(true);
    setStart(null);
    setEnd(null);
    fetch(`/api/rooms/availability?roomId=${roomId}&date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (data.existing) setExisting(data.existing);
        if (data.hourlyRateAed != null) setHourlyRate(data.hourlyRateAed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [roomId, date]);

  const marks = useMemo(() => timeMarks(new Date(date), existing, settings), [date, existing, settings]);
  const validStarts = useMemo(() => validStartMarks(marks, existing, settings), [marks, existing, settings]);

  const endOptions = useMemo(() => {
    if (!start) return [];
    const reachable = reachableEndMarks(start, marks, existing, settings);
    const exact = exactDurationMarks(start, settings, endOfDay(new Date(date), settings));
    const all = [...reachable, ...exact].filter(
      (d, i, arr) => arr.findIndex((x) => x.getTime() === d.getTime()) === i
    );
    return all.sort((a, b) => a.getTime() - b.getTime());
  }, [start, marks, existing, settings, date]);

  const durationHours = start && end ? (end.getTime() - start.getTime()) / 3_600_000 : 0;
  const priceAed = Math.round(hourlyRate * durationHours * 100) / 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!start || !end) return;
    if (form.email !== form.confirmEmail) {
      setError("Email addresses don't match — your invoice depends on this being correct.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          fullName: form.fullName,
          email: form.email,
          confirmEmail: form.confirmEmail,
          emiratesId: form.emiratesId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        setSubmitting(false);
        return;
      }
      window.location.href = json.checkoutUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const selectedRoom = rooms.find((r) => r.id === roomId);

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-10">
      <div>
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Field label="Location">
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="select-input">
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Room">
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="select-input">
              {roomsForLocation.map((r) => (
                <option key={r.id} value={r.id}>{displayName(r.name)}</option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input
              type="date"
              value={date}
              min={todayStr()}
              onChange={(e) => setDate(e.target.value)}
              className="select-input"
            />
          </Field>
        </div>

        {selectedRoom && (
          <div className="rounded-2xl border border-charcoal/10 overflow-hidden mb-6">
            {selectedRoom.photo_url && (
              <div className="relative aspect-[16/9]">
                <Image
                  src={selectedRoom.photo_url}
                  alt={displayName(selectedRoom.name)}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-display text-lg">{displayName(selectedRoom.name)}</h3>
                  <p className="text-xs text-charcoal/50 uppercase tracking-wide mt-0.5">
                    {spaceTypeLabel(selectedRoom.space_type)}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-charcoal/60">
                  {selectedRoom.capacity && (
                    <span className="flex items-center gap-1.5">
                      <Users size={15} className="text-sage-500" />
                      Up to {selectedRoom.capacity} people
                    </span>
                  )}
                  <span className="font-medium text-charcoal">AED {selectedRoom.guest_hourly_rate_aed}/hr</span>
                </div>
              </div>

              {selectedRoom.description && (
                <p className="text-sm text-charcoal/60 mt-3">{selectedRoom.description}</p>
              )}

              {selectedRoom.inclusions && selectedRoom.inclusions.length > 0 && (
                <ul className="mt-4 grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  {selectedRoom.inclusions.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-charcoal/70">
                      <Check size={14} className="text-sage-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-charcoal/40">Loading availability...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-charcoal mb-3">Choose a start time</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {validStarts.length === 0 && (
                <p className="text-sm text-charcoal/40">No availability left for this day — try another date.</p>
              )}
              {validStarts.map((m) => (
                <button
                  key={m.getTime()}
                  onClick={() => {
                    setStart(m);
                    setEnd(null);
                  }}
                  className={`text-sm rounded-full px-4 py-2 border transition-colors ${
                    start?.getTime() === m.getTime()
                      ? "bg-sage-500 border-sage-500 text-cream"
                      : "border-charcoal/15 text-charcoal/70 hover:bg-sage-50"
                  }`}
                >
                  {fmtTime(m)}
                </button>
              ))}
            </div>

            <AnimatePresence>
            {start && (
              <motion.div
                key={start.getTime()}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-charcoal mb-3">Choose an end time</p>
                <div className="flex flex-wrap gap-2">
                  {endOptions.map((m, i) => (
                    <motion.button
                      key={m.getTime()}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.25 }}
                      onClick={() => setEnd(m)}
                      className={`text-sm rounded-full px-4 py-2 border transition-colors ${
                        end?.getTime() === m.getTime()
                          ? "bg-sage-500 border-sage-500 text-cream"
                          : "border-charcoal/15 text-charcoal/70 hover:bg-sage-50"
                      }`}
                    >
                      {fmtTime(m)}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </>
        )}
      </div>

      <div className="rounded-3xl bg-charcoal text-cream p-6 sm:p-8 h-fit">
        <h3 className="font-display text-xl mb-1">Your booking</h3>
        {start && end ? (
          <>
            <p className="text-sm text-cream/70 mt-2">
              {selectedRoom && displayName(selectedRoom.name)} &middot; {new Date(date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
            </p>
            <p className="text-sm text-cream/70">
              {fmtTime(start)} – {fmtTime(end)} ({durationHours.toFixed(1)}h)
            </p>
            <p className="font-display text-2xl mt-4 text-sand">AED {priceAed}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                required
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="form-input"
              />
              <input
                required
                type="email"
                placeholder="Email (invoice will be sent here)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-input"
              />
              <input
                required
                type="email"
                placeholder="Confirm email"
                value={form.confirmEmail}
                onChange={(e) => setForm({ ...form, confirmEmail: e.target.value })}
                className="form-input"
              />
              <input
                placeholder="Emirates ID or Passport number (optional)"
                value={form.emiratesId}
                onChange={(e) => setForm({ ...form, emiratesId: e.target.value })}
                className="form-input"
              />

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-sage-500 text-cream py-3.5 text-sm font-medium hover:bg-sage-600 transition-colors disabled:opacity-60"
              >
                {submitting ? "Redirecting to payment..." : `Pay & Book — AED ${priceAed}`}
              </button>
              <p className="text-xs text-cream/40 text-center">Secure payment via Stripe — card or Apple Pay</p>
            </form>
          </>
        ) : (
          <p className="text-sm text-cream/50 mt-3">Select a start and end time to continue.</p>
        )}
      </div>

      <style jsx>{`
        .select-input, .form-input {
          width: 100%;
          border-radius: 0.5rem;
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .select-input {
          border: 1px solid rgba(26,29,24,0.15);
          background: white;
          color: #1A1D18;
        }
        .form-input {
          border: 1px solid rgba(247,245,239,0.2);
          background: transparent;
          color: #F7F5EF;
        }
        .form-input::placeholder { color: rgba(247,245,239,0.4); }
        .form-input:focus { border-color: #C9A876; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-charcoal/50 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
