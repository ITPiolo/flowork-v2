"use client";

import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AnimatedStat from "@/components/AnimatedStat";
import VirtualTourButton from "@/components/VirtualTourButton";
import MagneticButton from "@/components/MagneticButton";
import ScrambleText from "@/components/ScrambleText";

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
  const photoRef = useRef<HTMLDivElement>(null);

  // Subtle parallax: the photo drifts a few pixels opposite the cursor,
  // giving the hero a bit of depth instead of sitting completely flat.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springTiltX = useSpring(tiltX, { damping: 20, stiffness: 150 });
  const springTiltY = useSpring(tiltY, { damping: 20, stiffness: 150 });

  function handlePhotoMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = photoRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(relX * -16);
    tiltY.set(relY * -16);
  }

  function handlePhotoMouseLeave() {
    tiltX.set(0);
    tiltY.set(0);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full">
      <div className="grid lg:grid-cols-[minmax(0,560px)_1fr] min-h-[85vh]">
        {/* Left: solid charcoal panel, text always at full contrast
            since it never sits on top of a photo */}
        <div className="relative bg-charcoal flex flex-col justify-center px-6 lg:px-14 py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6 self-start"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sage-400 animate-pulse" />
            <span className="eyebrow text-sage-300">Dubai Hills &amp; Business Bay</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl md:text-6xl text-cream leading-[1.05] tracking-tight"
          >
            <ScrambleText text="Workspaces that elevate your business" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-6 text-cream/60 text-lg max-w-md"
          >
            Premium private offices, coworking, and meeting rooms designed
            for teams who expect more from where they work.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap gap-3 mt-10"
          >
            <MagneticButton>
              <Link
                href="/#enquire"
                className="inline-flex items-center rounded-full bg-sage-500 text-cream px-7 py-3.5 text-sm font-medium hover:bg-sage-600 hover:scale-[1.02] transition-all"
              >
                Enquire Now
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="/locations"
                className="inline-flex items-center rounded-full border border-cream/25 text-cream px-7 py-3.5 text-sm font-medium hover:bg-cream/10 transition-colors"
              >
                Explore Locations
              </Link>
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            <VirtualTourButton
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-sage-300 hover:text-sage-200 transition-colors underline underline-offset-4 decoration-sage-500/40"
              label="Or take the 360° tour →"
            />
          </motion.div>

          {/* Slide dots, tucked into the panel */}
          <div className="flex gap-2 mt-14">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                className={`h-1 rounded-full transition-all ${
                  i === index ? "w-8 bg-sand" : "w-3 bg-cream/35"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: full, undimmed, vibrant photo — no overlay needed */}
        <div
          ref={photoRef}
          onMouseMove={handlePhotoMouseMove}
          onMouseLeave={handlePhotoMouseLeave}
          className="relative overflow-hidden min-h-[400px]"
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ x: springTiltX, y: springTiltY }}
              className="absolute -inset-4"
            >
              <Image
                src={HERO_IMAGES[index]}
                alt="flowork workspace"
                fill
                priority={index === 0}
                quality={95}
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          {/* Subtle edge fade only where the two panels meet, for a
              clean seam rather than a hard cut */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-charcoal/40 to-transparent hidden lg:block pointer-events-none" />
        </div>
      </div>

      <div className="bg-charcoal border-t border-cream/10 py-10">
        <div className="max-w-content mx-auto px-5 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {STATS.map((s) => (
            <AnimatedStat key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}