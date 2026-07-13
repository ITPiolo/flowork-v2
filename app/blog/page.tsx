import { createClient } from "@/lib/supabase/server";
import Reveal from "@/components/Reveal";
import BlogFilter from "@/components/BlogFilter";
import type { BlogPost } from "@/lib/supabase/types";

export const revalidate = 60;

export const metadata = {
  title: "Blog",
  description: "Insights, trends, and inspiration from flowork.",
};

export default async function BlogIndex() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });
  const posts = (data ?? []) as BlogPost[];

  return (
    <section className="max-w-content mx-auto px-6 lg:px-8 py-16">
      <Reveal>
        <span className="eyebrow">Insights</span>
        <h1 className="font-display text-4xl md:text-5xl mt-2 mb-10 max-w-xl">
          The flowork blog
        </h1>
      </Reveal>

      {posts.length > 0 ? (
        <BlogFilter posts={posts} />
      ) : (
        <p className="text-charcoal/40">No posts published yet.</p>
      )}
    </section>
  );
}