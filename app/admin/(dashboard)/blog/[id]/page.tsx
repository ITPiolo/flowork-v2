import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BlogForm from "@/components/admin/BlogForm";
import type { BlogPost } from "@/lib/supabase/types";

export default async function EditBlogPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("*").eq("id", id).single();

  if (!data) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Edit post</h1>
      <BlogForm post={data as BlogPost} />
    </div>
  );
}
