"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Site-wide smooth/inertia scrolling, ported from the GSAP+Lenis setup
 * in the developer's reference build — reimplemented without GSAP since
 * the rest of the site already uses Framer Motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return null;
}