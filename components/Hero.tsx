"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedStat from "@/components/AnimatedStat";
import VirtualTourButton from "@/components/VirtualTourButton";

const STATS = [
  { value: "130+", label: "Offices across Dubai" },
  { value: "90+", label: "Coworking spaces" },
  { value: "2", label: "Prime locations" },
  { value: "1000+", label: "Businesses served" },
];

export default function Hero() {
  return (
    <section className="relative w-full">
      <div className="relative h-[85vh] min-h-[560px] w-full overflow-hidden">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src="/images/Reception-01-rd-1536x1182.jpg
            alt="flowork workspace"
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/25 to-charcoal/10" />
        </motion.div>

        <div className="relative h-full max-w-content mx-auto px-6 lg:px-8 flex flex-col items-start justify-end pb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="eyebrow text-sage-300 mb-4"
          >
            Dubai Hills &amp; Business Bay
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl md:text-6xl lg:text-7xl text-cream max-w-3xl leading-[1.05]"
          >
            Workspaces that elevate your business
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-5 text-cream/75 max-w-lg text-base md:text-lg"
          >
            Premium private offices, coworking, and meeting rooms designed
            for teams who expect more from where they work.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="flex flex-wrap gap-4 mt-8"
          >
            <Link
              href="/#enquire"
              className="inline-flex items-center rounded-full bg-sage-500 text-cream px-7 py-3.5 text-sm font-medium hover:bg-sage-600 transition-colors"
            >
              Enquire Now
            </Link>
            <Link
              href="/locations"
              className="inline-flex items-center rounded-full border border-cream/40 text-cream px-7 py-3.5 text-sm font-medium hover:bg-cream/10 transition-colors"
            >
              Explore Locations
            </Link>
            <VirtualTourButton />
          </motion.div>
        </div>
      </div>

      <div className="bg-charcoal">
        <div className="max-w-content mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-cream/10 border-t border-cream/10">
          {STATS.map((s) => (
            <div key={s.label} className="py-8">
              <AnimatedStat value={s.value} label={s.label} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}