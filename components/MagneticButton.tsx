"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Wraps a button/link so it pulls slightly toward the cursor when
// nearby, and snaps back on leave — a common "premium" signature touch
// on award-tier sites. Strength is deliberately subtle (max ~14px).
export default function MagneticButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 15, stiffness: 200, mass: 0.5 });
  const springY = useSpring(y, { damping: 15, stiffness: 200, mass: 0.5 });

  // Touch devices fire one synthetic mousemove on tap with no real
  // "mouse leave" after — skip the pull entirely there rather than risk
  // a button stuck offset after tapping it.
  function isFinePointer() {
    return typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isFinePointer()) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * 0.35);
    y.set(relY * 0.35);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      onTouchEnd={reset}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
