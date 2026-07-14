"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import type { Location } from "@/lib/supabase/types";

export default function Header({ locations }: { locations: Location[] }) {
  const [open, setOpen] = useState(false);

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
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-charcoal/5">
      <div className="max-w-content mx-auto flex items-center justify-between px-6 lg:px-8 h-20">
        <Link href="/" className="font-display text-2xl">
          <span className="text-sage-500 italic">flo</span>
          <span className="text-charcoal">work.</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
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

        <Link
          href="/#enquire"
          className="hidden lg:inline-flex items-center rounded-full bg-sage-500 text-cream px-5 py-2.5 text-sm font-medium hover:bg-sage-600 transition-colors"
        >
          Enquire Now
        </Link>

        <button
          className="lg:hidden text-charcoal"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-t border-charcoal/5 bg-cream"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-charcoal/80 text-sm"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/#enquire"
                onClick={() => setOpen(false)}
                className="inline-flex justify-center rounded-full bg-sage-500 text-cream px-5 py-2.5 text-sm font-medium"
              >
                Enquire Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}