export type BookingSettings = {
  buffer_minutes: number;
  slot_increment_minutes: number;
  min_booking_minutes: number;
  max_booking_minutes: number | null;
  opening_time: string; // 'HH:MM' or 'HH:MM:SS'
  closing_time: string;
};

export type ExistingBooking = {
  starts_at: string; // ISO
  ends_at: string; // ISO
};

// Fallback only — matches the real booking_settings row's own column
// defaults in Supabase, used if a location has no settings row yet. The
// DB row (or a space's own min/max override) is always the real source
// of truth.
export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  buffer_minutes: 5,
  slot_increment_minutes: 30,
  min_booking_minutes: 30,
  max_booking_minutes: null,
  opening_time: "09:00",
  closing_time: "18:00",
};

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function atMinutes(date: Date, minutesOfDay: number): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minutesOfDay);
  return d;
}

type Block = { start: number; end: number };

function toBlocks(existing: ExistingBooking[]): Block[] {
  return existing
    .map((b) => ({ start: new Date(b.starts_at).getTime(), end: new Date(b.ends_at).getTime() }))
    .sort((a, b) => a.start - b.start);
}

export function timeMarks(
  date: Date,
  existing: ExistingBooking[],
  settings: BookingSettings,
  now: Date = new Date()
): Date[] {
  const open = parseTimeToMinutes(settings.opening_time);
  const close = parseTimeToMinutes(settings.closing_time);
  const dayEnd = atMinutes(date, close).getTime();
  const buffer = settings.buffer_minutes * 60_000;
  const increment = settings.slot_increment_minutes * 60_000;
  const blocks = toBlocks(existing);

  const timestamps = new Set<number>();
  let cursor = atMinutes(date, open).getTime();
  let iterations = 0;

  while (cursor <= dayEnd && iterations < 2000) {
    iterations++;
    const colliding = blocks.find((b) => cursor >= b.start - buffer && cursor < b.end + buffer);
    if (colliding) {
      cursor = colliding.end + buffer;
      continue;
    }
    timestamps.add(cursor);
    cursor += increment;
  }

  timestamps.add(dayEnd);

  return Array.from(timestamps)
    .filter((t) => t > now.getTime() && t <= dayEnd)
    .sort((a, b) => a - b)
    .map((t) => new Date(t));
}

export function reachableEndMarks(
  start: Date,
  marks: Date[],
  existing: ExistingBooking[],
  settings: BookingSettings
): Date[] {
  const blocks = toBlocks(existing);
  const buffer = settings.buffer_minutes * 60_000;
  const maxEnd = settings.max_booking_minutes != null
    ? start.getTime() + settings.max_booking_minutes * 60_000
    : Infinity;

  return marks.filter((m) => {
    const duration = m.getTime() - start.getTime();
    if (duration < settings.min_booking_minutes * 60_000 || m.getTime() > maxEnd) return false;
    const collides = blocks.some((b) => start.getTime() < b.end + buffer && m.getTime() + buffer > b.start);
    return !collides;
  });
}

export function validStartMarks(
  marks: Date[],
  existing: ExistingBooking[],
  settings: BookingSettings
): Date[] {
  return marks.filter((m) => reachableEndMarks(m, marks, existing, settings).length > 0);
}

export function endOfDay(date: Date, settings: BookingSettings): Date {
  const [h, m] = settings.closing_time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(h * 60 + (m || 0));
  return d;
}

export function exactDurationMarks(start: Date, settings: BookingSettings, dayEnd: Date): Date[] {
  const out: Date[] = [];
  const minEnd = new Date(start.getTime() + settings.min_booking_minutes * 60_000);
  if (minEnd.getTime() <= dayEnd.getTime()) out.push(minEnd);
  if (settings.max_booking_minutes != null) {
    const maxEnd = new Date(start.getTime() + settings.max_booking_minutes * 60_000);
    if (maxEnd.getTime() <= dayEnd.getTime() && maxEnd.getTime() !== minEnd.getTime()) out.push(maxEnd);
  }
  return out;
}
