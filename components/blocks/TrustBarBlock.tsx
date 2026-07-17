"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, MapPin, Users, ShieldCheck } from "lucide-react";
import { motion, useInView, animate } from "framer-motion";

const ICONS = [Building2, MapPin, Users, ShieldCheck];

// Extracts ONLY the leading digits (with optional comma, optional a
// trailing "+") as the countable number — deliberately does NOT match
// a following "/7" etc, so "24/7 secure access" counts up to 24 and
// keeps "/7 secure access" as plain static text right after it.
function splitLeadingNumber(text: string): { number: string; rest: string } | null {
  const match = text.match(/^(\d{1,3}(?:,\d{3})*)(\+)?/);
  if (!match) return null;
  const number = match[0];
  const rest = text.slice(number.length);
  return { number, rest };
}

function CountingLabel({ text, delay }: { text: string; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const parsed = splitLeadingNumber(text);
  const [display, setDisplay] = useState(parsed ? "0" : text);

  useEffect(() => {
    if (!inView || !parsed) return;
    const digits = parsed.number.replace(/[^\d]/g, "");
    const target = parseInt(digits, 10);
    const hasComma = parsed.number.includes(",");
    const hasPlus = parsed.number.includes("+");

    const controls = animate(0, target, {
      duration: 1.2,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        const rounded = Math.round(v);
        const formatted = hasComma ? rounded.toLocaleString() : String(rounded);
        setDisplay(formatted + (hasPlus ? "+" : ""));
      },
    });
    return () => controls.stop();
  }, [inView, parsed, delay]);

  if (!parsed) return <span ref={ref}>{text}</span>;

  return (
    <span ref={ref}>
      {display}
      {parsed.rest}
    </span>
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
    <section className="bg-charcoal py-16">
      <div className="max-w-content mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-cream/10 border-y border-cream/10">
          {points.map((p, i) => {
            const Icon = ICONS[i] ?? Building2;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="flex flex-col items-center text-center gap-2 py-8 px-3"
              >
                <Icon size={20} className="text-sage-400" />
                <span className="text-sm font-medium text-cream/80">
                  <CountingLabel text={p} delay={i * 0.1} />
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}