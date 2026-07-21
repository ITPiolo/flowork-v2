"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

export default function AnimatedStat({
  value,
  label,
}: {
  value: string; // e.g. "65+", "40+", "1"
  label: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState("0");

  const numeric = parseInt(value.replace(/\D/g, ""), 10) || 0;
  const suffix = value.replace(/[0-9]/g, "");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, numeric, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v).toString()),
    });
    return () => controls.stop();
  }, [inView, numeric]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl bg-cream/10 border border-cream/15 px-4 py-7 sm:py-8 text-center"
    >
      <span ref={ref} className="font-display text-3xl sm:text-4xl md:text-5xl text-cream tabular-nums">
        {display}
        {suffix}
      </span>
      <p className="mt-2 text-xs sm:text-sm text-cream/70 leading-snug">{label}</p>
    </motion.div>
  );
}
