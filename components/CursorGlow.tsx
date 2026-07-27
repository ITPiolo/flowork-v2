"use client";

import { useRef } from "react";

// Wraps a card so a soft light glow follows the cursor on hover,
// implemented with CSS custom properties updated on mousemove — no
// per-frame React state, so it stays cheap even on grids with many cards.
export default function CursorGlow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div ref={ref} onMouseMove={handleMouseMove} className={`cursor-glow relative ${className}`}>
      {children}
    </div>
  );
}
