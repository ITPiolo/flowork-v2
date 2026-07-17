"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, MapPin, Users, ShieldCheck } from "lucide-react";
import { motion, useInView, animate } from "framer-motion";

const ICONS = [Building2, MapPin, Users, ShieldCheck];

// Parses a label like "1,000+ businesses hosted" or "24/7 secure access"
// into: a countable target number, formatting flags, a display suffix
// that isn't counted (like "/7"), and a clean label underneath.
function parseStat(text: string) {
  const numMatch = text.match(/^(\d{1,3}(?:,\d{3})*)(\+)?/);
  if (!numMatch) return null;

  let idx = numMatch[0].length;
  let displaySuffix = "";

  const slashMatch = text.slice(idx).match(/^\/\d+/);
  if (slashMatch) {
    displaySuffix = slashMatch[0];
    idx += slashMatch[0].length;
  }

  let label = text.slice(idx).replace(/^[-\s]+/, "").trim();
  label = label.charAt(0).toUpperCase() + label.slice(1);

  return {
    target: parseInt(numMatch[1].replace(/,/g, ""), 10),
    hasPlus: numMatch[2] === "+",
    hasComma: numMatch[1].includes(","),
    displaySuffix,
    label,
  };
}

function StatCard({
  text,
  icon: Icon,
  index,
  startCounting,
}: {
  text: string;
  icon: typeof Building2;
  index: number;
  startCounting: boolean;
}) {
  const parsed = useMemo(() => parseStat(text), [text]);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!startCounting || !parsed) return;
    const controls = animate(0, parsed.target, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        const rounded = Math.round(v);
        setDisplay(parsed.hasComma ? rounded.toLocaleString() : String(rounded));
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCounting, parsed?.target]);

  if (!parsed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.06, duration: 0.5 }}
        className="flex flex-col items-center text-center gap-2 py-8 px-4"
      >
        <Icon size={22} className="text-sage-400" />
        <span className="text-sm font-medium text-cream/80">{text}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="flex flex-col items-center text-center gap-2 py-8 px-4"
    >
      <Icon size={22} className="text-sage-400" />
      <span className="font-display text-3xl md:text-4xl text-cream">
        {display}
        {parsed.hasPlus ? "+" : ""}
        {parsed.displaySuffix}
      </span>
      <span className="text-xs md:text-sm text-cream/60">{parsed.label}</span>
    </motion.div>
  );
}

export default function TrustBarBlock({
  point1,
  point2,
  point3,
  point4,
}: {
  point1: string;
  point2: string;
  point3: string;
  point4: string;
}) {
  const points = [point1, point2, point3, point4].filter(Boolean);
  const sectionRef = useRef<HTMLDivElement>(null);
  // ONE shared trigger for the whole row, so all four numbers start
  // counting at exactly the same instant — not whenever each individual
  // card happens to cross the viewport edge.
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section ref={sectionRef} className="bg-charcoal py-4">
      <div className="max-w-content mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-cream/10 border-y border-cream/10">
          {points.map((p, i) => (
            <StatCard key={i} text={p} icon={ICONS[i] ?? Building2} index={i} startCounting={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}