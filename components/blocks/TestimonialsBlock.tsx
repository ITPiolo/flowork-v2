"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, User } from "lucide-react";

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
    <section className="relative bg-charcoal text-cream py-24 soft-edge-top soft-edge-bottom">
      <div className="max-w-content mx-auto px-6 lg:px-8">
        <span className="eyebrow text-sage-300">{eyebrow}</span>
        <h2 className="font-display text-3xl md:text-4xl mt-2 mb-14 max-w-xl">{heading}</h2>

        <div className="relative max-w-2xl">
          <Quote className="text-sage-500/30" size={72} strokeWidth={1.5} />
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="min-h-[140px]"
            >
              <p className="font-display text-xl md:text-2xl leading-relaxed -mt-2">
                &ldquo;{items[index].quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-6">
                <span className="h-10 w-10 rounded-full bg-sage-500/15 ring-1 ring-sage-400/20 flex items-center justify-center shrink-0">
                  <User size={16} className="text-sage-300" />
                </span>
                <p className="text-sm text-cream/60">{items[index].author}</p>
              </div>
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