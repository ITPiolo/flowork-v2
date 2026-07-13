import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminBlog() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });
  const posts = (data ?? []) as BlogPost[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-full bg-sage-500 text-cream px-4 py-2 text-sm font-medium"
        >
          + Add post
        </Link>
      </div>
      <div className="grid gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/admin/blog/${post.id}`}
            className="flex items-center justify-between bg-white rounded-xl border border-charcoal/10 p-4 hover:border-sage-300"
          >
            <p className="font-medium">{post.title}</p>
            <span className="text-xs text-charcoal/50">
              {new Date(post.published_at).toLocaleDateString()}
            </span>
          </Link>
        ))}
        {posts.length === 0 && (
          <p className="text-sm text-charcoal/40">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
