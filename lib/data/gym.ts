import { redirect } from "next/navigation";

import { ONBOARDING_PATH } from "@/lib/auth/paths";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

async function syncExpiredMembers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gymId: string
) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: expiredRows, error } = await supabase
    .from("member_membership_status")
    .select("member_id")
    .eq("gym_id", gymId)
    .eq("account_status", "active")
    .lt("end_date", today);

  if (error) {
    throw new Error(error.message);
  }

  const expiredMemberIds = expiredRows?.map((row) => row.member_id).filter(Boolean) ?? [];

  if (expiredMemberIds.length) {
    const { error: updateError } = await supabase
      .from("members")
      .update({ account_status: "inactive" })
      .eq("gym_id", gymId)
      .in("id", expiredMemberIds);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }
}

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

  await syncExpiredMembers(supabase, gym.id);

  return { user, supabase, gym };
}
