"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function HeroBlock({
  heading,
  subheading,
  images,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  eyebrow,
}: {
  heading: string;
  subheading: string;
  images: { url: string }[];
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  eyebrow: string;
}) {
  const [index, setIndex] = useState(0);
  const slides = images && images.length > 0 ? images : [{ url: "/images/Reception-01-rd-1536x1182.jpg" }];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative w-full">
      {/* ===== MOBILE / TABLET: full-bleed photo, centered overlay text ===== */}
      <div className="lg:hidden relative h-[85vh] min-h-[560px] w-full overflow-hidden">
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
              src={slides[index].url}
              alt={heading}
              fill
              priority={index === 0}
              quality={95}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-charcoal/25" />

        <div className="relative h-full max-w-content mx-auto px-6 flex flex-col items-start justify-end pb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="eyebrow text-sage-300 mb-4 inline-block bg-charcoal/50 backdrop-blur-sm px-3 py-1.5 rounded-full"
          >
            {eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="font-display text-4xl text-cream leading-[1.1]"
          >
            {heading}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="mt-4 text-cream/90 text-base"
          >
            {subheading}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap gap-3 mt-7"
          >
            {primaryLabel && (
              <Link
                href={primaryHref || "#"}
                className="inline-flex items-center rounded-full bg-sage-500 text-cream px-6 py-3 text-sm font-medium hover:bg-sage-600 transition-colors"
              >
                {primaryLabel}
              </Link>
            )}
            {secondaryLabel && (
              <Link
                href={secondaryHref || "#"}
                className="inline-flex items-center rounded-full border border-cream/40 bg-cream/5 backdrop-blur-sm text-cream px-6 py-3 text-sm font-medium hover:bg-cream/15 transition-colors"
              >
                {secondaryLabel}
              </Link>
            )}
          </motion.div>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-5 right-5 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-sand" : "w-1.5 bg-cream/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== DESKTOP: split-screen layout ===== */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,560px)_1fr] min-h-[85vh]">
        <div className="relative bg-charcoal flex flex-col justify-center px-14 py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6 self-start"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sage-400 animate-pulse" />
            <span className="eyebrow text-sage-300">{eyebrow}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="font-display text-5xl xl:text-6xl text-cream leading-[1.05] tracking-tight"
          >
            {heading}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-6 text-cream/60 text-lg max-w-md"
          >
            {subheading}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap gap-3 mt-10"
          >
            {primaryLabel && (
              <Link
                href={primaryHref || "#"}
                className="inline-flex items-center rounded-full bg-sage-500 text-cream px-7 py-3.5 text-sm font-medium hover:bg-sage-600 hover:scale-[1.02] transition-all"
              >
                {primaryLabel}
              </Link>
            )}
            {secondaryLabel && (
              <Link
                href={secondaryHref || "#"}
                className="inline-flex items-center rounded-full border border-cream/25 text-cream px-7 py-3.5 text-sm font-medium hover:bg-cream/10 transition-colors"
              >
                {secondaryLabel}
              </Link>
            )}
          </motion.div>

          {slides.length > 1 && (
            <div className="flex gap-2 mt-14">
              {slides.map((_, i) => (
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
          )}
        </div>

        <div className="relative overflow-hidden min-h-[400px]">
          <AnimatePresence mode="sync">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={slides[index].url}
                alt={heading}
                fill
                priority={index === 0}
                quality={95}
                sizes="60vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-charcoal/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}