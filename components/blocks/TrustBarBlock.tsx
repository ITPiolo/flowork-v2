"use client";

import { Building2, MapPin, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const ICONS = [Building2, MapPin, Users, ShieldCheck];

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
                <span className="text-sm font-medium">{p}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}