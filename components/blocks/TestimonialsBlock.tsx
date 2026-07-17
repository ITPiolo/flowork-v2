"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

export default function TestimonialsBlock({
  eyebrow,
  heading,
  quotes,
}: {
  eyebrow: string;
  heading: string;
  quotes: { quote: string; author: string }[];
}) {
  const [index, setIndex] = useState(0);
  const items = quotes && quotes.length > 0 ? quotes : [{ quote: "Add a testimonial quote.", author: "Name, Role" }];

  function next() {
    setIndex((i) => (i + 1) % items.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + items.length) % items.length);
  }

  return (
    <section className="bg-charcoal text-cream py-24">
      <div className="max-w-content mx-auto px-6 lg:px-8">
        <span className="eyebrow text-sage-300">{eyebrow}</span>
        <h2 className="font-display text-3xl md:text-4xl mt-2 mb-14 max-w-xl">{heading}</h2>

        <div className="relative max-w-2xl">
          <Quote className="text-sage-500/40" size={48} />
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="min-h-[140px]"
            >
              <p className="font-display text-xl md:text-2xl leading-relaxed mt-4">
                &ldquo;{items[index].quote}&rdquo;
              </p>
              <p className="mt-6 text-sm text-cream/60">{items[index].author}</p>
            </motion.div>
          </AnimatePresence>

          {items.length > 1 && (
            <div className="flex gap-3 mt-10">
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                className="h-10 w-10 rounded-full border border-cream/20 flex items-center justify-center hover:bg-cream/10 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                aria-label="Next testimonial"
                className="h-10 w-10 rounded-full border border-cream/20 flex items-center justify-center hover:bg-cream/10 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}