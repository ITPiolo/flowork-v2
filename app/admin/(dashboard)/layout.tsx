import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login page itself renders outside this guard via its own route,
  // but as a safety net:
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream font-body">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</div>
    </div>
  );
}