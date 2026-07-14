"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MARK = "flowork".split("");

export default function Preloader() {
  const [visible, setVisible] = useState(false);
  const [curtainOpen, setCurtainOpen] = useState(false);

  useEffect(() => {
    // Only show once per browser session, not on every client-side nav —
    // page-to-page transitions are already handled by PageTransition.tsx.
    if (sessionStorage.getItem("flowork-preloaded")) return;
    sessionStorage.setItem("flowork-preloaded", "1");

    setVisible(true);
    const curtainTimer = setTimeout(() => setCurtainOpen(true), 1500);
    const hideTimer = setTimeout(() => setVisible(false), 2300);

    return () => {
      clearTimeout(curtainTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[200] pointer-events-none" aria-hidden="true">
          {/* Top curtain */}
          <motion.div
            initial={{ y: 0 }}
            animate={curtainOpen ? { y: "-100%" } : { y: 0 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="absolute top-0 left-0 right-0 h-1/2 bg-charcoal"
          />
          {/* Bottom curtain */}
          <motion.div
            initial={{ y: 0 }}
            animate={curtainOpen ? { y: "100%" } : { y: 0 }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-charcoal"
          />

          {/* Wordmark + tagline, fades with the curtain */}
          <motion.div
            animate={curtainOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <div className="flex font-display text-4xl md:text-5xl overflow-hidden">
              {MARK.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "115%" }}
                  animate={{ y: 0 }}
                  transition={{
                    delay: 0.15 + i * 0.05,
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={i < 3 ? "text-sage-300 italic" : "text-cream"}
                >
                  {char}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + MARK.length * 0.05 + 0.1, duration: 0.3 }}
                className="text-sage-300"
              >
                .
              </motion.span>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="mt-4 text-xs tracking-[0.2em] uppercase text-cream/50"
            >
              Embrace the flow, empower together
            </motion.p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}