import type { OccupancyUnit } from "@/lib/supabase/types";

// Three categories, matching how the team actually thinks about the
// floor plan day to day:
//   - "occupied"       Booked on a fixed-term lease, not expiring soon (BLUE)
//   - "expiring"        Vacant right now, OR occupied but renewal is
//                       within 60 days — both read as "available now
//                       or soon" to a salesperson (GREEN)
//   - "month_to_month"  Occupied on a rolling month-to-month agreement,
//                       no fixed end date to count down to (ORANGE)
export function computeStatus(unit: OccupancyUnit): "occupied" | "expiring" | "month_to_month" {
  if (unit.manual_status === "occupied" && unit.lease_type === "month_to_month") {
    return "month_to_month";
  }

  if (unit.manual_status === "vacant") return "expiring";

  if (unit.renewal_date) {
    const days = daysUntil(unit.renewal_date);
    if (days !== null && days <= 60) return "expiring";
  }

  return "occupied";
}

function daysUntil(dateStr: string): number | null {
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export const STATUS_COLORS: Record<string, string> = {
  occupied: "#3B82F6",
  expiring: "#5ab88a",
  month_to_month: "#e8943a",
};

export const STATUS_LABELS: Record<string, string> = {
  occupied: "Occupied",
  expiring: "Expiring",
  month_to_month: "Month-to-Month",
};