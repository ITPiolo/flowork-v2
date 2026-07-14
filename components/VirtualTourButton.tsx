"use client";

import { useState } from "react";
import VirtualTour from "@/components/VirtualTour";

export default function VirtualTourButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex items-center rounded-full border border-cream/40 text-cream px-7 py-3.5 text-sm font-medium hover:bg-cream/10 transition-colors"
        }
      >
        Take the 360° Tour
      </button>
      <VirtualTour open={open} onClose={() => setOpen(false)} />
    </>
  );
}