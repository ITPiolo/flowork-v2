"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Gallery({
  images,
  title = "Gallery",
}: {
  images: string[];
  title?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function next(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (openIndex === null) return;
    setOpenIndex((openIndex + 1) % images.length);
  }
  function prev(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (openIndex === null) return;
    setOpenIndex((openIndex - 1 + images.length) % images.length);
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setOpenIndex(i)}
            className="relative aspect-square rounded-xl overflow-hidden group"
          >
            <Image
              src={src}
              alt={`${title} photo ${i + 1}`}
              fill
              quality={85}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-charcoal/95 flex items-center justify-center p-6"
            onClick={() => setOpenIndex(null)}
          >
            <button
              onClick={() => setOpenIndex(null)}
              aria-label="Close gallery"
              className="absolute top-6 right-6 text-cream/70 hover:text-cream"
            >
              <X size={28} />
            </button>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-4 md:left-8 text-cream/70 hover:text-cream"
            >
              <ChevronLeft size={36} />
            </button>
            <motion.div
              key={openIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-4xl aspect-[4/3]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[openIndex]}
                alt={`${title} full view`}
                fill
                quality={95}
                className="object-contain"
              />
            </motion.div>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-4 md:right-8 text-cream/70 hover:text-cream"
            >
              <ChevronRight size={36} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}