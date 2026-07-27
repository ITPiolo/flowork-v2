import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import CursorGlow from "@/components/CursorGlow";
import type { BlogPost } from "@/lib/supabase/types";

export default function BlogPreview({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {posts.map((post, i) => (
        <Reveal key={post.id} delay={i * 0.1}>
          <Link href={`/blog/${post.slug}`} className="group block">
            <CursorGlow className="aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </CursorGlow>
            <p className="mt-4 text-xs text-sage-600 uppercase tracking-wide">
              {post.category}
            </p>
            <h3 className="mt-1 font-display text-lg leading-snug">{post.title}</h3>
            <p className="mt-2 text-sm text-charcoal/60 line-clamp-2">{post.excerpt}</p>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
