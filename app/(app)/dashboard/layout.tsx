import { AppShell } from "@/components/app/app-shell";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profile }, { data: gym }] = await Promise.all([
    supabase.from("users").select("full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("gyms")
      .select("name")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
  ]);

  return (
    <AppShell ownerName={profile?.full_name ?? user.email ?? "Owner"} gymName={gym?.name}>
      {children}
    </AppShell>
  );
}
