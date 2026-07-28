"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";

export default function Footer() {
  const ref = useRef<HTMLElement>(null);

  // Measures the footer's real (content-driven) height and exposes it
  // as a CSS variable, so the page content wrapper above can reserve
  // exactly that much scroll space — see the --footer-height usage in
  // app/layout.tsx. This is what makes the footer feel "revealed"
  // rather than just appearing at the bottom like any other section:
  // it's pinned in place the whole time, sitting behind the page.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const setHeight = () => {
      document.documentElement.style.setProperty("--footer-height", `${el.offsetHeight}px`);
    };
    setHeight();

    const observer = new ResizeObserver(setHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={ref} className="lg:fixed lg:bottom-0 lg:left-0 lg:right-0 lg:z-0">
      <div className="relative bg-charcoal text-cream overflow-hidden">
        <svg
          className="absolute right-0 top-0 h-full w-1/2 opacity-20 pointer-events-none"
          viewBox="0 0 400 400"
          fill="none"
        >
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M ${380 - i * 30} 0 C ${300 - i * 30} 120, ${420 - i * 30} 260, ${300 - i * 30} 400`}
              stroke="#7C8A6D"
              strokeWidth="2"
            />
          ))}
        </svg>
        <div className="relative max-w-content mx-auto px-6 lg:px-8 py-16">
          <h3 className="font-display text-3xl md:text-4xl max-w-md">
            Stay up to date with our newsletter
          </h3>
          <p className="mt-4 max-w-md text-cream/70 text-sm">
            Be the first to know about new coworking spaces, collaborations,
            and valuable industry insights.
          </p>
          <div className="mt-6 max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="bg-sage-500 text-cream">
        <div className="max-w-content mx-auto px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-2xl mb-3">flowork.</p>
            <p className="text-cream/80">
              Dubai Hills Estate, Business Park, Building 4, 7th Floor, Dubai,
              United Arab Emirates
            </p>
            <p className="mt-3 text-cream/80">+971 4 560 8200</p>
            <p className="text-cream/80">connect@flowork.ae</p>
            <div className="flex gap-3 mt-4">
              <Facebook size={18} />
              <Instagram size={18} />
              <Linkedin size={18} />
            </div>
          </div>
          <div>
            <p className="font-medium mb-3">flowork</p>
            <ul className="space-y-2 text-cream/80">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-3">Services</p>
            <ul className="space-y-2 text-cream/80">
              <li><Link href="/services/private-office">Private Office</Link></li>
              <li><Link href="/services/coworking">Coworking</Link></li>
              <li><Link href="/services/meeting-room">Meeting Room</Link></li>
              <li><Link href="/services/virtual-office">Virtual Office</Link></li>
              <li><Link href="/services/podcast-room">Podcast Room</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-3">Important Links</p>
            <ul className="space-y-2 text-cream/80">
              <li><Link href="/faqs">FAQs</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-cream/70 text-xs py-4 border-t border-cream/10">
          © {new Date().getFullYear()} flowork. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
