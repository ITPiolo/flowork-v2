"use client";

import { Building2, Users, MapPin, ShieldCheck } from "lucide-react";
import Reveal from "@/components/Reveal";

const POINTS = [
  { icon: Building2, label: "1,000+ businesses hosted" },
  { icon: MapPin, label: "2 flagship Dubai locations" },
  { icon: Users, label: "50-strong on-site team" },
  { icon: ShieldCheck, label: "24/7 secure access" },
];

export default function TrustSection() {
  return (
    <section className="border-y border-charcoal/10 bg-sage-50/50 py-14">
      <div className="max-w-content mx-auto px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
          {POINTS.map((p, i) => (
            <Reveal key={p.label} delay={i * 0.06}>
              <div className="flex items-center gap-2.5 text-charcoal/60">
                <p.icon size={18} className="text-sage-500" />
                <span className="text-sm font-medium">{p.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}