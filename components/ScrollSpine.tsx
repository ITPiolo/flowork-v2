"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Signature element: a vine that grows down a hairline track as the
 * visitor scrolls, echoing flowork's greenery/growth visual language
 * (already present in the footer's wavy lines and the plant-heavy
 * photography). Fixed to the left edge, desktop only — quiet on mobile
 * where screen real estate matters more.
 */
export default function ScrollSpine() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      className="hidden lg:block fixed left-6 top-0 h-screen w-6 z-40 pointer-events-none"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-charcoal/10" />
      <motion.div
        style={{ scaleY, transformOrigin: "top" }}
        className="absolute left-1/2 top-0 bottom-0 w-px bg-sage-500"
      />
    </div>
  );
}
