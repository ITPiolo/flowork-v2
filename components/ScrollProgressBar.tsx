"use client";

import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";

// Thin sage bar at the very top of the viewport that fills as you
// scroll down the page — a common, low-cost signature detail on
// polished sites. Not shown in /admin (a work tool, not a story to
// scroll through).
export default function ScrollProgressBar() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  if (pathname?.startsWith("/admin")) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] bg-sage-500 origin-left z-[300]"
      style={{ scaleX }}
    />
  );
}
