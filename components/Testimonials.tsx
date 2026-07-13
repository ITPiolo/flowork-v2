"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "@/components/Reveal";

const QUOTES = [
  {
    quote: "Moving our team into flowork was the easiest office decision we've made. Everything was ready from day one — internet, meeting rooms, even the coffee.",
    role: "Founder, Fintech Startup",
  },
  {
    quote: "The Business Bay location gives us a genuinely prestigious address for client meetings, without the overhead of a traditional lease.",
    role: "Managing Director, Consulting Firm",
  },
  {
    quote: "We scaled from two desks to a full private office in under three months. flowork just moved with us.",
    role: "Operations Lead, Creative Agency",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  function next() {
    setIndex((i) => (i + 1) % QUOTES.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + QUOTES.length) % QUOTES.length);
  }

  return (
    <section className="bg-charcoal text-cream py-24">
      <div className="max-w-content mx-auto px-6 lg:px-8">
        <Reveal>
          <span className="eyebrow text-sage-300">What members say</span>
          <h2 className="font-display text-3xl md:text-4xl mt-2 mb-14 max-w-xl">
            Trusted by the businesses who work here
          </h2>
        </Reveal>

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
                &ldquo;{QUOTES[index].quote}&rdquo;
              </p>
              <p className="mt-6 text-sm text-cream/60">{QUOTES[index].role}</p>
            </motion.div>
          </AnimatePresence>

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
        </div>
      </div>
    </section>
  );
}