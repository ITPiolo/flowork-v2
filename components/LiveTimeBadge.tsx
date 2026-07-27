"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const DUBAI_TZ = "Asia/Dubai";

function formatTime(date: Date, timeZone?: string) {
  return date.toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });
}

// Shows flowork's home time (Dubai) alongside the visitor's own local
// time, wherever they're browsing from — auto-detected from the
// browser, not a fixed list of cities. A small "we're real, we're
// global" touch inspired by sites that show a live studio/office clock.
export default function LiveTimeBadge({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  const [visitorTz, setVisitorTz] = useState<string | null>(null);

  useEffect(() => {
    setNow(new Date());
    setVisitorTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!now || !visitorTz) return null;

  const dubaiTime = formatTime(now, DUBAI_TZ);
  const isVisitorInDubai = visitorTz === DUBAI_TZ;

  return (
    <div className={`flex items-center gap-1.5 text-xs text-charcoal/50 ${className}`}>
      <Clock size={13} className="text-sage-500" />
      <span>Dubai {dubaiTime}</span>
      {!isVisitorInDubai && (
        <>
          <span className="text-charcoal/25">&middot;</span>
          <span>Your time {formatTime(now)}</span>
        </>
      )}
    </div>
  );
}
