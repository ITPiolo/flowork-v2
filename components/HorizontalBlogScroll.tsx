"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/supabase/types";

// Apple-style horizontal gallery. This time the heading pins together
// with the cards as ONE unit (instead of the heading scrolling away
// separately before the cards take over), which is what was causing
// the overlap/blank-gap glitch before.

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

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return (
      <div className="max-w-content mx-auto px-6 lg:px-8 py-16">
        <span className="eyebrow">From the blog</span>
        <h2 className="font-display text-3xl mt-2 mb-8">Insights &amp; inspiration</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} className="snap-start shrink-0 w-[75vw]" />
          ))}
        </div>
      </div>
    );
  }

  // Only pin/scroll-jack if there's actually enough content to scroll
  // through — otherwise just show a normal static row.
  if (scrollDistance < 10) {
    return (
      <div className="max-w-content mx-auto px-6 lg:px-8 py-16">
        <span className="eyebrow">From the blog</span>
        <h2 className="font-display text-3xl mt-2 mb-8">Insights &amp; inspiration</h2>
        <div className="flex gap-5 flex-wrap">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} className="w-[380px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ height: `calc(70vh + ${scrollDistance}px)` }}>
      <div className="sticky top-0 h-[70vh] min-h-[520px] flex flex-col justify-center overflow-hidden">
        <div className="max-w-content mx-auto px-6 lg:px-8 w-full mb-6">
          <span className="eyebrow">From the blog</span>
          <h2 className="font-display text-3xl mt-2">Insights &amp; inspiration</h2>
        </div>
        <motion.div ref={trackRef} style={{ x }} className="flex gap-5 px-6 lg:px-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} className="shrink-0 w-[320px] sm:w-[360px]" />
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
      <p className="mt-3 text-xs text-sage-600 uppercase tracking-wide">{post.category}</p>
      <h3 className="mt-1 font-display text-lg leading-snug">{post.title}</h3>
      <p className="mt-1.5 text-sm text-charcoal/60 line-clamp-2">{post.excerpt}</p>
    </Link>
  );
}