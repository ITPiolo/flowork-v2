"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import CursorGlow from "@/components/CursorGlow";

export default function ServiceCard({
  href,
  image,
  title,
  description,
  perks,
}: {
  href: string;
  image: string;
  title: string;
  description: string;
  perks: string[];
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link href={href} className="group block">
        <CursorGlow className="aspect-[4/5] rounded-2xl overflow-hidden bg-sage-100">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-4 right-4 z-[2] h-10 w-10 rounded-full bg-cream flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight size={18} className="text-charcoal" />
          </div>
        </CursorGlow>
        <h3 className="mt-4 font-display text-xl">{title}</h3>
        <p className="mt-1 text-sm text-charcoal/60">{description}</p>
        <ul className="mt-3 space-y-1">
          {perks.slice(0, 3).map((p) => (
            <li key={p} className="text-xs text-charcoal/50 flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-sage-500" />
              {p}
            </li>
          ))}
        </ul>
      </Link>
    </motion.div>
  );
}
