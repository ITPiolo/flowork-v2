"use client";

import { useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Reveals text by scrambling random characters that settle into the
// real word one at a time, left to right — a common, high-impact
// heading effect on award-tier sites. Runs once when it first scrolls
// into view.
export default function ScrambleText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!started) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    const totalFrames = text.length * 3 + 10;
    let raf: number;

    function tick() {
      const revealCount = Math.floor((frame / totalFrames) * text.length);
      const next = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < revealCount) return text[i];
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join("");
      setDisplay(next);

      frame++;
      if (frame <= totalFrames) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, text]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {display}
    </span>
  );
}
