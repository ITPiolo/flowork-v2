import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BlogTable from "@/components/admin/BlogTable";
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
      <BlogTable posts={posts} />
    </div>
  );
}