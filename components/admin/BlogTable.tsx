"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { BlogPost } from "@/lib/supabase/types";

export default function BlogTable({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return posts;
    return posts.filter((p) =>
      [p.title, p.category, p.excerpt].some((f) => f.toLowerCase().includes(query.toLowerCase()))
    );
  }, [posts, query]);

  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts by title or category..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-charcoal/15 rounded-lg max-w-md"
        />
      </div>

      <div className="grid gap-4">
        {filtered.map((post) => (
          <Link
            key={post.id}
            href={`/admin/blog/${post.id}`}
            className="flex items-center justify-between bg-white rounded-xl border border-charcoal/10 p-4 hover:border-sage-300"
          >
            <div>
              <p className="font-medium">{post.title}</p>
              <p className="text-xs text-charcoal/50">{post.category}</p>
            </div>
            <span className="text-xs text-charcoal/50">
              {new Date(post.published_at).toLocaleDateString()}
            </span>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-charcoal/40">No posts match your search.</p>
        )}
      </div>
    </div>
  );
}