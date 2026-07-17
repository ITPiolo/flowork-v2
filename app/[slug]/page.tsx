import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PuckRenderer from "@/components/PuckRenderer";
import type { CustomPage } from "@/lib/supabase/types";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("custom_pages")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) return {};
  const page = data as CustomPage;
  return {
    title: page.title,
    description: page.meta_description ?? undefined,
  };
}

export default async function CustomPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("custom_pages")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) notFound();
  const page = data as CustomPage;

  return <PuckRenderer data={page.content} />;
}