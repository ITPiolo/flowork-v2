"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, MapPin, Users, ShieldCheck } from "lucide-react";
import { motion, useInView, animate } from "framer-motion";

const ICONS = [Building2, MapPin, Users, ShieldCheck];

// Splits a label like "1,000+ businesses hosted" into a countable
// leading number ("1,000+") and the rest of the text, so the number
// portion can animate counting up while the label stays static.
function splitLeadingNumber(text: string): { number: string; rest: string } | null {
  const match = text.match(/^([\d,]+)(\+)?/);
  if (!match) return null;
  const number = match[0];
  const rest = text.slice(number.length);
  const digits = number.replace(/[^\d]/g, "");
  if (!digits) return null;
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
    const suffix = parsed.number.replace(/[\d,]/g, "");
    const hasComma = parsed.number.includes(",");

    const controls = animate(0, target, {
      duration: 1.2,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        const rounded = Math.round(v);
        setDisplay((hasComma ? rounded.toLocaleString() : String(rounded)) + suffix);
      },
    });
    return () => controls.stop();
  }, [inView, parsed, delay]);

  if (!parsed) {
    return <span ref={ref}>{text}</span>;
  }

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
    <section className="border-y border-charcoal/10 bg-sage-50/50 py-14">
      <div className="max-w-content mx-auto px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
          {points.map((p, i) => {
            const Icon = ICONS[i] ?? Building2;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="flex items-center gap-2.5 text-charcoal/60"
              >
                <Icon size={18} className="text-sage-500" />
                <span className="text-sm font-medium">
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