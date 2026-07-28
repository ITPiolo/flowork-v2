"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const DUBAI_TZ = "Asia/Dubai";

function formatTime(date: Date, timeZone?: string) {
  return date.toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });
}

// A small floating pill, fixed to the screen (like the WhatsApp button),
// showing flowork's home time (Dubai) alongside the visitor's own local
// time — auto-detected from the browser, works for any country. Says
// "24/7 access" rather than "open/closed" since that's the actual
// member value prop for a coworking business center — the space never
// closes, only reception desk hours vary, so an open/closed indicator
// would be misleading. Shown on every screen size — most visitors are
// on mobile, so this shouldn't have been desktop-only to begin with.
export default function LiveTimeBadge() {
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="flex fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 items-center gap-1.5 sm:gap-2 rounded-full bg-charcoal/90 backdrop-blur-sm text-cream px-3 py-2 sm:px-4 sm:py-2.5 shadow-lg border border-cream/10 max-w-[calc(100vw-2rem)]"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-sage-400 animate-ping opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-sage-400" />
      </span>

      <Clock size={12} className="text-sage-400 shrink-0" />

      <span className="text-[11px] sm:text-xs whitespace-nowrap overflow-hidden text-ellipsis">
        Dubai {dubaiTime}
        <span className="text-sage-300"> &middot; 24/7</span>
        {!isVisitorInDubai && <span className="text-cream/40"> &middot; You {formatTime(now)}</span>}
      </span>
    </motion.div>
  );
}
