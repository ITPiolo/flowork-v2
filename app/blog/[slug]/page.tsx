import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Reveal from "@/components/Reveal";
import type { BlogPost } from "@/lib/supabase/types";

export const revalidate = 60;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).single();

  if (!data) notFound();
  const post = data as BlogPost;

  return (
    <article className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
      <Reveal>
        <p className="eyebrow">{post.category}</p>
        <h1 className="font-display text-4xl md:text-5xl mt-3">{post.title}</h1>
        <p className="mt-4 text-sm text-charcoal/50">
          {new Date(post.published_at).toLocaleDateString()}
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mt-8">
          <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
        </div>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="prose prose-neutral max-w-none mt-10 font-body text-charcoal/80 whitespace-pre-line">
          {post.body}
        </div>
      </Reveal>
    </article>
  );
}
