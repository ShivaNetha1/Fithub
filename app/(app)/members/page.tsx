import { WorkspaceShell } from "@/components/app/workspace-shell";
import { MemberDirectory } from "@/components/members/member-directory";
import { getOwnerGym } from "@/lib/data/gym";

export const metadata = { title: "Members" };
export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const { user, supabase, gym } = await getOwnerGym();
  const [{ data: members }, { data: plans }, { data: statuses }, { data: subscriptions }] =
    await Promise.all([
      supabase
        .from("members")
        .select("*")
        .eq("gym_id", gym.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("membership_plans")
        .select("id, name")
        .eq("gym_id", gym.id)
        .eq("is_active", true)
        .order("name"),
      supabase.from("member_membership_status").select("*").eq("gym_id", gym.id),
      supabase
        .from("subscriptions")
        .select("id, member_id, base_amount, discount_amount, amount_paid, balance_amount, end_date")
        .eq("gym_id", gym.id)
    ]);

  const defaultMemberCode = getNextMemberCode(members ?? []);

  return (
    <WorkspaceShell ownerName={user.email ?? "Owner"} gym={gym}>
      <MemberDirectory
        members={members ?? []}
        plans={plans ?? []}
        statuses={statuses ?? []}
        subscriptions={subscriptions ?? []}
        defaultMemberCode={defaultMemberCode}
      />
    </WorkspaceShell>
  );
}

function getNextMemberCode(members: Array<{ member_code: string | null | undefined }>) {
  const highest = members.reduce((max, member) => {
    const code = member.member_code ?? "";
    const match = code.match(/(\d+)$/);
    if (!match) return max;
    const value = Number(match[1]);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);

  return `M${String(highest + 1).padStart(3, "0")}`;
}
