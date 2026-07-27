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
// time — auto-detected from the browser, works for any country. Desktop
// only; sits on the opposite corner from the WhatsApp button so they
// never collide.
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
      className="hidden lg:flex fixed bottom-6 left-6 z-40 items-center gap-2 rounded-full bg-charcoal/90 backdrop-blur-sm text-cream px-4 py-2.5 shadow-lg border border-cream/10"
    >
      <Clock size={13} className="text-sage-400 shrink-0" />
      <span className="text-xs whitespace-nowrap">
        Dubai {dubaiTime}
        {!isVisitorInDubai && <span className="text-cream/50"> &middot; You {formatTime(now)}</span>}
      </span>
    </motion.div>
  );
}
