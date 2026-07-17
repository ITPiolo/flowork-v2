"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import AnimatedStat from "@/components/AnimatedStat";
import VirtualTourButton from "@/components/VirtualTourButton";

const HERO_IMAGES = [
  "/images/Reception-01-rd-1536x1182.jpg",
  "/images/Co-Working-02-Copy.jpg",
  "/images/EEEE0484-Улучшено-Ум.-шума.jpg",
];

const STATS = [
  { value: "130+", label: "Offices across Dubai" },
  { value: "90+", label: "Coworking spaces" },
  { value: "2", label: "Prime locations" },
  { value: "1000+", label: "Businesses served" },
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full">
      <div className="relative h-[85vh] min-h-[560px] w-full overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_IMAGES[index]}
              alt="flowork workspace"
              fill
              priority={index === 0}
              quality={95}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Stronger, more consistent scrim so text stays readable
            regardless of which photo is showing — a top-to-bottom fade
            plus a left-side fade specifically behind the text column. */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-charcoal/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 via-charcoal/10 to-transparent" />

        <div className="relative h-full max-w-content mx-auto px-6 lg:px-8 flex flex-col items-start justify-end pb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="eyebrow text-sage-300 mb-4 inline-block bg-charcoal/50 backdrop-blur-sm px-3 py-1.5 rounded-full"
          >
            Dubai Hills &amp; Business Bay
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl md:text-6xl lg:text-7xl text-cream max-w-3xl leading-[1.05] drop-shadow-md"
          >
            Workspaces that elevate your business
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-5 text-cream/90 max-w-lg text-base md:text-lg drop-shadow-sm"
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

        {/* Slide indicator dots */}
        <div className="absolute bottom-6 right-6 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show background image ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-cream" : "w-1.5 bg-cream/40"
              }`}
            />
          ))}
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