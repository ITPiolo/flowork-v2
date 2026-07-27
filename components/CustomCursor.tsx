"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring } from "framer-motion";

// A small branded cursor that trails the pointer with a soft spring lag,
// and expands into a ring when hovering anything clickable — desktop
// (fine-pointer) only, since touch devices have no real cursor to
// replace and forcing this on would just add dead-weight JS there.
export default function CustomCursor() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { damping: 28, stiffness: 380, mass: 0.4 });
  const springY = useSpring(y, { damping: 28, stiffness: 380, mass: 0.4 });

  // A ref (not state) so handleMove can check it synchronously without
  // re-subscribing the listener — avoids the cursor flashing back on
  // the very next mousemove while still over a blocked element.
  const blockedRef = useRef(false);

  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return; // keep the normal cursor for the day-to-day admin tool
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor-active");

    function handleMove(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!blockedRef.current) setVisible(true);
    }

    function handleOver(e: MouseEvent) {
      const target = e.target as HTMLElement;

      // Native <select> and date/time inputs open an OS-rendered popup
      // our custom cursor can't follow into — hide it and let the real
      // system cursor take over for these specifically, rather than
      // leaving nothing visible.
      const isNativePicker = !!target.closest(
        'select, input[type="date"], input[type="time"], input[type="datetime-local"], input[type="month"]'
      );
      blockedRef.current = isNativePicker;

      if (isNativePicker) {
        setVisible(false);
        return;
      }

      setHovering(!!target.closest('a, button, [role="button"], input, textarea, .cursor-interactive'));
    }

    function handleLeaveWindow() {
      setVisible(false);
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleOver);
    document.documentElement.addEventListener("mouseleave", handleLeaveWindow);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      document.documentElement.removeEventListener("mouseleave", handleLeaveWindow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!enabled || isAdmin) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 z-[999] pointer-events-none rounded-full border border-sage-500 mix-blend-difference"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        width: hovering ? 44 : 16,
        height: hovering ? 44 : 16,
        opacity: visible ? 1 : 0,
        backgroundColor: hovering ? "rgba(124,138,109,0.15)" : "rgba(124,138,109,0.9)",
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    />
  );
}
