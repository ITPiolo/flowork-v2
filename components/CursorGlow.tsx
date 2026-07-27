"use client";

import { useRef } from "react";

// Wraps a card so a soft light glow follows the cursor on hover, and
// the card itself gently tilts in 3D toward the cursor position —
// implemented via direct style writes on mousemove (no per-frame React
// state), so it stays cheap even on grids with many cards.
export default function CursorGlow({
  children,
  className = "",
  tilt = true,
}: {
  children: React.ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--glow-x", `${x}px`);
    el.style.setProperty("--glow-y", `${y}px`);

    if (tilt) {
      const relX = x / rect.width - 0.5; // -0.5..0.5
      const relY = y / rect.height - 0.5;
      el.style.transform = `perspective(800px) rotateX(${relY * -8}deg) rotateY(${relX * 8}deg) scale3d(1.02, 1.02, 1.02)`;
    }
  }

  function handleMouseLeave() {
    if (tilt && ref.current) {
      ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    }
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`cursor-glow relative transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
