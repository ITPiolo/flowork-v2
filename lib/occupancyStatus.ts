import type { OccupancyUnit } from "@/lib/supabase/types";

// Three categories, matching how the team actually thinks about the
// floor plan day to day:
//   - "occupied"       Booked on a fixed-term lease, not expiring soon (BLUE)
//   - "expiring"        Vacant right now, OR occupied but the contract
//                       end date is within 2 months — both read as
//                       "available now or soon" to a salesperson (GREEN)
//   - "month_to_month"  Occupied on a rolling month-to-month agreement,
//                       no fixed end date to count down to (ORANGE)
const EXPIRING_WINDOW_MONTHS = 2;

export function computeStatus(unit: OccupancyUnit): "occupied" | "expiring" | "month_to_month" {
  if (unit.manual_status === "occupied" && unit.lease_type === "month_to_month") {
    return "month_to_month";
  }

  if (unit.manual_status === "vacant") return "expiring";

  if (unit.end_date && isWithinExpiringWindow(unit.end_date)) return "expiring";

  return "occupied";
}

// True once today is within EXPIRING_WINDOW_MONTHS calendar months of the
// contract end date (e.g. an Oct 12 end date starts showing as expiring
// on Aug 12), rather than a fixed day count — matches how the team
// actually thinks about "2 months out."
function isWithinExpiringWindow(endDateStr: string): boolean {
  const endDate = new Date(endDateStr);
  if (isNaN(endDate.getTime())) return false;

  const cutoff = new Date(endDate);
  cutoff.setMonth(cutoff.getMonth() - EXPIRING_WINDOW_MONTHS);
  cutoff.setHours(0, 0, 0, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return now.getTime() >= cutoff.getTime();
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