"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, MapPin, Users, ShieldCheck } from "lucide-react";
import { motion, useInView, animate } from "framer-motion";

const ICONS = [Building2, MapPin, Users, ShieldCheck];

function splitLeadingNumber(text: string): { number: string; rest: string } | null {
  const match = text.match(/^(\d{1,3}(?:,\d{3})*)(\+)?/);
  if (!match) return null;
  const number = match[0];
  const rest = text.slice(number.length);
  return { number, rest };
}

function StatCard({ text, icon: Icon, index }: { text: string; icon: typeof Building2; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const parsed = splitLeadingNumber(text);
  const [display, setDisplay] = useState(parsed ? "0" : text);

  useEffect(() => {
    if (!inView || !parsed) return;
    const digits = parsed.number.replace(/[^\d]/g, "");
    const target = parseInt(digits, 10);
    const hasComma = parsed.number.includes(",");
    const hasPlus = parsed.number.includes("+");

    // All four cards animate on the same trigger, same duration, no
    // extra per-item delay stacked on top of the fade-in — they finish
    // together instead of drifting apart.
    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        const rounded = Math.round(v);
        const formatted = hasComma ? rounded.toLocaleString() : String(rounded);
        setDisplay(formatted + (hasPlus ? "+" : ""));
      },
    });
    return () => controls.stop();
  }, [inView, parsed]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="flex items-center justify-center gap-3 py-8 px-4"
    >
      <Icon size={22} className="text-sage-400 shrink-0" />
      <span className="text-sm md:text-base font-medium text-cream/90">
        {parsed ? display + parsed.rest : text}
      </span>
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

  return (
    <section className="bg-charcoal py-6">
      <div className="max-w-content mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-cream/10 border-y border-cream/10">
          {points.map((p, i) => (
            <StatCard key={i} text={p} icon={ICONS[i] ?? Building2} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}