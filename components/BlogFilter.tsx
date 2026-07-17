"use client";

import { useState, useMemo } from "react";
import HorizontalBlogScroll from "@/components/HorizontalBlogScroll";
import type { BlogPost } from "@/lib/supabase/types";

export default function BlogFilter({ posts }: { posts: BlogPost[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts]
  );
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              active === cat
                ? "bg-sage-500 text-cream"
                : "bg-sage-50 text-charcoal/60 hover:bg-sage-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      {filtered.length > 0 ? (
        <HorizontalBlogScroll posts={filtered} />
      ) : (
        <p className="text-charcoal/40">No posts in this category yet.</p>
      )}
    </div>
  );
}