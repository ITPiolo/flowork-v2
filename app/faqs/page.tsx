"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";

const FAQS = [
  {
    q: "What is coworking?",
    a: "Coworking is a modern work style where individuals or professionals from different companies work in a shared space. It provides a flexible, collaborative environment that fosters productivity, networking, and community.",
  },
  {
    q: "What types of memberships do you offer?",
    a: "We offer various membership options including access to shared workspaces, private offices, meeting rooms, and amenities — from hot desks to fully private offices, all with flexible contract terms.",
  },
  {
    q: "Can I book a meeting room without being a member?",
    a: "Yes — you can book our meeting rooms and event spaces even if you're not a member. We offer flexible booking options for individuals and businesses who need a professional space for meetings, workshops, or events.",
  },
  {
    q: "Can I bring guests or clients to the coworking space?",
    a: "Absolutely. We understand the importance of collaboration and networking, and we encourage interactions among members and their guests.",
  },
  {
    q: "Are there networking events or community activities at flowork?",
    a: "Yes, we regularly host networking events, workshops, and community activities to foster connections and collaboration among our members.",
  },
  {
    q: "What safety measures are in place?",
    a: "We've implemented secure access systems, CCTV surveillance, regular cleaning and sanitisation, and adherence to health and safety guidelines across both locations.",
  },
];

export default function FAQsPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="max-w-content mx-auto px-6 lg:px-8 py-16 max-w-3xl">
      <Reveal>
        <span className="eyebrow">Support</span>
        <h1 className="font-display text-4xl md:text-5xl mt-2 mb-4">
          Frequently asked questions
        </h1>
        <p className="text-charcoal/60 mb-12">
          Browse helpful answers to common questions about flowork.
        </p>
      </Reveal>

      <div className="divide-y divide-charcoal/10 border-t border-b border-charcoal/10">
        {FAQS.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between py-5 text-left"
            >
              <span className="font-display text-lg pr-4">{item.q}</span>
              <motion.span
                animate={{ rotate: open === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 text-sage-500"
              >
                <ChevronDown size={20} />
              </motion.span>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-charcoal/60 leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}