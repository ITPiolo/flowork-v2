"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import type { Location } from "@/lib/supabase/types";
import { useEnquiryDrawer } from "@/lib/EnquiryDrawerContext";
import MagneticButton from "@/components/MagneticButton";

export default function Header({ locations }: { locations: Location[] }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { openDrawer } = useEnquiryDrawer();
  const { scrollY } = useScroll();

  // Hides the header on scroll-down (past a small threshold, so it
  // doesn't twitch on tiny scrolls), reveals it again on scroll-up —
  // gives more screen room while reading, without losing nav access.
  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    const diff = current - previous;
    if (open) return; // never hide while the mobile menu is open
    if (current < 80) {
      setHidden(false);
    } else if (diff > 0) {
      setHidden(true);
    } else if (diff < 0) {
      setHidden(false);
    }
  });

  const nav = [
    { label: "Home", href: "/" },
    {
      label: "Locations",
      href: "/locations",
      children: locations.map((l) => ({
        label: l.name,
        href: `/locations/${l.slug}`,
      })),
    },
    { label: "Private Office", href: "/services/private-office" },
    { label: "Coworking", href: "/services/coworking" },
    { label: "Meeting Room", href: "/services/meeting-room" },
    {
      label: "Virtual Office",
      href: "/services/virtual-office",
      children: [{ label: "Ejari Packages", href: "/ejari" }],
    },
    { label: "Podcast Room", href: "/services/podcast-room" },
    { label: "Book a Room", href: "/book" },
  ];

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-charcoal/5"
    >
      <div className="max-w-content mx-auto flex items-center justify-between px-6 lg:px-8 h-20">
        <Link href="/" className="font-display text-2xl">
          <span className="text-sage-500 italic">flo</span>
          <span className="text-charcoal">work.</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-8">
          {nav.map((item) => (
            <div key={item.label} className="relative group py-2">
              <Link
                href={item.href}
                className="flex items-center gap-1 text-sm text-charcoal/80 hover:text-sage-600 transition-colors"
              >
                {item.label}
                {item.children && item.children.length > 0 && <ChevronDown size={14} />}
              </Link>
              {item.children && item.children.length > 0 && (
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white shadow-lg rounded-lg py-2 min-w-[220px] border border-charcoal/5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-charcoal/70 hover:bg-sage-50 hover:text-sage-700"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <MagneticButton className="hidden lg:inline-block">
          <button
            onClick={openDrawer}
            className="inline-flex items-center rounded-full bg-sage-500 text-cream px-5 py-2.5 text-sm font-medium hover:bg-sage-600 transition-colors"
          >
            Enquire Now
          </button>
        </MagneticButton>

        <button
          className="lg:hidden text-charcoal"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-t border-charcoal/5 bg-cream"
          >
            <nav aria-label="Mobile navigation" className="px-6 py-4 flex flex-col gap-4">
              {nav.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-charcoal/80 text-sm"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: nav.length * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  setOpen(false);
                  openDrawer();
                }}
                className="inline-flex justify-center rounded-full bg-sage-500 text-cream px-5 py-2.5 text-sm font-medium"
              >
                Enquire Now
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}