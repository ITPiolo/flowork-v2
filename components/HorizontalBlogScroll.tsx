"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/supabase/types";

// Apple-style "scroll-jacking" horizontal gallery: as the user scrolls
// down through this section, the page appears to pin in place while
// the cards slide horizontally instead — once they've scrolled through
// all the cards, normal vertical scrolling continues.

export default function HorizontalBlogScroll({ posts }: { posts: BlogPost[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    function measure() {
      if (trackRef.current) {
        const trackWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        setScrollDistance(Math.max(trackWidth - viewportWidth, 0));
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [posts]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance]);

  // Reduced-motion / mobile fallback: on small screens, scroll-jacking
  // feels broken rather than slick — just render a normal horizontal
  // scroll strip the user can swipe, no pinning.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4 px-6 -mx-6 snap-x snap-mandatory">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} className="snap-start shrink-0 w-[80vw]" />
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ height: `calc(100vh + ${scrollDistance}px)` }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex gap-8 px-6 lg:px-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} className="shrink-0 w-[85vw] sm:w-[480px] lg:w-[560px]" />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function BlogCard({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <Link href={`/blog/${post.slug}`} className={`group block ${className ?? ""}`}>
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
        <Image
          src={post.cover_image_url}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="mt-4 text-xs text-sage-600 uppercase tracking-wide">{post.category}</p>
      <h3 className="mt-1 font-display text-xl leading-snug">{post.title}</h3>
      <p className="mt-2 text-sm text-charcoal/60 line-clamp-2">{post.excerpt}</p>
    </Link>
  );
}