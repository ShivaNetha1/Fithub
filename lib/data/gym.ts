import { redirect } from "next/navigation";

import { ONBOARDING_PATH } from "@/lib/auth/paths";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function getOwnerGym() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: gym, error } = await supabase
    .from("gyms")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!gym) {
    redirect(ONBOARDING_PATH);
  }

  return { user, supabase, gym };
}
