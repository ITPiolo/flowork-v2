import { createClient } from "@/lib/supabase/server";
import NewsletterTable from "@/components/admin/NewsletterTable";

export const dynamic = "force-dynamic";

export default async function NewsletterAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  const subscribers = data ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Newsletter Subscribers</h1>
      <NewsletterTable subscribers={subscribers as { id: string; email: string; created_at: string }[]} />
    </div>
  );
}