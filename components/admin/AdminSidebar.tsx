"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import SignOutButton from "@/components/admin/SignOutButton";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/locations", label: "Locations" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/pricing", label: "Ejari Pricing" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/integrations", label: "Integrations" },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between bg-charcoal text-cream p-4">
        <p className="font-display text-lg">flowork admin</p>
        <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile dropdown nav */}
      {open && (
        <nav className="lg:hidden bg-charcoal text-cream px-4 pb-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-cream/80 hover:bg-cream/10"
            >
              {l.label}
            </Link>
          ))}
          <SignOutButton />
        </nav>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-charcoal text-cream p-6 flex-col shrink-0">
        <p className="font-display text-xl mb-8">flowork admin</p>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-lg px-3 py-2 text-sm text-cream/80 hover:bg-cream/10"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <SignOutButton />
      </aside>
    </>
  );
}