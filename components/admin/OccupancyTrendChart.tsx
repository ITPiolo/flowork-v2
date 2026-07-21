"use client";

import type { OccupancySnapshot } from "@/lib/supabase/types";

const WIDTH = 640;
const HEIGHT = 180;
const PADDING = 28;

export default function OccupancyTrendChart({ snapshots }: { snapshots: OccupancySnapshot[] }) {
  if (snapshots.length < 2) {
    return (
      <p className="text-sm text-charcoal/40 py-8 text-center">
        Trend data will build up daily starting today — check back in a few days to see a graph here.
      </p>
    );
  }

  const points = snapshots.map((s) => ({
    date: s.snapshot_date,
    rate: s.total_units > 0 ? ((s.occupied_count + s.month_to_month_count) / s.total_units) * 100 : 0,
  }));

  const innerW = WIDTH - PADDING * 2;
  const innerH = HEIGHT - PADDING * 2;
  const stepX = innerW / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = PADDING + i * stepX;
    const y = PADDING + innerH - (p.rate / 100) * innerH;
    return { x, y, ...p };
  });

  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${path} L ${coords[coords.length - 1].x.toFixed(1)} ${PADDING + innerH} L ${coords[0].x.toFixed(1)} ${PADDING + innerH} Z`;

  const latest = snapshots[snapshots.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" preserveAspectRatio="none">
        {[0, 25, 50, 75, 100].map((v) => {
          const y = PADDING + innerH - (v / 100) * innerH;
          return (
            <g key={v}>
              <line x1={PADDING} y1={y} x2={WIDTH - PADDING} y2={y} stroke="#1A1D18" strokeOpacity={0.06} />
              <text x={4} y={y + 3} fontSize={9} fill="#1A1D18" opacity={0.4}>
                {v}%
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="#7C8A6D" fillOpacity={0.12} />
        <path d={path} fill="none" stroke="#7C8A6D" strokeWidth={2} />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={2.5} fill="#7C8A6D" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-charcoal/40 mt-1">
        <span>{formatDate(points[0].date)}</span>
        <span>{formatDate(points[points.length - 1].date)}</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <StatPill label="Occupied" value={latest.occupied_count} color="#3B82F6" />
        <StatPill label="Expiring" value={latest.expiring_count} color="#5ab88a" />
        <StatPill label="Month-to-Month" value={latest.month_to_month_count} color="#e8943a" />
        <StatPill label="Total units" value={latest.total_units} />
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function StatPill({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs rounded-full border border-charcoal/10 px-3 py-1.5 text-charcoal/70">
      {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
      {value} {label}
    </span>
  );
}
